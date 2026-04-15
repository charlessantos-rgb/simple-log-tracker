export type Status = "Pendente" | "Em Andamento" | "Resolvido" | "Cancelado";

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
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

export function loadOcorrencias(): Ocorrencia[] {
  try {
    const raw = localStorage.getItem("rnc_ocorrencias");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOcorrencias(data: Ocorrencia[]) {
  localStorage.setItem("rnc_ocorrencias", JSON.stringify(data));
}

export function loadFornecedores(): Fornecedor[] {
  try {
    const raw = localStorage.getItem("rnc_fornecedores");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFornecedores(data: Fornecedor[]) {
  localStorage.setItem("rnc_fornecedores", JSON.stringify(data));
}

export function calcularValorTotal(materiais: MaterialNaoConforme[]): number {
  return materiais.reduce((acc, m) => acc + (m.valorUnitario || 0) * (m.quantidade || 0), 0);
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
