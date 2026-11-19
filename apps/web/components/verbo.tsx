"use client";
import { useEffect, useRef } from "react";
import { VERBOS, type ConjuntoVerbo } from "@/lib/verbos";
import { ledger } from "@/lib/ledger-runtime";

/**
 * Wait state da Ledger (quadrado que marca o tempo + verbo + relógio), com verbos em português.
 * O <span> não tem filhos React: o ledger.js desenha dentro dele sem conflitar com a reconciliação.
 * Sem o runtime (JS bloqueado), mostra o primeiro verbo parado.
 */
export function Verbo({ conjunto, rotulo, relogio = true, atraso }: { conjunto: ConjuntoVerbo; rotulo: string; relogio?: boolean; atraso?: number }) {
  const host = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const L = ledger();
    const el = host.current;
    if (!el) return;
    if (!L?.verbs) {
      el.textContent = `${VERBOS[conjunto][0]![0]}...`;
      return;
    }
    const run = L.verbs.start(el, { set: VERBOS[conjunto], label: rotulo, elapsed: relogio, ...(atraso !== undefined ? { delay: atraso } : {}) });
    return () => run.stop();
  }, [conjunto, rotulo, relogio, atraso]);
  return <span ref={host} />;
}
