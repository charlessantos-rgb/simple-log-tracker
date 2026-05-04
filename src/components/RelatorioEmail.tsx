import { Ocorrencia, Fornecedor, loadConfig } from "@/lib/rnc-types";
import { toast } from "sonner";

interface RelatorioEmailProps {
  ocorrencia: Ocorrencia;
  fornecedor?: Fornecedor;
  onClose: () => void;
  onSent?: (ocorrenciaId: string) => void;
}

export function RelatorioEmail({ ocorrencia, fornecedor, onClose, onSent }: RelatorioEmailProps) {
  const html = gerarHTMLRelatorio(ocorrencia, fornecedor);
  const cfg = loadConfig();

function gerarHTMLRelatorio(o: Ocorrencia, f?: Fornecedor): string {
  const cfg = loadConfig();
  const dataFormatada = new Date(o.dataCriacao).toLocaleDateString("pt-BR");
  const statusBg =
    o.status === "Pendente" ? "#D4A017" :
    o.status === "Resolvido" ? "#28a745" :
    o.status === "Cancelado" ? "#dc3545" : "#007bff";

  // Tabela de materiais SEM colunas de valor (controle interno)
  const materiaisRows = o.materiais.map((m, i) => `
    <tr style="border-bottom:1px solid #ddd;">
      <td style="padding:6px 10px;font-size:12px;">${i + 1}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.codigoAndra || "—"}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.codigoFornecedor || "—"}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.descricao || "—"}</td>
      <td style="padding:6px 10px;font-size:12px;text-align:center;">${m.quantidade || 0}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.motivo || "—"}</td>
    </tr>
  `).join("");

  const embalagemTexto = o.embalagemLacrada
    ? "Embalagem Lacrada Fornecedor [Não Manipulado]"
    : o.embalagemAberta
    ? "Embalagem Aberta / Manipulada"
    : "Não informado";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>RNC - ${o.protocolo}</title></head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
<div style="max-width:900px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;border-radius:6px;overflow:hidden;">

  <div style="background:#1a1a1a;padding:18px 25px;display:flex;align-items:center;gap:15px;">
    <img src="${window.location.origin}/logo-50anos.png" style="height:60px;" alt="Andra 50 Anos" />
    <div style="flex:1;text-align:center;">
      <h1 style="margin:0;font-size:22px;color:#D4A017;font-weight:800;letter-spacing:0.5px;">Andra S.A. Electric Solutions</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#ccc;">Registro de Não Conformidade · 50 Anos de Tradição</p>
    </div>
  </div>

  <div style="padding:20px 25px;">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 15px;border:1px solid #ddd;margin-bottom:15px;border-radius:4px;">
      <span style="font-size:13px;color:#333;"><strong>Protocolo:</strong> ${o.protocolo}</span>
      <span style="background:${statusBg};color:#fff;padding:3px 12px;font-size:12px;font-weight:700;border-radius:3px;">${o.status.toUpperCase()}</span>
    </div>

    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#D4A017;padding:6px 15px;font-size:13px;font-weight:700;">Informações do Fornecedor</div>
      <div style="border:1px solid #ddd;border-top:none;padding:12px 15px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;width:50%;padding:0 10px 0 0;">
              <p style="margin:0 0 4px;font-size:12px;"><strong>Fornecedor:</strong> ${o.fornecedorNome || "—"}</p>
              <p style="margin:0 0 4px;font-size:12px;"><strong>CNPJ:</strong> ${f?.cnpj || o.cnpj || "—"}</p>
              <p style="margin:0 0 4px;font-size:12px;"><strong>Telefone:</strong> ${f?.telefone || "—"}</p>
              <p style="margin:0 0 4px;font-size:12px;"><strong>E-mail:</strong> ${f?.email || "—"}</p>
              <p style="margin:0;font-size:12px;"><strong>Chave de Acesso:</strong><br/>${o.chaveAcesso || "—"}</p>
            </td>
            <td style="vertical-align:top;width:50%;padding:0 0 0 10px;">
              <p style="margin:0 0 4px;font-size:12px;"><strong>Data de Abertura:</strong> ${dataFormatada}</p>
              <p style="margin:0 0 4px;font-size:12px;"><strong>Nota Fiscal:</strong> ${o.notaFiscal || "—"}</p>
              <p style="margin:0 0 4px;font-size:12px;"><strong>Série:</strong> ${o.serie || "—"}</p>
              <p style="margin:0;font-size:12px;"><strong>Ordem de Compra | Pedido:</strong> ${o.ordemCompra || "—"}</p>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#D4A017;padding:6px 15px;font-size:13px;font-weight:700;">Materiais Não Conformes</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
        <thead>
          <tr style="background:#f0f0f0;border-bottom:2px solid #ddd;">
            <th style="padding:6px 10px;text-align:left;font-size:12px;font-weight:700;">Nº</th>
            <th style="padding:6px 10px;text-align:left;font-size:12px;font-weight:700;">Cód. Andra</th>
            <th style="padding:6px 10px;text-align:left;font-size:12px;font-weight:700;">Cód. Fornecedor</th>
            <th style="padding:6px 10px;text-align:left;font-size:12px;font-weight:700;">Descrição</th>
            <th style="padding:6px 10px;text-align:center;font-size:12px;font-weight:700;">Qtd.</th>
            <th style="padding:6px 10px;text-align:left;font-size:12px;font-weight:700;">Motivo</th>
          </tr>
        </thead>
        <tbody>
          ${materiaisRows || '<tr><td colspan="6" style="padding:10px;text-align:center;font-size:12px;color:#999;">Nenhum material registrado</td></tr>'}
        </tbody>
      </table>
    </div>

    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#D4A017;padding:6px 15px;font-size:13px;font-weight:700;">Status da Embalagem</div>
      <div style="border:1px solid #ddd;border-top:none;padding:10px 15px;font-size:12px;">${embalagemTexto}</div>
    </div>

    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#D4A017;padding:6px 15px;font-size:13px;font-weight:700;">Descrição da Ocorrência</div>
      <div style="border:1px solid #ddd;border-top:none;padding:12px 15px;">
        <p style="margin:0 0 10px;font-size:12px;line-height:1.6;">${(o.descricao || "Sem descrição.").replace(/\n/g, "<br/>")}</p>
        <p style="margin:0;font-size:12px;"><strong>Conferente Responsável:</strong> ${o.conferente || "—"}</p>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="background:#1a1a1a;color:#D4A017;padding:6px 15px;font-size:13px;font-weight:700;">Prazos Médios para Solução</div>
      <div style="border:1px solid #ddd;border-top:none;padding:12px 15px;font-size:12px;line-height:1.8;">
        <ul style="margin:0;padding-left:20px;">
          <li><strong>Simples:</strong> 1 a 5 dias úteis</li>
          <li><strong>Moderadas:</strong> 3 a 8 dias úteis</li>
          <li><strong>Complexas:</strong> 5 a 10 dias úteis ou mais</li>
        </ul>
      </div>
    </div>

    <div style="border-top:1px solid #ddd;padding-top:15px;font-size:11px;color:#666;line-height:1.6;">
      <p style="margin:0;">Atenciosamente,</p>
      <p style="margin:8px 0 0;"><strong>${cfg.remetenteNome}</strong><br/>
      ${cfg.remetenteCargo}<br/>
      ${cfg.remetenteEmpresa}<br/>
      <a href="http://${cfg.remetenteSite}" style="color:#D4A017;text-decoration:none;">${cfg.remetenteSite}</a></p>
    </div>
  </div>
</div>
</body></html>`;
}

export function RelatorioEmail({ ocorrencia, fornecedor, onClose }: RelatorioEmailProps) {
  const html = gerarHTMLRelatorio(ocorrencia, fornecedor);
  const cfg = loadConfig();

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  function handleOpenReport() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  /**
   * Abre o Gmail compose com destinatário/assunto pré-preenchidos
   * E AO MESMO TEMPO copia o HTML rico para o clipboard,
   * para o usuário colar (Ctrl+V) no corpo mantendo todo o visual.
   */
  async function handleAbrirNoGmail() {
    // 1) Copia HTML rico para clipboard
    let copiouRich = false;
    try {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob(
        [`Relatório RNC ${ocorrencia.protocolo} — visualize o HTML.`],
        { type: "text/plain" }
      );
      const item = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      });
      await navigator.clipboard.write([item]);
      copiouRich = true;
    } catch {
      copiouRich = false;
    }

    // 2) Abre o Gmail compose
    const destinatario = fornecedor?.email || cfg.destinatarioPadrao || "";
    const ccList = (cfg.ccNovaRNC || []).filter((e) => e && e.trim()).join(",");
    const assunto = `Não Conformidade ${ocorrencia.protocolo} — ${ocorrencia.fornecedorNome}`;
    const corpoFallback = copiouRich
      ? "Cole aqui (Ctrl+V) — o conteúdo visual completo do relatório foi copiado para a área de transferência."
      : `Relatório de Não Conformidade ${ocorrencia.protocolo}.\n\nFornecedor: ${ocorrencia.fornecedorNome}\nNF: ${ocorrencia.notaFiscal}\nStatus: ${ocorrencia.status}\nConferente: ${ocorrencia.conferente}`;

    const ccParam = ccList ? `&cc=${encodeURIComponent(ccList)}` : "";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatario)}${ccParam}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoFallback)}`;
    window.open(url, "_blank");

    if (copiouRich) {
      toast.success("Gmail aberto + visual copiado", {
        description: "Cole no corpo do e-mail (Ctrl+V) para inserir o relatório formatado.",
        duration: 6000,
      });
    } else {
      toast.warning("Gmail aberto", {
        description: "Não foi possível copiar automaticamente. Use 'Abrir Relatório' e copie manualmente.",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 border bg-card shadow-2xl my-4 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary-foreground">
            Enviar Ocorrência — {ocorrencia.protocolo}
          </span>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-xl leading-none">&times;</button>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4 border-b bg-muted/30">
          <button
            onClick={handleAbrirNoGmail}
            className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground rounded hover:opacity-90 transition-opacity shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Abrir no Gmail (com visual)
          </button>
          <button
            onClick={handleOpenReport}
            className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors"
          >
            Abrir Relatório
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors"
          >
            Imprimir / PDF
          </button>
          <div className="ml-auto text-xs text-muted-foreground max-w-xs text-right">
            Os valores financeiros não constam neste e-mail (controle interno).
          </div>
        </div>

        <div className="p-4">
          <iframe srcDoc={html} className="w-full border rounded" style={{ height: "650px" }} title="Preview do relatório" />
        </div>
      </div>
    </div>
  );
}
