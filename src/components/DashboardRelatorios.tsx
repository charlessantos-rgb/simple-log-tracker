import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Ocorrencia,
  Fornecedor,
  STATUS_OPTIONS,
  Status,
  statusClasses,
  formatarMoeda,
  calcularValorTotal,
  calcularDiasEmAberto,
  loadConferentes,
  loadConfig,
} from "@/lib/rnc-types";

interface DashboardRelatoriosProps {
  ocorrencias: Ocorrencia[];
  fornecedores: Fornecedor[];
  onClose: () => void;
}

const MOTIVOS = [
  "Quantidade divergente",
  "Material danificado",
  "Material incorreto",
  "Falta de material",
  "Validade vencida",
  "Outros",
];

export function DashboardRelatorios({ ocorrencias, fornecedores, onClose }: DashboardRelatoriosProps) {
  const conferentesAtivos = useMemo(() => loadConferentes(), []);

  // Filtros
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [filtroFornecedor, setFiltroFornecedor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<Status | "">("");
  const [filtroConferente, setFiltroConferente] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [busca, setBusca] = useState("");

  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrencias.filter((o) => {
      if (dataInicial && o.dataCriacao < dataInicial) return false;
      if (dataFinal && o.dataCriacao > dataFinal + "T23:59:59") return false;
      if (filtroFornecedor && o.fornecedorId !== filtroFornecedor) return false;
      if (filtroStatus && o.status !== filtroStatus) return false;
      if (filtroConferente && o.conferente !== filtroConferente) return false;
      if (filtroMotivo && !o.materiais.some((m) => m.motivo === filtroMotivo)) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !o.protocolo.toLowerCase().includes(q) &&
          !o.notaFiscal.toLowerCase().includes(q) &&
          !o.fornecedorNome.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [ocorrencias, dataInicial, dataFinal, filtroFornecedor, filtroStatus, filtroConferente, filtroMotivo, busca]);

  // KPIs
  const kpis = useMemo(() => {
    const total = ocorrenciasFiltradas.length;
    const valorTotal = ocorrenciasFiltradas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const resolvidas = ocorrenciasFiltradas.filter((o) => o.status === "Resolvido");
    const valorRecuperado = resolvidas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorPendente = ocorrenciasFiltradas.filter((o) => o.status === "Pendente" || o.status === "Em Andamento")
      .reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const taxaResolucao = total > 0 ? Math.round((resolvidas.length / total) * 100) : 0;

    // Tempo médio de resolução (apenas resolvidas com diasEmAberto registrado)
    const comTempo = resolvidas.filter((o) => typeof o.diasEmAberto === "number");
    const tempoMedio = comTempo.length > 0
      ? Math.round(comTempo.reduce((a, o) => a + (o.diasEmAberto || 0), 0) / comTempo.length)
      : 0;

    return { total, valorTotal, valorRecuperado, valorPendente, taxaResolucao, resolvidas: resolvidas.length, tempoMedio };
  }, [ocorrenciasFiltradas]);

  // Ranking de conferentes que mais detectaram NC
  const rankConferentes = useMemo(() => {
    const map: Record<string, { count: number; valor: number }> = {};
    ocorrenciasFiltradas.forEach((o) => {
      const c = o.conferente?.trim() || "Sem conferente";
      if (!map[c]) map[c] = { count: 0, valor: 0 };
      map[c].count += 1;
      map[c].valor += calcularValorTotal(o.materiais);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [ocorrenciasFiltradas]);

  // Ranking fornecedores
  const rankFornecedores = useMemo(() => {
    const map: Record<string, { count: number; valor: number }> = {};
    ocorrenciasFiltradas.forEach((o) => {
      const k = o.fornecedorNome || "Desconhecido";
      if (!map[k]) map[k] = { count: 0, valor: 0 };
      map[k].count += 1;
      map[k].valor += calcularValorTotal(o.materiais);
    });
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor);
  }, [ocorrenciasFiltradas]);

  // Motivos
  const rankMotivos = useMemo(() => {
    const map: Record<string, { count: number; valor: number }> = {};
    ocorrenciasFiltradas.forEach((o) => {
      o.materiais.forEach((m) => {
        const k = m.motivo || "Não informado";
        if (!map[k]) map[k] = { count: 0, valor: 0 };
        map[k].count += 1;
        map[k].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor);
  }, [ocorrenciasFiltradas]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_OPTIONS.forEach((s) => (counts[s] = 0));
    ocorrenciasFiltradas.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
    return counts;
  }, [ocorrenciasFiltradas]);

  function limparFiltros() {
    setDataInicial("");
    setDataFinal("");
    setFiltroFornecedor("");
    setFiltroStatus("");
    setFiltroConferente("");
    setFiltroMotivo("");
    setBusca("");
  }

  function imprimir() {
    window.print();
  }

  function gerarHTMLRelatorio(): string {
    const cfg = loadConfig();
    const periodo = dataInicial || dataFinal
      ? `${dataInicial ? new Date(dataInicial + "T12:00:00").toLocaleDateString("pt-BR") : "início"} até ${dataFinal ? new Date(dataFinal + "T12:00:00").toLocaleDateString("pt-BR") : "hoje"}`
      : "Todos os períodos";

    const linhasMotivos = rankMotivos.map(([m, d]) => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:6px 10px;font-size:12px;">${m}</td>
        <td style="padding:6px 10px;font-size:12px;text-align:center;">${d.count}</td>
        <td style="padding:6px 10px;font-size:12px;text-align:right;font-weight:600;">${formatarMoeda(d.valor)}</td>
      </tr>`).join("");

    const linhasFornecedores = rankFornecedores.slice(0, 10).map(([n, d]) => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:6px 10px;font-size:12px;">${n}</td>
        <td style="padding:6px 10px;font-size:12px;text-align:center;">${d.count}</td>
        <td style="padding:6px 10px;font-size:12px;text-align:right;font-weight:600;">${formatarMoeda(d.valor)}</td>
      </tr>`).join("");

    const linhasOcorrencias = ocorrenciasFiltradas.map((o) => {
      const dias = o.status === "Resolvido" ? (o.diasEmAberto ?? 0) : calcularDiasEmAberto(o);
      const corStatus = o.status === "Resolvido" ? "#28a745" : o.status === "Pendente" ? "#D4A017" : o.status === "Em Andamento" ? "#007bff" : "#dc3545";
      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:6px 8px;font-size:11px;font-family:monospace;">${o.protocolo}</td>
          <td style="padding:6px 8px;font-size:11px;">${new Date(o.dataCriacao).toLocaleDateString("pt-BR")}</td>
          <td style="padding:6px 8px;font-size:11px;">${o.fornecedorNome}</td>
          <td style="padding:6px 8px;font-size:11px;">${o.notaFiscal || "—"}</td>
          <td style="padding:6px 8px;font-size:11px;text-align:center;">${o.materiais.length}</td>
          <td style="padding:6px 8px;font-size:11px;text-align:right;font-weight:600;">${formatarMoeda(calcularValorTotal(o.materiais))}</td>
          <td style="padding:6px 8px;font-size:11px;text-align:center;font-weight:600;color:${dias >= 7 ? "#dc3545" : "#666"};">${dias}d</td>
          <td style="padding:6px 8px;font-size:11px;"><span style="background:${corStatus};color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">${o.status}</span></td>
        </tr>`;
    }).join("");

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório Gerencial RNC</title></head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
<div style="max-width:980px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;border-radius:6px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:18px 25px;display:flex;align-items:center;gap:15px;">
    <img src="${window.location.origin}/logo-50anos.png" style="height:60px;" alt="Andra 50 Anos" />
    <div style="flex:1;text-align:center;">
      <h1 style="margin:0;font-size:22px;color:#D4A017;font-weight:800;">Relatório Gerencial de RNCs</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#ccc;">Período: ${periodo}</p>
    </div>
  </div>
  <div style="padding:22px 25px;">
    <h2 style="font-size:14px;color:#1a1a1a;margin:0 0 12px;border-bottom:2px solid #D4A017;padding-bottom:6px;">Indicadores Consolidados</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
      <tr>
        <td style="padding:10px;background:#f9f9f9;border:1px solid #eee;text-align:center;width:14%;"><div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;">Total RNCs</div><div style="font-size:20px;font-weight:800;color:#1a1a1a;margin-top:4px;">${kpis.total}</div></td>
        <td style="padding:10px;background:#f9f9f9;border:1px solid #eee;text-align:center;"><div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;">Valor em RNC</div><div style="font-size:16px;font-weight:800;color:#1a1a1a;margin-top:4px;">${formatarMoeda(kpis.valorTotal)}</div></td>
        <td style="padding:10px;background:#eafaf0;border:1px solid #c8e6c9;text-align:center;"><div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Recuperado</div><div style="font-size:16px;font-weight:800;color:#28a745;margin-top:4px;">${formatarMoeda(kpis.valorRecuperado)}</div></td>
        <td style="padding:10px;background:#fff8e1;border:1px solid #ffe0a3;text-align:center;"><div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Pendente</div><div style="font-size:16px;font-weight:800;color:#D4A017;margin-top:4px;">${formatarMoeda(kpis.valorPendente)}</div></td>
        <td style="padding:10px;background:#e3f2fd;border:1px solid #b3d9ff;text-align:center;width:12%;"><div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Taxa Resol.</div><div style="font-size:20px;font-weight:800;color:#007bff;margin-top:4px;">${kpis.taxaResolucao}%</div></td>
        <td style="padding:10px;background:#f3e5f5;border:1px solid #d1b3d8;text-align:center;width:14%;"><div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Tempo Médio</div><div style="font-size:20px;font-weight:800;color:#6a1b9a;margin-top:4px;">${kpis.tempoMedio}d</div></td>
      </tr>
    </table>

    <h2 style="font-size:14px;color:#1a1a1a;margin:0 0 12px;border-bottom:2px solid #D4A017;padding-bottom:6px;">Impacto por Motivo</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
      <thead><tr style="background:#1a1a1a;color:#D4A017;"><th style="padding:8px 10px;text-align:left;font-size:11px;">Motivo</th><th style="padding:8px 10px;text-align:center;font-size:11px;width:80px;">Ocorrências</th><th style="padding:8px 10px;text-align:right;font-size:11px;width:140px;">Valor</th></tr></thead>
      <tbody>${linhasMotivos || '<tr><td colspan="3" style="padding:14px;text-align:center;color:#999;font-size:12px;">Sem dados</td></tr>'}</tbody>
    </table>

    <h2 style="font-size:14px;color:#1a1a1a;margin:0 0 12px;border-bottom:2px solid #D4A017;padding-bottom:6px;">Top 10 Fornecedores com Maior Impacto</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
      <thead><tr style="background:#1a1a1a;color:#D4A017;"><th style="padding:8px 10px;text-align:left;font-size:11px;">Fornecedor</th><th style="padding:8px 10px;text-align:center;font-size:11px;width:80px;">Ocorrências</th><th style="padding:8px 10px;text-align:right;font-size:11px;width:140px;">Valor</th></tr></thead>
      <tbody>${linhasFornecedores || '<tr><td colspan="3" style="padding:14px;text-align:center;color:#999;font-size:12px;">Sem dados</td></tr>'}</tbody>
    </table>

    <h2 style="font-size:14px;color:#1a1a1a;margin:0 0 12px;border-bottom:2px solid #D4A017;padding-bottom:6px;">Detalhamento de Ocorrências (${ocorrenciasFiltradas.length})</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#1a1a1a;color:#D4A017;">
        <th style="padding:8px;text-align:left;font-size:10px;">Protocolo</th>
        <th style="padding:8px;text-align:left;font-size:10px;">Data</th>
        <th style="padding:8px;text-align:left;font-size:10px;">Fornecedor</th>
        <th style="padding:8px;text-align:left;font-size:10px;">NF</th>
        <th style="padding:8px;text-align:center;font-size:10px;">Itens</th>
        <th style="padding:8px;text-align:right;font-size:10px;">Valor</th>
        <th style="padding:8px;text-align:center;font-size:10px;">Dias</th>
        <th style="padding:8px;text-align:left;font-size:10px;">Status</th>
      </tr></thead>
      <tbody>${linhasOcorrencias || '<tr><td colspan="8" style="padding:14px;text-align:center;color:#999;">Nenhuma ocorrência</td></tr>'}</tbody>
    </table>

    <div style="border-top:1px solid #ddd;padding-top:15px;margin-top:25px;font-size:11px;color:#666;line-height:1.6;">
      <p style="margin:0;">Atenciosamente,</p>
      <p style="margin:8px 0 0;"><strong>${cfg.remetenteNome}</strong><br/>${cfg.remetenteCargo}<br/>${cfg.remetenteEmpresa}<br/>
      <a href="http://${cfg.remetenteSite}" style="color:#D4A017;text-decoration:none;">${cfg.remetenteSite}</a></p>
    </div>
  </div>
</div></body></html>`;
  }

  async function enviarPorGmail() {
    const html = gerarHTMLRelatorio();
    const cfg = loadConfig();
    let copiouRich = false;
    try {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([`Relatório Gerencial RNC`], { type: "text/plain" });
      const item = new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText });
      await navigator.clipboard.write([item]);
      copiouRich = true;
    } catch { copiouRich = false; }

    const destinatarios = (cfg.ccRelatorio || []).filter((e) => e && e.trim());
    const to = destinatarios[0] || "";
    const cc = destinatarios.slice(1).join(",");
    const assunto = `Relatório Gerencial de RNCs (${ocorrenciasFiltradas.length} ocorrências · ${formatarMoeda(kpis.valorTotal)})`;
    const corpo = copiouRich
      ? "Cole aqui (Ctrl+V) — o relatório gerencial completo foi copiado para a área de transferência."
      : `Relatório Gerencial de RNCs\nTotal: ${ocorrenciasFiltradas.length} ocorrências · ${formatarMoeda(kpis.valorTotal)}.`;

    const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : "";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}${ccParam}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.open(url, "_blank");

    if (copiouRich) {
      toast.success("Gmail aberto + relatório copiado", { description: "Cole no corpo do e-mail (Ctrl+V).", duration: 6000 });
    } else {
      toast.warning("Gmail aberto", { description: "Não foi possível copiar automaticamente. Use Imprimir/PDF e anexe." });
    }
  }

  const maxFornValor = rankFornecedores[0]?.[1].valor || 1;
  const maxMotivoValor = rankMotivos[0]?.[1].valor || 1;
  const maxConfCount = rankConferentes[0]?.[1].count || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4 print:static print:bg-white print:py-0" onClick={onClose}>
      <div className="w-full max-w-7xl mx-4 border bg-card shadow-2xl my-4 rounded-lg overflow-hidden print:m-0 print:max-w-none print:shadow-none print:border-0" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center gap-3 print:bg-white print:text-foreground">
          <img src="/logo-50anos.png" alt="Andra 50" className="h-10" />
          <div className="h-10 w-px bg-accent/40 print:bg-foreground/30" />
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-primary-foreground print:text-foreground">Dashboard de Relatórios</h2>
            <p className="text-[11px] text-accent print:text-foreground/60">Análise consolidada e individual de RNCs</p>
          </div>
          <button onClick={enviarPorGmail} className="hidden sm:inline-flex items-center gap-2 bg-accent hover:opacity-90 text-accent-foreground px-3 py-1.5 text-xs font-bold rounded transition-opacity print:hidden">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar por Gmail
          </button>
          <button onClick={imprimir} className="hidden sm:inline-flex items-center gap-2 border border-accent/40 hover:bg-accent/20 text-accent px-3 py-1.5 text-xs font-semibold rounded transition-colors print:hidden">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / PDF
          </button>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-2xl leading-none print:hidden">&times;</button>
        </div>

        <div className="p-5 space-y-5 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Filtros */}
          <div className="rounded-lg border bg-muted/20 p-4 print:hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <svg className="h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </h3>
              <button onClick={limparFiltros} className="text-xs text-muted-foreground hover:text-foreground underline">
                Limpar filtros
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Data inicial</label>
                <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)}
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Data final</label>
                <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)}
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Fornecedor</label>
                <select value={filtroFornecedor} onChange={(e) => setFiltroFornecedor(e.target.value)}
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Todos</option>
                  {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as Status | "")}
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Todos</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Conferente</label>
                <select value={filtroConferente} onChange={(e) => setFiltroConferente(e.target.value)}
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Todos</option>
                  {conferentesAtivos.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Motivo</label>
                <select value={filtroMotivo} onChange={(e) => setFiltroMotivo(e.target.value)}
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Todos</option>
                  {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Busca rápida</label>
                <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Protocolo, NF, fornecedor..."
                  className="w-full border border-input bg-background px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              { label: "Total RNCs", value: kpis.total.toString(), color: "text-foreground", bg: "bg-primary/5" },
              { label: "Valor em RNC", value: formatarMoeda(kpis.valorTotal), color: "text-foreground", bg: "bg-primary/5" },
              { label: "Recuperado", value: formatarMoeda(kpis.valorRecuperado), color: "text-status-resolvido", bg: "bg-status-resolvido/10" },
              { label: "Pendente", value: formatarMoeda(kpis.valorPendente), color: "text-status-pendente", bg: "bg-status-pendente/10" },
              { label: "Taxa Resolução", value: kpis.taxaResolucao + "%", color: "text-status-andamento", bg: "bg-status-andamento/10" },
              { label: "Tempo Médio Resol.", value: kpis.tempoMedio + " dias", color: "text-accent-foreground", bg: "bg-accent/15" },
            ].map((k) => (
              <div key={k.label} className={`rounded-lg border p-3 ${k.bg}`}>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{k.label}</p>
                <p className={`mt-1 text-lg font-extrabold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Distribuição por Status */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Distribuição por Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const cnt = statusDistribution[s] || 0;
                const pct = kpis.total > 0 ? Math.round((cnt / kpis.total) * 100) : 0;
                return (
                  <div key={s} className="rounded border p-3">
                    <p className="text-xs text-muted-foreground">{s}</p>
                    <p className="text-xl font-extrabold text-foreground mt-1">{cnt}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted">
                      <div className={`h-full rounded-full ${
                        s === "Pendente" ? "bg-status-pendente" :
                        s === "Em Andamento" ? "bg-status-andamento" :
                        s === "Resolvido" ? "bg-status-resolvido" : "bg-status-cancelado"
                      }`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{pct}% do total</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rankings em duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Conferentes */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">🏆 Ranking de Conferentes (mais detectaram NC)</h3>
              {rankConferentes.length > 0 ? (
                <div className="space-y-2.5">
                  {rankConferentes.slice(0, 10).map(([nome, d], i) => (
                    <div key={nome}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-accent text-accent-foreground" :
                          i === 1 ? "bg-muted-foreground/20 text-foreground" :
                          i === 2 ? "bg-orange-200 text-orange-900" :
                          "bg-muted text-muted-foreground"
                        }`}>{i + 1}</span>
                        <span className="flex-1 text-sm text-foreground truncate">{nome}</span>
                        <span className="text-sm font-bold text-foreground">{d.count} RNCs</span>
                      </div>
                      <div className="ml-8 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(d.count / maxConfCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Sem dados</p>}
            </div>

            {/* Fornecedores */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">⚠️ Fornecedores com maior impacto</h3>
              {rankFornecedores.length > 0 ? (
                <div className="space-y-2.5">
                  {rankFornecedores.slice(0, 10).map(([nome, d]) => (
                    <div key={nome}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground truncate flex-1">{nome}</span>
                        <span className="text-xs font-bold text-foreground ml-2">{d.count} · {formatarMoeda(d.valor)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-destructive/70" style={{ width: `${(d.valor / maxFornValor) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Sem dados</p>}
            </div>
          </div>

          {/* Motivos */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">📊 Impacto por Motivo de Não Conformidade</h3>
            {rankMotivos.length > 0 ? (
              <div className="space-y-2.5">
                {rankMotivos.map(([motivo, d]) => (
                  <div key={motivo}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{motivo}</span>
                      <span className="text-sm font-bold text-foreground">{d.count} ocorrências · {formatarMoeda(d.valor)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(d.valor / maxMotivoValor) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Sem dados</p>}
          </div>

          {/* Tabela detalhada */}
          <div className="rounded-lg border bg-card">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Detalhamento Individual ({ocorrenciasFiltradas.length})</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Protocolo</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fornecedor</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">NF</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conferente</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Itens</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ocorrenciasFiltradas.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhuma ocorrência encontrada com os filtros atuais.</td></tr>
                  ) : ocorrenciasFiltradas.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs font-medium">{o.protocolo}</td>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString("pt-BR")}</td>
                      <td className="px-3 py-2 font-medium">{o.fornecedorNome}</td>
                      <td className="px-3 py-2">{o.notaFiscal}</td>
                      <td className="px-3 py-2">{o.conferente}</td>
                      <td className="px-3 py-2 text-center">{o.materiais.length}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatarMoeda(calcularValorTotal(o.materiais))}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses[o.status]}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {ocorrenciasFiltradas.length > 0 && (
                  <tfoot className="bg-muted/40 border-t-2">
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-right text-sm font-bold">TOTAL FILTRADO:</td>
                      <td className="px-3 py-2 text-right text-sm font-extrabold">{formatarMoeda(kpis.valorTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
