import type { Decision } from "@tributon/classifier";
import type { Verificacao } from "@tributon/tax-pack";
import type { Politica } from "./types.ts";

/** Auto-certifica só com limiar calibrado, verificação ok e confiança suficiente. */
export function rotear(d: Decision, v: Verificacao, p: Politica): "CERTIFICADO_AUTO" | "EM_REVISAO" {
  if (p.threshold === null) return "EM_REVISAO";
  return v.ok && d.confidence >= p.threshold ? "CERTIFICADO_AUTO" : "EM_REVISAO";
}
