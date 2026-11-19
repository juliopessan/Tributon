import Link from "next/link";
import { Icone } from "@/components/ledger-icons";
import { SimuladorMargem } from "./simulador-margem";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FONTES } from "@/lib/fontes";

// Estrutura de persuasão: HOOK (dor + promessa) → RE-HOOK (o que está em jogo, com fonte)
// → MEAT (como funciona, por que confiar, quanto rende, objeções) → CTA forte.
// Regra: todo número tem fonte declarada na página; nada inventado.

const RISCO = [
  { n: "93%", l: "dos produtos com inconsistência", d: "2,5 milhões de produtos de 4,5 mil empresas do regime normal: classificação IBS/CBS em branco, NCM descontinuado, GTIN inválido.", f: "IOB, jul/2026", u: FONTES.iob },
  { n: "1024", l: "a rejeição que trava o faturamento", d: "CST e cClassTrib incompatíveis. Quem já preenche os campos passa pelas regras de validação: a nota volta e a venda para.", f: "NT 2025.002 · Portal Contábeis, jun/2026", u: FONTES.rejeicao },
  { n: "68%", l: "dos contadores já foram procurados", d: "Os clientes já estão perguntando sobre a Reforma. Só 5% dos escritórios têm uma estratégia estruturada para responder.", f: "Sondagem Omie do Setor Contábil, 1º sem/2026", u: FONTES.omie },
];

const PASSOS = [
  { t: "Envie o cadastro do cliente", d: "O CSV que o ERP já exporta, com ';' e acentos. Sem integração, sem trocar de sistema." },
  { t: "Receba a fila só com as exceções", d: "Cada SKU sai com CST e cClassTrib escolhidos entre as opções válidas e conferidos no motor oficial. Seu time olha só o que ficou em dúvida." },
  { t: "Assine e entregue com a sua marca", d: "O contador responsável assina o lote. O cliente recebe o relatório e o arquivo para o ERP com o nome e as cores do seu escritório." },
];

const GARANTIAS = [
  { l: "1", r: "Não chuta", t: "Só escolhe entre códigos válidos", d: "O modelo nunca inventa um cClassTrib. Ele escolhe entre os que as tabelas oficiais aceitam para aquele NCM e aquele tipo de venda." },
  { l: "2", r: "Confere", t: "Cada resposta passa no motor oficial", d: "A escolha roda na Calculadora de Tributos de código aberto da Receita Federal antes de chegar ao seu time. Se o motor recusa, ele tenta a próxima opção." },
  { l: "3", r: "Você decide", t: "Humano em toda dúvida", d: "Até o seu escritório calibrar a confiança com 300 revisões, tudo passa pelo seu time. Depois, só as exceções." },
];

const FAQ = [
  { q: "E se um SKU certificado der rejeição?", a: "Nós creditamos o SKU e reclassificamos com prioridade. Você paga por resultado, então o erro é nosso custo, não o seu." },
  { q: "Meu cliente vê a marca de vocês?", a: "Não. O relatório e o arquivo para o ERP saem com o nome, a cor e o logo do seu escritório. Para o cliente, o trabalho é seu." },
  { q: "Preciso trocar o ERP ou integrar alguma coisa?", a: "Não. Você envia o CSV que o ERP já exporta e recebe um CSV pronto para importar." },
  { q: "Quem assina a classificação?", a: "O contador responsável do seu escritório. O Tributon prepara, confere e registra a trilha de cada decisão; a assinatura é profissional." },
  { q: "Atende clientes do Simples Nacional?", a: "Sim. A classificação do produto (NCM, CST e cClassTrib) usa a mesma tabela; o regime do cliente fica registrado no lote e no relatório." },
  { q: "Para onde vão os dados do meu cliente?", a: "Para o modelo de classificação vão só a descrição do produto e o NCM. Nunca CNPJ, preço ou volume." },
];

export default function Landing() {
  return (
    <div className="wrap">
      <SiteHeader />

      <main id="conteudo">
        {/* HOOK */}
        <section className="hero split">
          <div>
            <p className="eyebrow reveal" style={{ ["--d" as string]: ".05s" }}>Para sócios de escritórios contábeis</p>
            <h1 className="display reveal" style={{ ["--d" as string]: ".16s" }} tabIndex={-1}>
              <span style={{ display: "block" }}>Cadastro errado vira nota rejeitada.</span>
              <span className="roll" data-roll="Venda|Prepare|Confira|Entregue" data-roll-delay="2200">Venda</span>{" "}
              <i className="wipe">a correção com a sua marca.</i>
            </h1>
            <p className="lede reveal" style={{ ["--d" as string]: ".27s" }}>
              Desde 3 de agosto de 2026, cada item da NF-e do regime normal precisa de CST e cClassTrib corretos. O Tributon revisa o cadastro inteiro,
              confere cada resposta no motor oficial da Receita e entrega pronto para o seu contador assinar. Uma linha nova de receita, sem contratar ninguém.
            </p>
            <div className="row reveal" style={{ ["--d" as string]: ".38s" }}>
              <Link className="btn" href="/cadastro">Revisar o cadastro de um cliente</Link>
              <a className="link" href="#receita">Ver quanto rende <Icone nome="arrow-right" tamanho={16} /></a>
            </div>
          </div>
          <aside className="panel reveal" style={{ ["--d" as string]: ".3s" }} data-parallax="-0.05" data-tilt aria-label="Quanto o motor reduz as opções de classificação">
            <div className="panel__head"><span className="dot dot--pulse" /><span className="title">Um produto, medido</span><span className="meta">arroz · 10063021</span></div>
            <div className="panel__body">
              <div className="bar bar--cost"><span className="bar__label">Classificações que o motor aceita</span><span className="bar__val count" data-count="85">85</span><div className="bar__track"><span className="bar__fill" style={{ ["--w" as string]: "100%" }} /></div></div>
              <div className="bar bar--save"><span className="bar__label">Opções reais numa venda interna</span><span className="bar__val count" data-count="10">10</span><div className="bar__track"><span className="bar__fill" style={{ ["--w" as string]: "12%" }} /></div></div>
            </div>
            <div className="stats">
              <div><div className="stat__n">200003</div><div className="stat__l">cesta básica, conferido</div></div>
              <div><div className="stat__n">340 ms</div><div className="stat__l">por decisão</div></div>
            </div>
            <p className="note"><span className="flag" aria-hidden="true">✓</span><span>Medido em 18/11/2026 no motor oficial 1.6.1 e no classificador Jev, para um produto. Não é uma média.</span></p>
            <div className="panel__foot"><span>medição única</span><span>sem dado de cliente</span></div>
          </aside>
        </section>

        {/* RE-HOOK */}
        <section className="section section--rule">
          <div className="stack" data-reveal>
            <p className="eyebrow">O que está em jogo</p>
            <h2 className="h2">O problema não é a reforma. <i>É o cadastro.</i></h2>
          </div>
          <div className="cells cells--3" data-reveal-group style={{ marginTop: 40 }}>
            {RISCO.map((r) => (
              <div className="pillar" key={r.n}>
                <div className="kpi__n tnum">{r.n}</div>
                <h3 className="h3">{r.l}</h3>
                <p className="soft">{r.d}</p>
                <p className="meta" style={{ margin: 0 }}>Fonte: {r.f}</p>
                <a href={r.u} data-url-chip>{r.u}</a>
              </div>
            ))}
          </div>
          <p className="lede" style={{ marginTop: 32 }} data-reveal>
            A rejeição automática dos campos vazios foi adiada; a obrigação de preencher, não. Seu cliente vai pagar alguém para arrumar o cadastro.
            <strong> Que seja o escritório dele.</strong>
          </p>
        </section>

        {/* MEAT: como funciona */}
        <section className="section section--rule" id="como-funciona">
          <div className="stack" data-reveal><p className="eyebrow">Como funciona</p><h2 className="h2">Do arquivo do ERP <i>ao lote assinado.</i></h2></div>
          <div className="rail" data-reveal-group style={{ marginTop: 48 }}>
            {PASSOS.map((p, i) => (
              <div className="rail__step" key={p.t}><span className="rail__n">{i + 1}</span><h3 className="h3">{p.t}</h3><p className="soft">{p.d}</p></div>
            ))}
          </div>
        </section>

        {/* MEAT: por que confiar */}
        <section className="section section--rule">
          <div className="stack" data-reveal><p className="eyebrow">Por que confiar</p><h2 className="h2">Feito para quem assina, <i>não para quem chuta.</i></h2></div>
          <div className="cells cells--3" data-reveal-group style={{ marginTop: 40 }}>
            {GARANTIAS.map((g) => (
              <div className="pillar" key={g.l}><span className="tile tile--ink">{g.l}</span><span className="pillar__role">{g.r}</span><h3 className="h3">{g.t}</h3><p className="soft">{g.d}</p></div>
            ))}
          </div>
        </section>

        {/* MEAT: quanto rende */}
        <section className="section section--rule" id="receita">
          <div className="stack" data-reveal>
            <p className="eyebrow">Quanto rende</p>
            <h2 className="h2">Uma linha nova de receita, <i>sem contratar.</i></h2>
          </div>
          <p className="lede" style={{ marginTop: 24 }}>
            Escritórios já cobram em torno de R$ 500 por revisão de cadastro. Você define o preço para o seu cliente; nós cobramos só por SKU certificado.
            Item pendente com o cliente ou fora do escopo não é cobrado.
          </p>
          <div style={{ marginTop: 32 }} data-reveal><SimuladorMargem /></div>
        </section>

        {/* MEAT: objeções */}
        <section className="section section--rule" id="perguntas">
          <div className="stack" data-reveal><p className="eyebrow">Perguntas</p><h2 className="h2">Antes de colocar o nome <i>do seu escritório.</i></h2></div>
          <div className="faq" data-reveal style={{ marginTop: 32 }}>
            {FAQ.map((f) => (
              <details key={f.q}><summary>{f.q} <Icone nome="plus" /></summary><p>{f.a}</p></details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section section--rule">
          <div className="stack" data-reveal>
            <p className="eyebrow">Piloto</p>
            <h2 className="h2">Quem revisar primeiro <i>fica com o cliente.</i></h2>
            <p className="lede" style={{ marginTop: 16 }}>
              Comece pelo cadastro de um cliente. Em vez de passar dias conferindo planilha, seu time revisa só as exceções e você entrega com a sua marca.
            </p>
            <div className="row" style={{ marginTop: 28 }}>
              <Link className="btn" href="/cadastro">Revisar o cadastro de um cliente</Link>
              <Link className="link" href="/login">Já tenho conta <Icone nome="arrow-right" tamanho={16} /></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
