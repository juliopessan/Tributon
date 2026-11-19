import { repos } from "@tributon/db";
import { normalizarNcm, verificar, type Candidato } from "@tributon/tax-pack";
import { getEngine } from "@/lib/engine";
import { getDb } from "@/lib/db";
import { exigirSessao, jsonResp, lerJson, rotaComParams, RespostaHttp } from "@/lib/auth";

type Corpo = { acao?: "aprovar" | "trocar" | "devolver"; cClassTrib?: string; justificativa?: string };

export const POST = rotaComParams(async (req, { params }) => {
  const s = await exigirSessao(req);
  const { id } = await params;
  const b = await lerJson<Corpo>(req);
  if (!b.acao || !["aprovar", "trocar", "devolver"].includes(b.acao)) throw new RespostaHttp(422, "Ação inválida");

  return getDb().withTenant(s.escritorioId, async (c) => {
    const sku = await repos.obterSku(c, id!);
    if (!sku) throw new RespostaHttp(404, "SKU não encontrado");
    const lote = await repos.travarLote(c, sku.loteId);
    if (lote?.status !== "EM_REVISAO") throw new RespostaHttp(409, "O lote não está em revisão");

    const candidatos = (sku.candidatos ?? []) as Candidato[];
    let patch: Parameters<typeof repos.atualizarSku>[2];
    if (b.acao === "devolver") {
      patch = { status: "PENDENTE_CLIENTE", motivo: b.justificativa?.trim() || "Devolvido ao cliente para conferência", revisadoPor: s.usuarioId };
    } else {
      const codigo = b.acao === "trocar" ? b.cClassTrib : sku.cClassTrib;
      const escolhido = candidatos.find((x) => x.codigo === codigo);
      if (!escolhido) throw new RespostaHttp(422, "cClassTrib fora dos candidatos válidos");
      // O código final precisa passar no motor oficial antes de virar certificado (e a evidência é a dele).
      const ncm = sku.ncm ?? normalizarNcm(sku.ncmBruto);
      if (!ncm) throw new RespostaHttp(422, "NCM inválido: devolva ao cliente para corrigir o cadastro");
      const motor = getEngine();
      if (!motor) throw new RespostaHttp(503, "Motor de cálculo indisponível; tente de novo em instantes");
      let verificacao;
      try {
        const ctx = { data: lote.dataReferencia, municipio: Number(process.env.VERIFY_MUNICIPIO ?? 4314902), uf: process.env.VERIFY_UF ?? "RS" };
        verificacao = await verificar(motor, ncm, escolhido, { ...ctx, motorVersao: lote.motorVersao ?? (await motor.versao()) });
      } catch {
        throw new RespostaHttp(503, "Motor de cálculo indisponível; tente de novo em instantes");
      }
      if (!verificacao.ok) {
        const codigos = verificacao.erros.map((e) => e.code).join(", ") || verificacao.estadoItem;
        throw new RespostaHttp(422, `O motor oficial recusou ${escolhido.codigo} para este NCM (${codigos}). Escolha outra classificação ou devolva ao cliente.`);
      }
      patch = { status: "CERTIFICADO_REVISADO", cst: escolhido.cst, cClassTrib: escolhido.codigo, revisadoPor: s.usuarioId, verificacao: verificacao as unknown as Record<string, unknown> };
    }
    await repos.atualizarSku(c, sku.id, patch);
    await repos.registrarEvento(c, {
      loteId: sku.loteId,
      skuId: sku.id,
      usuarioId: s.usuarioId,
      tipo: "sku_decidido",
      dados: { acao: b.acao, de: sku.cClassTrib, para: patch.cClassTrib ?? null, justificativa: b.justificativa ?? null },
    });
    return jsonResp(200, { id: sku.id, status: patch.status, cClassTrib: patch.cClassTrib ?? sku.cClassTrib });
  });
});
