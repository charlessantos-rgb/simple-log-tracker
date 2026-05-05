import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import {
  loadOcorrencias, loadFornecedores, loadConferentes, loadUsuarios, loadConfig, loadMotivos,
} from "./rnc-types";

/** Gera o mesmo .xlsx do exportarParaExcel, mas como Blob (sem baixar). */
function gerarPlanilhaBlob(): Blob {
  const ocorrencias = loadOcorrencias();
  const fornecedores = loadFornecedores();
  const conferentes = loadConferentes();
  const usuarios = loadUsuarios();
  const config = loadConfig();
  const motivos = loadMotivos();

  const ocorrenciasRows = ocorrencias.map((o) => ({
    ID: o.id, Protocolo: o.protocolo, Status: o.status,
    "Data de Criação": o.dataCriacao, "Fornecedor ID": o.fornecedorId,
    "Fornecedor Nome": o.fornecedorNome, CNPJ: o.cnpj,
    "Nota Fiscal": o.notaFiscal, Série: o.serie, "Chave de Acesso": o.chaveAcesso,
    "Ordem de Compra": o.ordemCompra,
    "Embalagem Lacrada": o.embalagemLacrada ? "SIM" : "NÃO",
    "Embalagem Aberta": o.embalagemAberta ? "SIM" : "NÃO",
    Descrição: o.descricao, Conferente: o.conferente,
    "Qtd. Materiais": o.materiais.length,
    "Valor Total (R$)": o.materiais.reduce((a, m) => a + (m.valorUnitario || 0) * (m.quantidade || 0), 0),
  }));
  const materiaisRows = ocorrencias.flatMap((o) => o.materiais.map((m, i) => ({
    "Protocolo RNC": o.protocolo, "Ocorrência ID": o.id, "Item Nº": i + 1,
    "Cód. Andra": m.codigoAndra, "Cód. Fornecedor": m.codigoFornecedor,
    Descrição: m.descricao, Quantidade: m.quantidade,
    "Valor Unitário (R$)": m.valorUnitario || 0,
    "Subtotal (R$)": (m.valorUnitario || 0) * (m.quantidade || 0),
    Motivo: m.motivo,
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ocorrenciasRows), "Ocorrencias");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(materiaisRows), "Materiais");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fornecedores), "Fornecedores");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(conferentes), "Conferentes");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usuarios), "Usuarios");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(motivos.map((m, i) => ({ Ordem: i + 1, Motivo: m }))), "Motivos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Object.entries(config).map(([k, v]) => ({ Chave: k, Valor: Array.isArray(v) ? v.join(";") : String(v ?? "") }))), "Config");

  const ab = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Blob([ab], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

export async function enviarBackupParaDrive(): Promise<{ ok: boolean; link?: string; error?: string; code?: string }> {
  const blob = gerarPlanilhaBlob();
  const base64 = await blobToBase64(blob);
  const filename = `RNC_Andra_Backup_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;

  const { data, error } = await supabase.functions.invoke("backup-drive", {
    body: { filename, base64, mimeType: blob.type },
  });
  if (error) return { ok: false, error: error.message };
  if (!data?.ok) return { ok: false, error: data?.error || "Falha desconhecida", code: data?.code };
  return { ok: true, link: data.file?.webViewLink };
}
