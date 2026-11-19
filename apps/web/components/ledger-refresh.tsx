"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ledger } from "@/lib/ledger-runtime";

/**
 * Na navegação interna do Next, reaplica a Ledger ao conteúdo recém-montado:
 * revelação de blocos, roller do hero e chips de URL. Também devolve a aba ao estado de repouso.
 */
export function LedgerRefresh() {
  const pathname = usePathname();
  useEffect(() => {
    const L = ledger();
    try {
      L?.motion?.scan?.(document);
      L?.motion?.refresh?.();
      L?.roll?.(document);
      L?.urlChip?.(document);
    } catch {
      document.querySelectorAll("[data-reveal],[data-reveal-group]").forEach((el) => el.classList.add("is-in"));
    }
  }, [pathname]);
  return null;
}
