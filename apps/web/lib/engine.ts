import { EngineClient } from "@tributon/tax-pack";

type Motor = Pick<EngineClient, "versao" | "calcularItem" | "classificacoes">;
let engine: Motor | undefined;

/** Cliente do motor oficial (ENGINE_URL). Usado para verificar decisões humanas e mostrar descrições das tabelas. */
export function getEngine(): Motor | null {
  if (engine) return engine;
  const url = process.env.ENGINE_URL;
  if (!url) return null;
  engine = new EngineClient({ baseUrl: url });
  return engine;
}

export function setEngineForTests(e: Motor): void {
  engine = e;
}
