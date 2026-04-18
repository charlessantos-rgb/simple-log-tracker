import * as XLSX from "xlsx";
import {
  Ocorrencia,
  Fornecedor,
  MaterialNaoConforme,
  Status,
  Conferente,
  Usuario,
  UserRole,
  AppConfig,
  loadOcorrencias,
  loadFornecedores,
  loadConferentes,
  loadUsuarios,
  loadConfig,
  loadMotivos,
  saveOcorrencias,
  saveFornecedores,
  saveConferentes,
  saveUsuarios,
  saveConfig,
  saveMotivos,
} from "./rnc-types";

/**
 * Exporta TODOS os dados (offline) em um único .xlsx com 6 abas:
 *  Ocorrencias, Materiais, Fornecedores, Conferentes, Usuarios, Config
 * A planilha funciona como banco de dados local — todos os campos são exportados.
 */
export function exportarParaExcel() {
  const ocorrencias = loadOcorrencias();
  const fornecedores = loadFornecedores();
  const conferentes = loadConferentes();
  const usuarios = loadUsuarios();
  const config = loadConfig();
  const motivos = loadMotivos();

  const ocorrenciasRows = ocorrencias.map((o) => ({
    ID: o.id,
    Protocolo: o.protocolo,
    Status: o.status,
    "Data de Criação": o.dataCriacao,
    "Fornecedor ID": o.fornecedorId,
    "Fornecedor Nome": o.fornecedorNome,
    CNPJ: o.cnpj,
    "Nota Fiscal": o.notaFiscal,
    Série: o.serie,
    "Chave de Acesso": o.chaveAcesso,
    "Ordem de Compra": o.ordemCompra,
    "Embalagem Lacrada": o.embalagemLacrada ? "SIM" : "NÃO",
    "Embalagem Aberta": o.embalagemAberta ? "SIM" : "NÃO",
    Descrição: o.descricao,
    Conferente: o.conferente,
    "Qtd. Materiais": o.materiais.length,
    "Valor Total (R$)": o.materiais.reduce(
      (acc, m) => acc + (m.valorUnitario || 0) * (m.quantidade || 0),
      0
    ),
  }));

  const materiaisRows = ocorrencias.flatMap((o) =>
    o.materiais.map((m, idx) => ({
      "Protocolo RNC": o.protocolo,
      "Ocorrência ID": o.id,
      "Item Nº": idx + 1,
      "Cód. Andra": m.codigoAndra,
      "Cód. Fornecedor": m.codigoFornecedor,
      Descrição: m.descricao,
      Quantidade: m.quantidade,
      "Valor Unitário (R$)": m.valorUnitario || 0,
      "Subtotal (R$)": (m.valorUnitario || 0) * (m.quantidade || 0),
      Motivo: m.motivo,
    }))
  );

  const fornecedoresRows = fornecedores.map((f) => ({
    ID: f.id,
    Nome: f.nome,
    CNPJ: f.cnpj,
    "E-mail": f.email,
    Telefone: f.telefone,
    Endereço: f.endereco || "",
    Contato: f.contato || "",
    Observações: f.observacoes || "",
    "Data de Cadastro": f.dataCadastro || "",
  }));

  const conferentesRows = conferentes.map((c) => ({
    ID: c.id,
    Nome: c.nome,
    Setor: c.setor || "",
    Ativo: c.ativo ? "SIM" : "NÃO",
  }));

  const usuariosRows = usuarios.map((u) => ({
    ID: u.id,
    Login: u.username,
    Nome: u.nome,
    "E-mail": u.email || "",
    Perfil: u.role,
    "Senha (Hash)": u.passwordHash,
    Ativo: u.ativo ? "SIM" : "NÃO",
    "Data de Criação": u.dataCriacao,
  }));

  const configRows = [
    { Chave: "remetenteNome", Valor: config.remetenteNome },
    { Chave: "remetenteCargo", Valor: config.remetenteCargo },
    { Chave: "remetenteEmpresa", Valor: config.remetenteEmpresa },
    { Chave: "remetenteSite", Valor: config.remetenteSite },
    { Chave: "destinatarioPadrao", Valor: config.destinatarioPadrao || "" },
    { Chave: "ccNovaRNC", Valor: (config.ccNovaRNC || []).join(";") },
    { Chave: "ccRelatorio", Valor: (config.ccRelatorio || []).join(";") },
  ];

  const motivosRows = motivos.map((m, i) => ({ Ordem: i + 1, Motivo: m }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ocorrenciasRows), "Ocorrencias");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(materiaisRows), "Materiais");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fornecedoresRows), "Fornecedores");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(conferentesRows), "Conferentes");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usuariosRows), "Usuarios");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(motivosRows), "Motivos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(configRows), "Config");

  const dataStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `RNC_Andra_BancoDados_${dataStr}.xlsx`);
}

function parseStatus(s: any): Status {
  const v = String(s || "Pendente").trim();
  if (v === "Em Andamento" || v === "Resolvido" || v === "Cancelado") return v;
  return "Pendente";
}

function parseBool(v: any): boolean {
  const s = String(v || "").trim().toUpperCase();
  return s === "SIM" || s === "TRUE" || s === "1";
}

function parseRole(v: any): UserRole {
  return String(v || "user").toLowerCase() === "admin" ? "admin" : "user";
}

/**
 * Importa dados de uma planilha .xlsx gerada anteriormente.
 * SUBSTITUI todos os dados atuais (estilo banco de dados).
 */
export async function importarDeExcel(file: File): Promise<{
  ocorrencias: number;
  fornecedores: number;
  materiais: number;
  conferentes: number;
  usuarios: number;
}> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const ocorrenciasSheet = wb.Sheets["Ocorrencias"];
  const materiaisSheet = wb.Sheets["Materiais"];
  const fornecedoresSheet = wb.Sheets["Fornecedores"];
  const conferentesSheet = wb.Sheets["Conferentes"];
  const usuariosSheet = wb.Sheets["Usuarios"];
  const configSheet = wb.Sheets["Config"];

  if (!ocorrenciasSheet || !fornecedoresSheet) {
    throw new Error(
      "Planilha inválida. Use uma planilha exportada deste sistema (deve conter no mínimo as abas 'Ocorrencias' e 'Fornecedores')."
    );
  }

  const ocorrenciasData = XLSX.utils.sheet_to_json<any>(ocorrenciasSheet);
  const materiaisData = materiaisSheet ? XLSX.utils.sheet_to_json<any>(materiaisSheet) : [];
  const fornecedoresData = XLSX.utils.sheet_to_json<any>(fornecedoresSheet);
  const conferentesData = conferentesSheet ? XLSX.utils.sheet_to_json<any>(conferentesSheet) : [];
  const usuariosData = usuariosSheet ? XLSX.utils.sheet_to_json<any>(usuariosSheet) : [];
  const configData = configSheet ? XLSX.utils.sheet_to_json<any>(configSheet) : [];

  const materiaisPorOcorrencia = new Map<string, MaterialNaoConforme[]>();
  for (const m of materiaisData) {
    const key = String(m["Ocorrência ID"] || m["Protocolo RNC"] || "");
    if (!key) continue;
    const list = materiaisPorOcorrencia.get(key) || [];
    list.push({
      codigoAndra: String(m["Cód. Andra"] || ""),
      codigoFornecedor: String(m["Cód. Fornecedor"] || ""),
      descricao: String(m["Descrição"] || ""),
      quantidade: Number(m["Quantidade"]) || 0,
      valorUnitario: Number(m["Valor Unitário (R$)"]) || 0,
      motivo: String(m["Motivo"] || ""),
    });
    materiaisPorOcorrencia.set(key, list);
  }

  const ocorrencias: Ocorrencia[] = ocorrenciasData.map((o) => {
    const id = String(o["ID"] || crypto.randomUUID());
    const protocolo = String(o["Protocolo"] || "");
    return {
      id,
      protocolo,
      status: parseStatus(o["Status"]),
      dataCriacao: String(o["Data de Criação"] || new Date().toISOString()),
      fornecedorId: String(o["Fornecedor ID"] || ""),
      fornecedorNome: String(o["Fornecedor Nome"] || ""),
      cnpj: String(o["CNPJ"] || ""),
      notaFiscal: String(o["Nota Fiscal"] || ""),
      serie: String(o["Série"] || ""),
      chaveAcesso: String(o["Chave de Acesso"] || ""),
      ordemCompra: String(o["Ordem de Compra"] || ""),
      embalagemLacrada: parseBool(o["Embalagem Lacrada"]),
      embalagemAberta: parseBool(o["Embalagem Aberta"]),
      descricao: String(o["Descrição"] || ""),
      conferente: String(o["Conferente"] || ""),
      materiais:
        materiaisPorOcorrencia.get(id) ||
        materiaisPorOcorrencia.get(protocolo) ||
        [],
    };
  });

  const fornecedores: Fornecedor[] = fornecedoresData.map((f) => ({
    id: String(f["ID"] || crypto.randomUUID()),
    nome: String(f["Nome"] || ""),
    cnpj: String(f["CNPJ"] || ""),
    email: String(f["E-mail"] || ""),
    telefone: String(f["Telefone"] || ""),
    endereco: String(f["Endereço"] || ""),
    contato: String(f["Contato"] || ""),
    observacoes: String(f["Observações"] || ""),
    dataCadastro: String(f["Data de Cadastro"] || ""),
  }));

  const conferentes: Conferente[] = conferentesData.map((c) => ({
    id: String(c["ID"] || crypto.randomUUID()),
    nome: String(c["Nome"] || ""),
    setor: String(c["Setor"] || "") || undefined,
    ativo: parseBool(c["Ativo"] ?? "SIM"),
  })).filter((c) => c.nome);

  const usuarios: Usuario[] = usuariosData.map((u) => ({
    id: String(u["ID"] || crypto.randomUUID()),
    username: String(u["Login"] || ""),
    nome: String(u["Nome"] || ""),
    email: String(u["E-mail"] || ""),
    role: parseRole(u["Perfil"]),
    passwordHash: String(u["Senha (Hash)"] || ""),
    ativo: parseBool(u["Ativo"] ?? "SIM"),
    dataCriacao: String(u["Data de Criação"] || new Date().toISOString()),
  })).filter((u) => u.username && u.passwordHash);

  saveOcorrencias(ocorrencias);
  saveFornecedores(fornecedores);
  if (conferentes.length > 0) saveConferentes(conferentes);
  if (usuarios.length > 0) saveUsuarios(usuarios);

  if (configData.length > 0) {
    const cfg: AppConfig = {
      remetenteNome: "",
      remetenteCargo: "",
      remetenteEmpresa: "",
      remetenteSite: "",
      destinatarioPadrao: "",
      ccNovaRNC: [],
      ccRelatorio: [],
    };
    for (const r of configData) {
      const k = String(r["Chave"] || "");
      const v = String(r["Valor"] || "");
      if (k === "ccNovaRNC" || k === "ccRelatorio") {
        (cfg as any)[k] = v ? v.split(";").map((s) => s.trim()).filter(Boolean) : [];
      } else if (k in cfg) {
        (cfg as any)[k] = v;
      }
    }
    saveConfig(cfg);
  }

  return {
    ocorrencias: ocorrencias.length,
    fornecedores: fornecedores.length,
    materiais: Array.from(materiaisPorOcorrencia.values()).reduce((a, b) => a + b.length, 0),
    conferentes: conferentes.length,
    usuarios: usuarios.length,
  };
}
