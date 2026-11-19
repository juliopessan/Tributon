import Link from "next/link";

/** Masthead do site: marca, navegação, ação secundária e selo de status (Ledger: um único elemento com borda). */
export function SiteHeader() {
  return (
    <header className="mast reveal" style={{ ["--d" as string]: ".05s", position: "sticky", top: 0, zIndex: 20, background: "var(--paper)" }}>
      <Link className="brand" href="/" aria-label="Tributon, início"><span className="brand__mark">T</span><span className="brand__name">Tributon</span></Link>
      <nav className="mast__nav" aria-label="Principal">
        <a href="#como-funciona">Como funciona</a>
        <a href="#receita">Quanto rende</a>
        <a href="#perguntas">Perguntas</a>
        <Link href="/login">Entrar</Link>
      </nav>
      <span className="badge"><span className="dot dot--pulse" />Piloto aberto</span>
    </header>
  );
}
