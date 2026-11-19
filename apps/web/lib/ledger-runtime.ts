/** Acesso tipado ao runtime da Ledger (public/ledger.js), quando carregado. */
export type Execucao = { done: (w?: string) => Promise<unknown>; fail: (m?: string) => Promise<unknown>; stop: () => void };
export type LedgerRuntime = {
  verbs?: { start: (host: HTMLElement, o: Record<string, unknown>) => Execucao };
  tab?: { set: (o: { title?: string; state?: "idle" | "live" | "error" }) => void };
  motion?: { scan?: (root: Document) => void; refresh?: () => void };
  roll?: (root?: Document) => void;
  urlChip?: (root?: Document) => void;
  toast?: (msg: string, o?: { kind?: "ok" | "err" }) => void;
};

export function ledger(): LedgerRuntime | undefined {
  return typeof window === "undefined" ? undefined : (window as unknown as { Ledger?: LedgerRuntime }).Ledger;
}
