import * as XLSX from "xlsx";
import {
  Ocorrencia,
  Fornecedor,
  MaterialNaoConforme,
  Status,
  loadOcorrencias,
  loadFornecedores,
  saveOcorrencias,
  saveFornecedores,
} from "./rnc-types";

/**
 * Exporta TODOS os dados do sistema para uma planilha Excel (.xlsx).
 * A planilha contém 3 abas: Ocorrencias, Materiais e Fornecedores.
 * Funciona 100% offline.
 */
export function exportarParaExcel() {
  const ocorrencias = loadOcorrencias();
  const fornecedores = loadFornecedores();

  // Aba 1 - Ocorrências (uma linha por RNC)
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
    "Valor Total (R$)": o.materiais.reduce(
      (acc, m) => acc + (m.valorUnitario || 0) * (m.quantidade || 0),
      0
    ),
  }));

  // Aba 2 - Materiais (uma linha por material, vinculada à RNC)
  const materiaisRows = ocorrencias.flatMap((o) =>
    o.materiais.map((m) => ({
      "Protocolo RNC": o.protocolo,
      "Ocorrência ID": o.id,
      "Cód. Andra": m.codigoAndra,
      "Cód. Fornecedor": m.codigoFornecedor,
      Descrição: m.descricao,
      Quantidade: m.quantidade,
      "Valor Unitário (R$)": m.valorUnitario || 0,
      "Subtotal (R$)": (m.valorUnitario || 0) * (m.quantidade || 0),
      Motivo: m.motivo,
    }))
  );

  // Aba 3 - Fornecedores
  const fornecedoresRows = fornecedores.map((f) => ({
    ID: f.id,
    Nome: f.nome,
    CNPJ: f.cnpj,
    "E-mail": f.email,
    Telefone: f.telefone,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(ocorrenciasRows),
    "Ocorrencias"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(materiaisRows),
    "Materiais"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(fornecedoresRows),
    "Fornecedores"
  );

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

/**
 * Importa dados de uma planilha Excel (.xlsx) gerada anteriormente.
 * SUBSTITUI todos os dados atuais pelos dados da planilha.
 */
export async function importarDeExcel(file: File): Promise<{
  ocorrencias: number;
  fornecedores: number;
  materiais: number;
}> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const ocorrenciasSheet = wb.Sheets["Ocorrencias"];
  const materiaisSheet = wb.Sheets["Materiais"];
  const fornecedoresSheet = wb.Sheets["Fornecedores"];

  if (!ocorrenciasSheet || !fornecedoresSheet) {
    throw new Error(
      "Planilha inválida. Use uma planilha exportada deste sistema (deve conter as abas 'Ocorrencias' e 'Fornecedores')."
    );
  }

  const ocorrenciasData = XLSX.utils.sheet_to_json<any>(ocorrenciasSheet);
  const materiaisData = materiaisSheet
    ? XLSX.utils.sheet_to_json<any>(materiaisSheet)
    : [];
  const fornecedoresData = XLSX.utils.sheet_to_json<any>(fornecedoresSheet);

  // Agrupa materiais por Ocorrência ID
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
  }));

  saveOcorrencias(ocorrencias);
  saveFornecedores(fornecedores);

  return {
    ocorrencias: ocorrencias.length,
    fornecedores: fornecedores.length,
    materiais: Array.from(materiaisPorOcorrencia.values()).reduce(
      (a, b) => a + b.length,
      0
    ),
  };
}
