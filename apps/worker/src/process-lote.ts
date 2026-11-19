import type { DecisionBackend } from "@tributon/classifier";
import { CandidateIndex, type Cenario, type EngineClient } from "@tributon/tax-pack";
import { executarSku, POLITICA_PADRAO, type SkuResultado } from "@tributon/pipeline";
import { repos, type Client, type Db, type SkuPatch, type SkuRow } from "@tributon/db";

export type DepsLote = {
  backend: DecisionBackend;
  engine: Pick<EngineClient, "versao" | "ncmExiste" | "classificacoes" | "ncmAplicavel" | "calcularItem">;
  cenario?: Cenario;
  municipio?: number;
  uf?: string;
  concurrency?: number;
};

/** O worker perdeu a concessão (outro assumiu, ou o lote não está mais em processamento): para sem gravar. */
export class ConcessaoPerdidaError extends Error {
  constructor(loteId: string) {
    super(`concessão do lote ${loteId} perdida`);
    this.name = "ConcessaoPerdidaError";
  }
}

/**
 * Processa os SKUs NA_FILA/ERRO_TEMPORARIO de um lote. É idempotente e retomável:
 * rodar de novo só reprocessa o que não terminou. A conexão sem RLS é usada só
 * para descobrir o escritório; todo o resto roda dentro do tenant do lote.
 */
export async function processarLote(db: Db, loteId: string, deps: DepsLote, reivindicacao?: string): Promise<{ processados: number; temporarios: number }> {
  // Sem token (chamada direta), reivindica o lote agora; lote concluído nunca é reaberto.
  const token = reivindicacao ?? (await reivindicarLote(db, loteId));
  if (!token) throw new ConcessaoPerdidaError(loteId);

  const escritorioId = await db.withSystem(async (c) => {
    const r = await c.query<{ escritorio_id: string }>("SELECT escritorio_id FROM lotes WHERE id = $1", [loteId]);
    return r.rows[0]?.escritorio_id;
  });
  if (!escritorioId) throw new Error(`lote ${loteId} não encontrado`);

  const inTenant = <T>(fn: (c: Client) => Promise<T>) => db.withTenant(escritorioId, fn);
  /** Na mesma transação da gravação: confirma (e renova) a concessão, travando a linha do lote até o commit. */
  const comConcessao = <T>(fn: (c: Client) => Promise<T>) =>
    inTenant(async (c) => {
      const ok = await c.query("UPDATE lotes SET reivindicado_em = now() WHERE id = $1 AND reivindicacao = $2 AND status = 'PROCESSANDO' RETURNING id", [loteId, token]);
      if (ok.rowCount === 0) throw new ConcessaoPerdidaError(loteId);
      return fn(c);
    });

  const lote = (await inTenant((c) => repos.obterLote(c, loteId)))!;
  const motorAtual = await deps.engine.versao();
  const todos = await inTenant((c) => repos.listarSkus(c, loteId));
  const fila = todos.filter((s) => s.status === "NA_FILA" || s.status === "ERRO_TEMPORARIO");

  // A versão do motor é fixada no primeiro processamento: retomar com outra versão misturaria evidências.
  if (lote.motorVersao && lote.motorVersao !== motorAtual) {
    const motivo = `versão do motor mudou: lote em ${lote.motorVersao}, motor em ${motorAtual}`;
    await comConcessao(async (c) => {
      for (const sku of fila) await repos.atualizarSku(c, sku.id, { motivo });
      await repos.registrarEvento(c, { loteId, tipo: "motor_divergente", dados: { lote: lote.motorVersao, motor: motorAtual } });
      await c.query("UPDATE lotes SET status = 'EM_REVISAO' WHERE id = $1 AND reivindicacao = $2", [loteId, token]);
    });
    return { processados: 0, temporarios: 0 };
  }
  const motorVersao = lote.motorVersao ?? motorAtual;
  await comConcessao((c) => repos.atualizarLote(c, loteId, { motorVersao }));

  const ctx = {
    data: lote.dataReferencia,
    municipio: deps.municipio ?? Number(process.env.VERIFY_MUNICIPIO ?? 4314902),
    uf: deps.uf ?? process.env.VERIFY_UF ?? "RS",
    motorVersao,
  };
  const index = new CandidateIndex(deps.engine, ctx.data, deps.cenario ? { cenario: deps.cenario } : {});
  const politica = { ...POLITICA_PADRAO, threshold: lote.threshold };

  let temporarios = 0;
  await forEachLimit(fila, deps.concurrency ?? 8, async (sku) => {
    let r: SkuResultado;
    try {
      r = await executarSku(
        { codigo: sku.codigo, descricao: sku.descricao, ncmBruto: sku.ncmBruto, ...(sku.gtin ? { gtin: sku.gtin } : {}) },
        { index, backend: deps.backend, engine: deps.engine, ctx, politica },
      );
    } catch (err) {
      // Um SKU problemático não pode travar o lote: vai para revisão humana.
      r = { status: "EM_REVISAO", ncm: null, motivo: `erro inesperado: ${(err as Error).message}`, tentativas: 0 };
    }
    if (r.status === "ERRO_TEMPORARIO") temporarios++;
    await comConcessao(async (c) => {
      await repos.atualizarSku(c, sku.id, patchDe(sku, r));
      await repos.registrarEvento(c, {
        loteId,
        skuId: sku.id,
        tipo: "sku_processado",
        dados: {
          status: r.status,
          escolhido: r.escolhido?.codigo ?? null,
          confianca: r.decisao?.confidence ?? null,
          backend: r.decisao?.backend ?? null,
          modelo: r.decisao?.modelVersion ?? null,
          motorVersao,
          cenario: deps.cenario?.versao ?? "venda-interna-v1",
        },
      });
    });
  });

  await comConcessao((c) => c.query("UPDATE lotes SET status = 'EM_REVISAO' WHERE id = $1 AND reivindicacao = $2", [loteId, token]));
  return { processados: fila.length, temporarios };
}

function patchDe(sku: SkuRow, r: SkuResultado): SkuPatch {
  // A primeira escolha do modelo (antes de qualquer recusa do motor) é gravada uma única vez:
  // é o rótulo de referência da calibração.
  const primeira = r.primeiraDecisao ?? (r.decisao && r.decisao.backend !== "deterministico" ? r.decisao : undefined);
  const gravar = primeira && sku.escolhaModelo === null;
  return {
    ...(gravar ? { escolhaModelo: primeira!.choice, confiancaModelo: primeira!.confidence, backendModelo: primeira!.backend } : {}),
    status: r.status,
    ncm: r.ncm,
    cst: r.escolhido?.cst ?? null,
    cClassTrib: r.escolhido?.codigo ?? null,
    confianca: r.decisao?.confidence ?? null,
    probabilidades: r.decisao?.probabilities ?? null,
    candidatos: r.candidatos ?? null,
    verificacao: (r.verificacao as Record<string, unknown> | undefined) ?? null,
    motivo: r.motivo ?? null,
    tentativas: sku.tentativas + r.tentativas,
  };
}

/** Concessão: sem renovação por este tempo, um lote PROCESSANDO volta a ser reivindicável. */
export const CONCESSAO_MINUTOS = 10;

/** Reivindica um lote específico (NA_FILA ou EM_REVISAO, nunca CONCLUIDO) e devolve o token da concessão. */
async function reivindicarLote(db: Db, loteId: string): Promise<string | null> {
  return db.withSystem(async (c) => {
    const r = await c.query<{ reivindicacao: string }>(
      `UPDATE lotes SET status = 'PROCESSANDO', reivindicado_em = now(), reivindicacao = gen_random_uuid()
       WHERE id = $1 AND status IN ('NA_FILA', 'EM_REVISAO') RETURNING reivindicacao`,
      [loteId],
    );
    return r.rows[0]?.reivindicacao ?? null;
  });
}

/** Pega o lote NA_FILA mais antigo (ou um PROCESSANDO abandonado) e o marca PROCESSANDO com um token novo de concessão. */
export async function reivindicarProximoLote(db: Db): Promise<{ loteId: string; escritorioId: string; reivindicacao: string } | null> {
  return db.withSystem(async (c) => {
    const r = await c.query<{ id: string; escritorio_id: string; reivindicacao: string }>(
      `UPDATE lotes SET status = 'PROCESSANDO', reivindicado_em = now(), reivindicacao = gen_random_uuid()
       WHERE id = (
         SELECT id FROM lotes
         WHERE status = 'NA_FILA'
            OR (status = 'PROCESSANDO' AND (reivindicado_em IS NULL OR reivindicado_em < now() - make_interval(mins => $1)))
         ORDER BY criado_em FOR UPDATE SKIP LOCKED LIMIT 1)
       RETURNING id, escritorio_id, reivindicacao`,
      [CONCESSAO_MINUTOS],
    );
    const row = r.rows[0];
    return row ? { loteId: row.id, escritorioId: row.escritorio_id, reivindicacao: row.reivindicacao } : null;
  });
}

async function forEachLimit<T>(items: T[], limit: number, fn: (t: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]!);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
