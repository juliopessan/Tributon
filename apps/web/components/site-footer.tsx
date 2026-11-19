import Link from "next/link";
import { FONTES } from "@/lib/fontes";
import { Icone } from "./ledger-icons";

const COLUNA: React.CSSProperties = { display: "grid", gap: 10, alignContent: "start" };

/** Rodapé completo: proposta, produto, fontes (chips com favicon), aviso legal e tema. */
export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line-strong)", marginTop: 64, paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}>
        <div style={COLUNA}>
          <Link className="brand" href="/" aria-label="Tributon, início"><span className="brand__mark">T</span><span className="brand__name">Tributon</span></Link>
          <p className="soft" style={{ margin: 0 }}>Revisão de cadastro para IBS e CBS, entregue com a marca do seu escritório.</p>
          <Link className="link" href="/cadastro">Revisar o cadastro de um cliente <Icone nome="arrow-right" tamanho={16} /></Link>
        </div>
        <nav style={COLUNA} aria-label="Produto">
          <p className="eyebrow" style={{ margin: 0 }}>Produto</p>
          <a href="#como-funciona">Como funciona</a>
          <a href="#receita">Quanto rende</a>
          <a href="#perguntas">Perguntas</a>
          <Link href="/login">Entrar</Link>
        </nav>
        <div className="coluna-chips">
          <p className="eyebrow" style={{ margin: 0 }}>Fontes</p>
          <a href={FONTES.iob} data-url-chip>{FONTES.iob}</a>
          <a href={FONTES.omie} data-url-chip>{FONTES.omie}</a>
          <a href={FONTES.rejeicao} data-url-chip>{FONTES.rejeicao}</a>
          <a href={FONTES.preco} data-url-chip>{FONTES.preco}</a>
        </div>
        <div className="coluna-chips">
          <p className="eyebrow" style={{ margin: 0 }}>Motor de cálculo</p>
          <a href={FONTES.motor} data-url-chip>{FONTES.motor}</a>
          <p className="meta" style={{ margin: 0 }}>Código aberto da Receita Federal, licença MIT. O uso do motor não implica endosso da Receita Federal do Brasil.</p>
        </div>
      </div>
      <div className="foot" style={{ marginTop: 32 }}>
        <span className="meta">© 2026 Tributon. A classificação final é aprovada e assinada pelo contador responsável do seu escritório.</span>
        <nav aria-label="Tema"><button className="icon-btn" type="button" data-theme-toggle aria-label="Tema: automático. Mudar tema"><Icone nome="contrast" /></button></nav>
      </div>
    </footer>
  );
}
