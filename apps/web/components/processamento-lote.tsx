"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ledger } from "@/lib/ledger-runtime";
import { Verbo } from "./verbo";

/**
 * Enquanto o worker processa: verbo de classificação, ponto lime no favicon da aba
 * e atualização automática. Com erro temporário, ponto laranja; senão, aba em repouso.
 */
export function ProcessamentoLote({ processando, comErro }: { processando: boolean; comErro: boolean }) {
  const router = useRouter();
  useEffect(() => {
    ledger()?.tab?.set({ state: processando ? "live" : comErro ? "error" : "idle" });
    if (!processando) return;
    const t = setInterval(() => router.refresh(), 2500);
    return () => clearInterval(t);
  }, [processando, comErro, router]);
  useEffect(() => () => ledger()?.tab?.set({ state: "idle" }), []);

  if (!processando) return null;
  return (
    <div className="block" role="status" style={{ marginTop: 24 }}>
      <div className="block__body row" style={{ flexWrap: "wrap", gap: 16 }}>
        <Verbo conjunto="classificacao" rotulo="Processando o lote" atraso={0} />
        <span className="soft">Processando o lote. Cada SKU passa pelo classificador e pelo motor oficial; a página atualiza sozinha.</span>
      </div>
    </div>
  );
}
