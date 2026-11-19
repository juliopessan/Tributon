import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { carregarRelatorio } from "@/lib/relatorio";
import { RelatorioView } from "@/components/relatorio-view";
import "./relatorio.css";

export const dynamic = "force-dynamic";
// Sem favicon do produto: o relatório é white-label (um SVG vazio evita o /favicon.ico padrão).
export const metadata: Metadata = {
  title: "Relatório de cadastro fiscal",
  robots: { index: false, follow: false },
  icons: { icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E" },
};

export default async function Relatorio({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dados = await carregarRelatorio(token);
  if (!dados) notFound();
  return <RelatorioView dados={dados} />;
}
