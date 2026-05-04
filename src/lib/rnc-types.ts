export type Status = "Pendente" | "Em Andamento" | "Resolvido" | "Cancelado";

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  contato?: string;
  observacoes?: string;
  dataCadastro?: string;
}

export interface MaterialNaoConforme {
  codigoAndra: string;
  codigoFornecedor: string;
  descricao: string;
  quantidade: number;
  motivo: string;
  valorUnitario: number;
}

export interface Ocorrencia {
  id: string;
  protocolo: string;
  status: Status;
  dataCriacao: string;
  fornecedorId: string;
  fornecedorNome: string;
  notaFiscal: string;
  serie: string;
  chaveAcesso: string;
  ordemCompra: string;
  cnpj: string;
  materiais: MaterialNaoConforme[];
  embalagemLacrada: boolean;
  embalagemAberta: boolean;
  descricao: string;
  conferente: string;
  emailEnviado?: boolean;
  emailEnviadoEm?: string;
}

export interface Conferente {
  id: string;
  nome: string;
  setor?: string;
  ativo: boolean;
}

export type UserRole = "admin" | "user";

export interface Usuario {
  id: string;
  username: string;
  nome: string;
  email?: string;
  role: UserRole;
  passwordHash: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface AppConfig {
  remetenteNome: string;
  remetenteCargo: string;
  remetenteEmpresa: string;
  remetenteSite: string;
  destinatarioPadrao?: string;
  /** E-mails sempre em CC ao enviar uma nova RNC ao fornecedor */
  ccNovaRNC?: string[];
  /** E-mails destinatários do Relatório Diário de ocorrências */
  ccRelatorio?: string[];
  /** Tema visual do sistema */
  tema?: "claro" | "escuro" | "dourado";
}

export function applyTheme(tema: "claro" | "escuro" | "dourado" = "claro") {
  const root = document.documentElement;
  root.classList.remove("dark", "theme-gold");
  if (tema === "escuro") root.classList.add("dark");
  if (tema === "dourado") root.classList.add("theme-gold");
}

export const STATUS_OPTIONS: Status[] = ["Pendente", "Em Andamento", "Resolvido", "Cancelado"];

export const statusClasses: Record<Status, string> = {
  Pendente: "bg-status-pendente-bg text-status-pendente",
  "Em Andamento": "bg-status-andamento-bg text-status-andamento",
  Resolvido: "bg-status-resolvido-bg text-status-resolvido",
  Cancelado: "bg-status-cancelado-bg text-status-cancelado",
};

export function gerarProtocolo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const r = Math.floor(Math.random() * 900 + 100);
  return `RNC-${y}${m}${d}-${h}${min}${s}-${r}`;
}

// ============== Storage helpers ==============
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadOcorrencias(): Ocorrencia[] { return load<Ocorrencia[]>("rnc_ocorrencias", []); }
export function saveOcorrencias(d: Ocorrencia[]) { save("rnc_ocorrencias", d); }

export function loadFornecedores(): Fornecedor[] { return load<Fornecedor[]>("rnc_fornecedores", []); }
export function saveFornecedores(d: Fornecedor[]) { save("rnc_fornecedores", d); }

export function loadConferentes(): Conferente[] { return load<Conferente[]>("rnc_conferentes", []); }
export function saveConferentes(d: Conferente[]) { save("rnc_conferentes", d); }

export function loadUsuarios(): Usuario[] {
  const list = load<Usuario[]>("rnc_usuarios", []);
  // Bootstrap admin padrão na primeira execução
  if (list.length === 0) {
    const admin: Usuario = {
      id: crypto.randomUUID(),
      username: "admin",
      nome: "Administrador",
      role: "admin",
      passwordHash: hashPassword("admin"),
      ativo: true,
      dataCriacao: new Date().toISOString(),
    };
    save("rnc_usuarios", [admin]);
    return [admin];
  }
  return list;
}
export function saveUsuarios(d: Usuario[]) { save("rnc_usuarios", d); }

// ============== Motivos de não conformidade (editáveis) ==============
export const DEFAULT_MOTIVOS: string[] = [
  "Quantidade divergente",
  "Material danificado",
  "Material incorreto",
  "Falta de material",
  "Validade vencida",
  "Embalagem violada",
  "Especificação técnica divergente",
  "Produto fora do padrão de qualidade",
  "Identificação/etiqueta incorreta",
  "Lote não corresponde ao pedido",
  "Outros",
];

export function loadMotivos(): string[] {
  const list = load<string[]>("rnc_motivos", []);
  if (!list || list.length === 0) {
    save("rnc_motivos", DEFAULT_MOTIVOS);
    return [...DEFAULT_MOTIVOS];
  }
  return list;
}
export function saveMotivos(d: string[]) { save("rnc_motivos", d); }

const DEFAULT_CONFIG: AppConfig = {
  remetenteNome: "Charles S Silva",
  remetenteCargo: "Encarregado de Logística",
  remetenteEmpresa: "Andra Materiais Elétricos",
  remetenteSite: "www.andra.com.br",
  destinatarioPadrao: "",
  ccNovaRNC: [],
  ccRelatorio: [],
  tema: "claro",
};
export function loadConfig(): AppConfig { return { ...DEFAULT_CONFIG, ...load<Partial<AppConfig>>("rnc_config", {}) }; }
export function saveConfig(c: AppConfig) { save("rnc_config", c); }

// ============== Auth ==============
// Hash leve (não criptográfico) para uso 100% offline em ambiente interno.
export function hashPassword(pw: string): string {
  let h = 0;
  const salt = "andra-rnc-50anos";
  const s = salt + pw + salt;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `h_${(h >>> 0).toString(16)}_${s.length}`;
}

export function verificarLogin(username: string, password: string): Usuario | null {
  const users = loadUsuarios();
  const u = users.find((x) => x.username.toLowerCase() === username.toLowerCase() && x.ativo);
  if (!u) return null;
  return u.passwordHash === hashPassword(password) ? u : null;
}

const SESSION_KEY = "rnc_session";
export function getSession(): Usuario | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}
export function setSession(u: Usuario, persist: boolean) {
  const data = JSON.stringify(u);
  if (persist) localStorage.setItem(SESSION_KEY, data);
  else sessionStorage.setItem(SESSION_KEY, data);
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// ============== Cálculos & formatação ==============
export function calcularValorTotal(materiais: MaterialNaoConforme[]): number {
  return materiais.reduce((acc, m) => acc + (m.valorUnitario || 0) * (m.quantidade || 0), 0);
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ============== Descrição automática profissional ==============
function pluralizarUnidade(qtd: number): string {
  return qtd === 1 ? "unidade" : "unidades";
}

const FRASE_POR_MOTIVO: Record<string, (qtd: number, desc: string, codigo: string) => string> = {
  "Quantidade divergente": (q, d, c) =>
    `divergência de quantidade (${q} ${pluralizarUnidade(q)}) no material ${d}${c ? ` (cód. ${c})` : ""}`,
  "Material danificado": (q, d, c) =>
    `avaria em ${q} ${pluralizarUnidade(q)} do material ${d}${c ? ` (cód. ${c})` : ""}`,
  "Material incorreto": (q, d, c) =>
    `envio incorreto de ${q} ${pluralizarUnidade(q)} do material ${d}${c ? ` (cód. ${c})` : ""} (item não corresponde ao pedido)`,
  "Falta de material": (q, d, c) =>
    `ausência de ${q} ${pluralizarUnidade(q)} do material ${d}${c ? ` (cód. ${c})` : ""}`,
  "Validade vencida": (q, d, c) =>
    `validade vencida em ${q} ${pluralizarUnidade(q)} do material ${d}${c ? ` (cód. ${c})` : ""}`,
  Outros: (q, d, c) =>
    `não conformidade em ${q} ${pluralizarUnidade(q)} do material ${d}${c ? ` (cód. ${c})` : ""}`,
};

function fraseGenericaComMotivo(q: number, d: string, c: string, motivo: string): string {
  return `${motivo.toLowerCase()} em ${q} ${pluralizarUnidade(q)} do material ${d}${c ? ` (cód. ${c})` : ""}`;
}

export function gerarDescricaoAutomatica(materiais: MaterialNaoConforme[]): string {
  const itens = materiais.filter((m) => m.descricao?.trim() && m.motivo?.trim());
  if (itens.length === 0) return "";
  const partes = itens.map((m) => {
    const fn = FRASE_POR_MOTIVO[m.motivo];
    if (fn) return fn(m.quantidade || 0, m.descricao.trim(), m.codigoAndra?.trim() || "");
    return fraseGenericaComMotivo(m.quantidade || 0, m.descricao.trim(), m.codigoAndra?.trim() || "", m.motivo);
  });
  let texto: string;
  if (partes.length === 1) {
    texto = partes[0];
  } else {
    texto = partes.slice(0, -1).join("; ") + " e " + partes[partes.length - 1];
  }
  return `Durante a conferência do recebimento foi constatada ${texto}. Solicitamos a regularização da pendência conforme procedimento de não conformidade.`;
}
