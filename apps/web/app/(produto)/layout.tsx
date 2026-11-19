import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./ledger.css";
import "./tributon.css";
import { LedgerIcons } from "@/components/ledger-icons";
import { LedgerRefresh } from "@/components/ledger-refresh";

const FONTES = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=Instrument+Serif:ital@1&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

export const metadata: Metadata = {
  title: { template: "%s | Tributon", default: "Tributon | Revisão de cadastro para IBS e CBS" },
  description: "Revisão do cadastro de mercadorias para a Reforma Tributária, verificada no motor oficial e entregue com a marca do seu escritório.",
  // O favicon SVG (com o ponto de estado da aba) é criado pelo runtime da Ledger: se o Next também o declarasse,
  // a hidratação recolocaria um segundo rel="icon". Sem JS, vale o .ico alternativo.
  icons: {
    other: [{ rel: "alternate icon", url: "/favicon.ico", sizes: "48x48" }],
    apple: "/apple-touch-icon.png",
  },
  // O runtime da Ledger usa estes metas para redesenhar o favicon com o estado da aba (ponto lime/laranja).
  other: { "ledger:letter": "T", "ledger:product": "Tributon" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1EEE5" },
    { media: "(prefers-color-scheme: dark)", color: "#151310" },
  ],
};

export default function ProdutoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONTES} precedence="default" />
      <div className="progress" aria-hidden="true" />
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <LedgerIcons />
      <div id="toasts" role="status" aria-live="polite" />
      {children}
      <LedgerRefresh />
      <Script src="/ledger.js" strategy="afterInteractive" />
    </>
  );
}
