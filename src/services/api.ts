import {
  Activity,
  CurrentReport,
  LoginResult,
  ParentObservation,
  Parent,
  ReportHistoryItem,
  ResponsavelRegisterInput,
  ResponsavelRegisterResult,
  Student,
} from "../types";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

type StudentLLMReportResponse = {
  id: string;
  periodo_referencia: string;
  created_at: string;
  academico: {
    desempenho_geral: string;
    dificuldades_aprendizagem: string;
  };
  emocional: {
    engajamento: string;
  };
  risco: {
    risco_desengajamento: string;
    necessita_intervencao: string;
  };
  saida_llm: {
    resumo_llm: string;
    recomendacao_para_pais: string;
    plano_acao_sugerido: string;
  };
};

type StudentDetailsResponse = {
  _id: string;
  nome: string;
  notas: Array<{
    tipo: string;
    notaMaxima?: number;
    pontuacao?: number;
    peso?: number;
    observacoes?: string;
  }>;
};

type ParentChildrenResponse = {
  children: Array<{
    id: string;
    nome: string;
    codigo_filho: string;
    sala_nome: string;
    sala_ano_turma: string;
  }>;
};

type StudentObservationResponse = {
  id: string;
  student_id: string;
  periodo_referencia: string;
  observacao_professor: string;
  observacao_pais: string;
  created_at: string;
};

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

let authToken = "";
let currentParent: Parent | null = null;
let cachedChildren: Student[] = [];

const apiURL = (path: string) => `${API_BASE_URL}/api${path}`;

const currentPeriodoReferencia = () =>
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

const mapObservation = (item: StudentObservationResponse): ParentObservation => {
  const parentText = (item.observacao_pais ?? "").trim();
  const teacherText = (item.observacao_professor ?? "").trim();
  const isParentObservation = parentText !== "";

  return {
    id: item.id,
    studentId: item.student_id,
    text: isParentObservation ? parentText : teacherText,
    authorType: isParentObservation ? "parent" : "teacher",
    authorLabel: isParentObservation ? "Responsável" : "Professor",
    createdAt: item.created_at,
  };
};

const toRiskLevel = (value: string): "Baixo" | "Médio" | "Alto" => {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("alto")) return "Alto";
  if (normalized.startsWith("baixo")) return "Baixo";
  return "Médio";
};

const toStatusFromRisk = (risco: "Baixo" | "Médio" | "Alto"): "Bom" | "Atenção" | "Cuidado" => {
  if (risco === "Alto") return "Cuidado";
  if (risco === "Médio") return "Atenção";
  return "Bom";
};

const toInterventionFlag = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "sim";
};

const request = async <T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  authenticated = false,
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authenticated) {
    if (!authToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(apiURL(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const fallback = "Não foi possível concluir a solicitação.";
    let apiMessage = "";
    try {
      const data = (await response.json()) as { error?: string };
      apiMessage = (data.error || "").trim();
    } catch {
      apiMessage = "";
    }

    const apiError = apiMessage.toLowerCase();
    if (apiError === "invalid credentials") {
      throw new Error("E-mail ou senha inválidos.");
    }
    if (apiError === "invalid input") {
      throw new Error("Dados inválidos. Verifique os campos e tente novamente.");
    }
    throw new Error(apiMessage || fallback);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
};

const mapReportToCurrent = (report: StudentLLMReportResponse): CurrentReport => ({
  periodo_referencia: report.periodo_referencia,
  desempenho_geral: toRiskLevel(report.academico?.desempenho_geral ?? "medio"),
  engajamento: toRiskLevel(report.emocional?.engajamento ?? "medio"),
  risco_desengajamento: toRiskLevel(report.risco?.risco_desengajamento ?? "medio"),
  necessita_intervencao: toInterventionFlag(report.risco?.necessita_intervencao ?? "false"),
  resumo_llm: report.saida_llm?.resumo_llm ?? "Ainda não há resumo disponível.",
  dificuldades_aprendizagem:
    report.academico?.dificuldades_aprendizagem ?? "Sem dificuldades registradas no período.",
  recomendacao_para_pais:
    report.saida_llm?.recomendacao_para_pais ?? "Sem recomendação para pais no momento.",
  plano_acao_sugerido:
    report.saida_llm?.plano_acao_sugerido ?? "Sem plano de ação sugerido no momento.",
});

export const getCurrentParent = () => currentParent;

export const loginResponsavel = async (identifier: string, password: string): Promise<LoginResult> => {
  const email = identifier.trim().toLowerCase();
  const senha = password.trim();

  if (!email || !senha) {
    return {
      sucesso: false,
      mensagem: "Preencha e-mail e senha para entrar.",
    };
  }

  try {
    const payload = await request<{ token: string; user: AuthUserResponse }>(
      "/auth/responsavel/login",
      "POST",
      {
        email,
        senha,
      },
    );

    authToken = payload.token;
    currentParent = {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
    };
    cachedChildren = [];

    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: error instanceof Error ? error.message : "Falha ao autenticar.",
    };
  }
};

export const registerResponsavel = async (
  payload: ResponsavelRegisterInput,
): Promise<ResponsavelRegisterResult> => {
  const vinculosFilhos = payload.vinculosFilhos
    .map((item) => ({
      codigoSala: item.codigoSala.trim().toUpperCase(),
      codigoFilho: item.codigoFilho.trim().toUpperCase(),
    }))
    .filter((item) => item.codigoSala !== "" && item.codigoFilho !== "");

  const temCamposObrigatorios =
    payload.nome.trim() !== "" &&
    payload.email.trim() !== "" &&
    payload.senha.trim() !== "" &&
    vinculosFilhos.length > 0;

  if (!temCamposObrigatorios) {
    return {
      sucesso: false,
      mensagem: "Preencha todos os campos para concluir o cadastro.",
    };
  }

  try {
    await request<{ user: AuthUserResponse }>("/auth/responsavel/register", "POST", {
      nome: payload.nome,
      email: payload.email.trim().toLowerCase(),
      senha: payload.senha,
      vinculos_filhos: vinculosFilhos.map((item) => ({
        codigo_sala: item.codigoSala,
        codigo_filho: item.codigoFilho,
      })),
    });

    return {
      sucesso: true,
      mensagem: "Cadastro realizado com sucesso. Faça seu login para continuar.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: error instanceof Error ? error.message : "Não foi possível concluir o cadastro.",
    };
  }
};

export const getChildren = async (): Promise<Student[]> => {
  const payload = await request<ParentChildrenResponse>("/responsavel/children", "GET", undefined, true);

  const children: Student[] = payload.children.map((child) => ({
    id: child.id,
    name: child.nome,
    className: `${child.sala_ano_turma} - ${child.sala_nome}`,
    status: "Bom",
    summary: "Acompanhamento disponível para visualização.",
  }));

  cachedChildren = children;
  return children;
};

export const addChildToCurrentParent = async (
  codigoSala: string,
  codigoFilho: string,
): Promise<ResponsavelRegisterResult> => {
  const sala = codigoSala.trim().toUpperCase();
  const filho = codigoFilho.trim().toUpperCase();

  if (!sala || !filho) {
    return {
      sucesso: false,
      mensagem: "Informe código da sala e código do filho.",
    };
  }

  try {
    await request<ParentChildrenResponse>(
      "/responsavel/children",
      "POST",
      {
        vinculos_filhos: [{ codigo_sala: sala, codigo_filho: filho }],
      },
      true,
    );

    cachedChildren = [];
    await getChildren();

    return {
      sucesso: true,
      mensagem: "Aluno vinculado com sucesso.",
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: error instanceof Error ? error.message : "Não foi possível vincular o aluno.",
    };
  }
};

export const getChildById = async (studentId: string): Promise<Student | undefined> => {
  const fromCache = cachedChildren.find((student) => student.id === studentId);
  if (fromCache) return fromCache;

  const children = await getChildren();
  return children.find((student) => student.id === studentId);
};

const ensureChildLinked = async (studentId: string): Promise<void> => {
  const child = await getChildById(studentId);
  if (!child) {
    throw new Error("Aluno não vinculado ao responsável autenticado.");
  }
};

export const getStudentReportHistory = async (studentId: string): Promise<ReportHistoryItem[]> => {
  await ensureChildLinked(studentId);

  const reports = await request<StudentLLMReportResponse[]>(
    `/reports/student-llm-reports?student_id=${encodeURIComponent(studentId)}`,
    "GET",
    undefined,
    true,
  );

  const sorted = [...reports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return sorted.map((report) => {
    const mapped = mapReportToCurrent(report);
    return {
      id: report.id,
      periodo: mapped.periodo_referencia,
      status: toStatusFromRisk(mapped.risco_desengajamento),
      resumo: mapped.resumo_llm,
      detalhes: mapped,
    };
  });
};

export const getStudentReport = async (studentId: string): Promise<CurrentReport | undefined> => {
  const history = await getStudentReportHistory(studentId);
  if (history.length === 0) return undefined;

  const reports = await request<StudentLLMReportResponse[]>(
    `/reports/student-llm-reports?student_id=${encodeURIComponent(studentId)}`,
    "GET",
    undefined,
    true,
  );
  const latest = [...reports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  return latest ? mapReportToCurrent(latest) : undefined;
};

export const getStudentActivities = async (studentId: string): Promise<Activity[]> => {
  await ensureChildLinked(studentId);

  const student = await request<StudentDetailsResponse>(`/students/${encodeURIComponent(studentId)}`, "GET", undefined, true);
  const notes = student.notas ?? [];

  return notes.map((note, index) => ({
    id: index + 1,
    tipo: note.tipo || "Atividade",
    notaMaxima: note.notaMaxima ?? 10,
    pontuacao: note.pontuacao ?? 0,
    peso: note.peso ?? 1,
    observacoes: note.observacoes?.trim() || "Sem observações registradas.",
  }));
};

export const submitParentObservation = async (studentId: string, observationText: string) => {
  await ensureChildLinked(studentId);

  const created = await request<StudentObservationResponse>(
    "/reports/student-observations",
    "POST",
    {
      student_id: studentId,
      periodo_referencia: currentPeriodoReferencia(),
      observacao_pais: observationText,
    },
    true,
  );

  return mapObservation(created);
};

export const getParentObservations = async (studentId: string): Promise<ParentObservation[]> => {
  await ensureChildLinked(studentId);

  const observations = await request<StudentObservationResponse[]>(
    `/reports/student-observations?student_id=${encodeURIComponent(studentId)}`,
    "GET",
    undefined,
    true,
  );

  return observations
    .map(mapObservation)
    .filter((item) => item.text.trim() !== "")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateParentObservation = async (
  studentId: string,
  observationId: string,
  observationText: string,
): Promise<ParentObservation> => {
  await ensureChildLinked(studentId);

  const updated = await request<StudentObservationResponse>(
    "/reports/student-observations",
    "PUT",
    {
      student_observation_id: observationId,
      observacao_pais: observationText,
    },
    true,
  );

  return mapObservation(updated);
};

export const deleteParentObservation = async (
  studentId: string,
  observationId: string,
): Promise<void> => {
  await ensureChildLinked(studentId);

  await request(
    `/reports/student-observations?student_observation_id=${encodeURIComponent(observationId)}`,
    "DELETE",
    undefined,
    true,
  );
};