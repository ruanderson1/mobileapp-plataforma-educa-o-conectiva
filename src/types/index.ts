export type StatusBadgeLabel =
  | "Bom"
  | "Atenção"
  | "Cuidado"
  | "Baixo"
  | "Médio"
  | "Alto"
  | "Sim"
  | "Não";

export interface Parent {
  id: string;
  name: string;
  email: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  status: Extract<StatusBadgeLabel, "Bom" | "Atenção" | "Cuidado">;
  summary: string;
}

export interface CurrentReport {
  periodo_referencia: string;
  desempenho_geral: Extract<StatusBadgeLabel, "Baixo" | "Médio" | "Alto">;
  engajamento: Extract<StatusBadgeLabel, "Baixo" | "Médio" | "Alto">;
  risco_desengajamento: Extract<StatusBadgeLabel, "Baixo" | "Médio" | "Alto">;
  necessita_intervencao: boolean;
  resumo_llm: string;
  dificuldades_aprendizagem: string;
  recomendacao_para_pais: string;
  plano_acao_sugerido: string;
}

export interface GeneratedReport extends CurrentReport {
  id: number;
  status: Extract<StatusBadgeLabel, "Bom" | "Atenção" | "Cuidado">;
  generatedAt: string;
}

export interface Activity {
  id: number;
  tipo: string;
  notaMaxima: number;
  pontuacao: number;
  peso: number;
  observacoes: string;
}

export interface ReportHistoryItem {
  id: string;
  periodo: string;
  status: Extract<StatusBadgeLabel, "Bom" | "Atenção" | "Cuidado">;
  resumo: string;
  detalhes: CurrentReport;
}

export interface ParentObservation {
  id: string;
  studentId: string;
  text: string;
  authorType: "parent" | "teacher";
  authorLabel: string;
  createdAt: string;
}

export interface LoginResult {
  sucesso: boolean;
  mensagem: string;
}

export interface ResponsavelChildLink {
  codigoSala: string;
  codigoFilho: string;
}

export interface ResponsavelRegisterInput {
  nome: string;
  email: string;
  senha: string;
  vinculosFilhos: ResponsavelChildLink[];
}

export interface ResponsavelRegisterResult {
  sucesso: boolean;
  mensagem: string;
}