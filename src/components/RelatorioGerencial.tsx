import { Ocorrencia, Fornecedor, formatarMoeda, calcularValorTotal } from "@/lib/rnc-types";

interface RelatorioGerencialProps {
  ocorrencias: Ocorrencia[];
  fornecedores: Fornecedor[];
  onClose: () => void;
}

function gerarHTMLRelatorioGerencial(ocorrencias: Ocorrencia[], fornecedores: Fornecedor[]): string {
  const resolvidas = ocorrencias.filter((o) => o.status === "Resolvido");
  const pendentes = ocorrencias.filter((o) => o.status === "Pendente");
  const emAndamento = ocorrencias.filter((o) => o.status === "Em Andamento");

  const valorTotal = ocorrencias.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
  const valorRecuperado = resolvidas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
  const valorPendente = pendentes.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
  const valorEmAndamento = emAndamento.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);

  const fornecedorMap: Record<string, { count: number; valor: number }> = {};
  ocorrencias.forEach((o) => {
    const nome = o.fornecedorNome || "Desconhecido";
    if (!fornecedorMap[nome]) fornecedorMap[nome] = { count: 0, valor: 0 };
    fornecedorMap[nome].count += 1;
    fornecedorMap[nome].valor += calcularValorTotal(o.materiais);
  });
  const topForn = Object.entries(fornecedorMap).sort((a, b) => b[1].valor - a[1].valor);

  const motivoMap: Record<string, { count: number; valor: number }> = {};
  ocorrencias.forEach((o) => {
    o.materiais.forEach((m) => {
      const motivo = m.motivo || "Não informado";
      if (!motivoMap[motivo]) motivoMap[motivo] = { count: 0, valor: 0 };
      motivoMap[motivo].count += 1;
      motivoMap[motivo].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
    });
  });
  const topMotivos = Object.entries(motivoMap).sort((a, b) => b[1].valor - a[1].valor);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const detalhesRows = ocorrencias.map((o) => {
    const vt = calcularValorTotal(o.materiais);
    const statusBg = o.status === "Resolvido" ? "#28a745" : o.status === "Pendente" ? "#D4A017" : o.status === "Em Andamento" ? "#007bff" : "#dc3545";
    return `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:6px 10px;font-size:11px;">${o.protocolo}</td>
      <td style="padding:6px 10px;font-size:11px;">${o.fornecedorNome}</td>
      <td style="padding:6px 10px;font-size:11px;">${o.notaFiscal}</td>
      <td style="padding:6px 10px;font-size:11px;text-align:center;"><span style="background:${statusBg};color:#fff;padding:2px 8px;font-size:10px;font-weight:700;">${o.status}</span></td>
      <td style="padding:6px 10px;font-size:11px;text-align:center;">${o.materiais.length}</td>
      <td style="padding:6px 10px;font-size:11px;text-align:right;font-weight:600;">${fmt(vt)}</td>
      <td style="padding:6px 10px;font-size:11px;">${new Date(o.dataCriacao).toLocaleDateString("pt-BR")}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Relatório Gerencial RNC</title></head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;background:#f5f5f5;">
<div style="max-width:1000px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;">

  <!-- Header -->
  <div style="background:#1a1a1a;padding:20px 30px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:15px;">
      <img src="/logo-50anos.png" style="height:60px;" alt="Andra 50 Anos" />
      <div>
        <h1 style="margin:0;color:#D4A017;font-size:20px;font-weight:800;">Relatório Gerencial de RNC</h1>
        <p style="margin:4px 0 0;color:#ccc;font-size:12px;">Andra S.A. Electric Solutions · 50 Anos</p>
      </div>
    </div>
    <div style="text-align:right;color:#ccc;font-size:11px;">
      <p style="margin:0;">Data: ${dataHoje}</p>
      <p style="margin:4px 0 0;">Total de RNCs: ${ocorrencias.length}</p>
    </div>
  </div>

  <div style="padding:25px 30px;">

    <!-- Resumo Financeiro -->
    <div style="margin-bottom:25px;">
      <h2 style="font-size:14px;font-weight:800;color:#1a1a1a;border-bottom:2px solid #D4A017;padding-bottom:6px;margin-bottom:15px;">Resumo Financeiro</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px;text-align:center;border:1px solid #eee;width:25%;">
            <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;font-weight:600;">Valor Total em RNC</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#1a1a1a;">${fmt(valorTotal)}</p>
          </td>
          <td style="padding:12px;text-align:center;border:1px solid #eee;width:25%;">
            <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;font-weight:600;">Valor Recuperado</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#28a745;">${fmt(valorRecuperado)}</p>
          </td>
          <td style="padding:12px;text-align:center;border:1px solid #eee;width:25%;">
            <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;font-weight:600;">Valor Pendente</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#D4A017;">${fmt(valorPendente)}</p>
          </td>
          <td style="padding:12px;text-align:center;border:1px solid #eee;width:25%;">
            <p style="margin:0;font-size:11px;color:#666;text-transform:uppercase;font-weight:600;">Em Andamento</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#007bff;">${fmt(valorEmAndamento)}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Top Fornecedores -->
    <div style="margin-bottom:25px;">
      <h2 style="font-size:14px;font-weight:800;color:#1a1a1a;border-bottom:2px solid #D4A017;padding-bottom:6px;margin-bottom:15px;">Fornecedores com Maior Índice de NC</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
        <thead>
          <tr style="background:#1a1a1a;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#D4A017;">Fornecedor</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#D4A017;">Qtd. RNCs</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#D4A017;">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${topForn.map(([nome, d]) => `<tr style="border-bottom:1px solid #eee;"><td style="padding:6px 12px;font-size:12px;">${nome}</td><td style="padding:6px 12px;font-size:12px;text-align:center;">${d.count}</td><td style="padding:6px 12px;font-size:12px;text-align:right;font-weight:600;">${fmt(d.valor)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>

    <!-- Top Motivos -->
    <div style="margin-bottom:25px;">
      <h2 style="font-size:14px;font-weight:800;color:#1a1a1a;border-bottom:2px solid #D4A017;padding-bottom:6px;margin-bottom:15px;">Motivos de Não Conformidade</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
        <thead>
          <tr style="background:#1a1a1a;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#D4A017;">Motivo</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#D4A017;">Ocorrências</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:#D4A017;">Impacto Financeiro</th>
          </tr>
        </thead>
        <tbody>
          ${topMotivos.map(([motivo, d]) => `<tr style="border-bottom:1px solid #eee;"><td style="padding:6px 12px;font-size:12px;">${motivo}</td><td style="padding:6px 12px;font-size:12px;text-align:center;">${d.count}</td><td style="padding:6px 12px;font-size:12px;text-align:right;font-weight:600;">${fmt(d.valor)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>

    <!-- Detalhes -->
    <div style="margin-bottom:25px;">
      <h2 style="font-size:14px;font-weight:800;color:#1a1a1a;border-bottom:2px solid #D4A017;padding-bottom:6px;margin-bottom:15px;">Detalhamento das Ocorrências</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
        <thead>
          <tr style="background:#1a1a1a;">
            <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#D4A017;">Protocolo</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#D4A017;">Fornecedor</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#D4A017;">NF</th>
            <th style="padding:8px 10px;text-align:center;font-size:11px;font-weight:700;color:#D4A017;">Status</th>
            <th style="padding:8px 10px;text-align:center;font-size:11px;font-weight:700;color:#D4A017;">Itens</th>
            <th style="padding:8px 10px;text-align:right;font-size:11px;font-weight:700;color:#D4A017;">Valor</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:#D4A017;">Data</th>
          </tr>
        </thead>
        <tbody>${detalhesRows}</tbody>
        <tfoot>
          <tr style="background:#f8f8f8;border-top:2px solid #1a1a1a;">
            <td colspan="5" style="padding:8px 10px;font-size:12px;font-weight:800;text-align:right;">TOTAL GERAL:</td>
            <td style="padding:8px 10px;font-size:14px;font-weight:800;text-align:right;color:#1a1a1a;">${fmt(valorTotal)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Assinatura -->
    <div style="border-top:2px solid #1a1a1a;padding-top:15px;margin-top:30px;">
      <div style="display:flex;justify-content:space-between;">
        <div style="font-size:11px;color:#666;">
          <p style="margin:0;"><strong>Charles S Silva</strong></p>
          <p style="margin:2px 0;">Encarregado de Logística</p>
          <p style="margin:0;">Andra Materiais Elétricos</p>
        </div>
        <div style="text-align:right;font-size:10px;color:#999;">
          <p style="margin:0;">Relatório gerado automaticamente</p>
          <p style="margin:2px 0;">${new Date().toLocaleString("pt-BR")}</p>
        </div>
      </div>
    </div>

  </div>
</div>
</body></html>`;
}

export function RelatorioGerencial({ ocorrencias, fornecedores, onClose }: RelatorioGerencialProps) {
  const html = gerarHTMLRelatorioGerencial(ocorrencias, fornecedores);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  function handleOpen() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-5xl mx-4 border bg-card shadow-xl my-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary-foreground">Relatório Gerencial — Compras e Diretoria</span>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-lg leading-none">&times;</button>
        </div>

        <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
          <button onClick={handleOpen}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            Abrir Relatório
          </button>
          <button onClick={handlePrint}
            className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Imprimir / Salvar PDF
          </button>
        </div>

        <div className="p-4">
          <iframe srcDoc={html} className="w-full border" style={{ height: "700px" }} title="Relatório Gerencial" />
        </div>
      </div>
    </div>
  );
}
