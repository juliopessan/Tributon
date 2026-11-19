"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icone } from "./ledger-icons";
import { Verbo } from "./verbo";

export function AcoesLote({ loteId, podeAssinar, podeReprocessar }: { loteId: string; podeAssinar: boolean; podeReprocessar: boolean }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  async function post(path: string) {
    setErro(null);
    setOcupado(path);
    const res = await fetch(`/api/lotes/${loteId}/${path}`, { method: "POST" }).catch(() => null);
    setOcupado(null);
    if (!res?.ok) return setErro(res ? (((await res.json().catch(() => ({}))) as { erro?: string }).erro ?? "A ação não foi concluída.") : "Sem conexão com o servidor.");
    router.refresh();
  }
  if (!podeAssinar && !podeReprocessar) return null;
  return (
    <div className="row" style={{ flexWrap: "wrap" }}>
      {podeReprocessar && <button className="btn btn--line" onClick={() => post("reprocessar")}><Icone nome="sync" />Reprocessar erros temporários</button>}
      {podeAssinar && <button className="btn" onClick={() => post("concluir")} disabled={ocupado !== null} aria-busy={ocupado === "concluir"}>{ocupado === "concluir" ? <Verbo conjunto="registro" rotulo="Assinando o lote" relogio={false} atraso={120} /> : "Concluir e assinar lote"}</button>}
      {erro && <p className="field-error" role="alert" style={{ display: "flex", margin: 0 }}><Icone nome="error" tamanho={16} /><span>{erro}</span></p>}
    </div>
  );
}
