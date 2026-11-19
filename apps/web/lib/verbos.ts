/**
 * Spinning verbs em português: [presente, passado]. Vocabulário de escritório contábil,
 * verdadeiro para a operação que acontece (regra da Ledger: o verbo precisa ser defensável).
 */
export type ParVerbo = [string, string];

export const VERBOS: Record<"acesso" | "arquivo" | "classificacao" | "registro", ParVerbo[]> = {
  acesso: [["Verificando", "Verificado"], ["Conferindo", "Conferido"], ["Validando", "Validado"], ["Autenticando", "Autenticado"]],
  arquivo: [["Lendo", "Lido"], ["Importando", "Importado"], ["Separando", "Separado"], ["Carimbando", "Carimbado"], ["Arquivando", "Arquivado"]],
  classificacao: [["Classificando", "Classificado"], ["Conferindo", "Conferido"], ["Enquadrando", "Enquadrado"], ["Verificando", "Verificado"], ["Apurando", "Apurado"], ["Ponderando", "Ponderado"]],
  registro: [["Lançando", "Lançado"], ["Registrando", "Registrado"], ["Conciliando", "Conciliado"], ["Assinando", "Assinado"]],
};

export type ConjuntoVerbo = keyof typeof VERBOS;
