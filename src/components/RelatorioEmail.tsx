import { Ocorrencia, Fornecedor } from "@/lib/rnc-types";

interface RelatorioEmailProps {
  ocorrencia: Ocorrencia;
  fornecedor?: Fornecedor;
  onClose: () => void;
}

function gerarHTMLRelatorio(o: Ocorrencia, f?: Fornecedor): string {
  const dataFormatada = new Date(o.dataCriacao).toLocaleDateString("pt-BR");
  const statusBg = o.status === "Pendente" ? "#FFA500" : o.status === "Resolvido" ? "#28a745" : o.status === "Cancelado" ? "#dc3545" : "#007bff";

  const materiaisRows = o.materiais.map((m, i) => `
    <tr style="border-bottom:1px solid #ddd;">
      <td style="padding:6px 10px;font-size:12px;">${i + 1}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.codigoAndra}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.codigoFornecedor}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.descricao}</td>
      <td style="padding:6px 10px;font-size:12px;text-align:center;">${m.quantidade}</td>
      <td style="padding:6px 10px;font-size:12px;">${m.motivo}</td>
    </tr>
  `).join("");

  const embalagemTexto = o.embalagemLacrada
    ? "Embalagem Lacrada Fornecedor [Não Manipulado]"
    : o.embalagemAberta
    ? "Embalagem Aberta / Manipulada"
    : "Não informado";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>RNC - ${o.protocolo}</title></head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
<div style="max-width:900px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;">

  <!-- Header -->
  <div style="display:flex;align-items:center;padding:15px 25px;border-bottom:3px solid #1a1a1a;">
    <div style="flex-shrink:0;width:60px;height:60px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-weight:900;font-size:28px;">A</span>
    </div>
    <div style="flex:1;text-align:center;">
      <h1 style="margin:0;font-size:22px;color:#1a1a1a;font-weight:800;">Andra S.A. Electric Solutions</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#666;">Não Conformidade</p>
    </div>
  </div>

  <div style="padding:20px 25px;">

    <!-- Protocolo + Status -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 15px;border:1px solid #ddd;margin-bottom:15px;">
      <span style="font-size:13px;color:#333;"><strong>Protocolo:</strong> ${o.protocolo}</span>
      <span style="background:${statusBg};color:#fff;padding:3px 12px;font-size:12px;font-weight:700;">${o.status.toUpperCase()}</span>
    </div>

    <!-- Informações do Fornecedor -->
    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#fff;padding:6px 15px;font-size:13px;font-weight:700;">Informações do Fornecedor</div>
      <div style="border:1px solid #ddd;border-top:none;padding:12px 15px;display:flex;gap:30px;">
        <div style="flex:1;">
          <p style="margin:0 0 4px;font-size:12px;"><strong>Fornecedor:</strong> ${o.fornecedorNome || "—"}</p>
          <p style="margin:0 0 4px;font-size:12px;"><strong>CNPJ:</strong> ${f?.cnpj || o.cnpj || "—"}</p>
          <p style="margin:0 0 4px;font-size:12px;"><strong>Telefone:</strong> ${f?.telefone || "—"}</p>
          <p style="margin:0 0 4px;font-size:12px;"><strong>E-mail:</strong> ${f?.email || "—"}</p>
          <p style="margin:0;font-size:12px;"><strong>Chave de Acesso:</strong><br/>${o.chaveAcesso || "—"}</p>
        </div>
        <div style="flex:0 0 250px;">
          <p style="margin:0 0 4px;font-size:12px;"><strong>Data de Abertura:</strong> ${dataFormatada}</p>
          <p style="margin:0 0 4px;font-size:12px;"><strong>Nota Fiscal:</strong> ${o.notaFiscal || "—"}</p>
          <p style="margin:0 0 4px;font-size:12px;"><strong>Série:</strong> ${o.serie || "—"}</p>
          <p style="margin:0;font-size:12px;"><strong>Ordem de Compra | Pedido:</strong> ${o.ordemCompra || "—"}</p>
        </div>
      </div>
    </div>

    <!-- Materiais Não Conformes -->
    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#fff;padding:6px 15px;font-size:13px;font-weight:700;">Materiais Não Conformes</div>
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

    <!-- Status da Embalagem -->
    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#fff;padding:6px 15px;font-size:13px;font-weight:700;">Status da Embalagem</div>
      <div style="border:1px solid #ddd;border-top:none;padding:10px 15px;font-size:12px;">${embalagemTexto}</div>
    </div>

    <!-- Descrição da Ocorrência -->
    <div style="margin-bottom:15px;">
      <div style="background:#1a1a1a;color:#fff;padding:6px 15px;font-size:13px;font-weight:700;">Descrição da Ocorrência</div>
      <div style="border:1px solid #ddd;border-top:none;padding:12px 15px;">
        <p style="margin:0 0 10px;font-size:12px;line-height:1.6;">${o.descricao || "Sem descrição."}</p>
        <p style="margin:0;font-size:12px;"><strong>Conferente Responsável:</strong> ${o.conferente || "—"}</p>
      </div>
    </div>

    <!-- Prazos Médios -->
    <div style="margin-bottom:20px;">
      <div style="background:#1a1a1a;color:#fff;padding:6px 15px;font-size:13px;font-weight:700;">Prazos Médios para Solução</div>
      <div style="border:1px solid #ddd;border-top:none;padding:12px 15px;font-size:12px;line-height:1.8;">
        <ul style="margin:0;padding-left:20px;">
          <li><strong>Simples:</strong> 1 a 5 dias úteis</li>
          <li><strong>Moderadas:</strong> 3 a 8 dias úteis</li>
          <li><strong>Complexas:</strong> 5 a 10 dias úteis ou mais</li>
        </ul>
      </div>
    </div>

    <!-- Assinatura -->
    <div style="border-top:1px solid #ddd;padding-top:15px;font-size:11px;color:#666;line-height:1.6;">
      <p style="margin:0;">Atenciosamente,</p>
      <p style="margin:8px 0 0;"><strong>Charles S Silva</strong><br/>
      Encarregado de Logística<br/>
      Andra Materiais Elétricos<br/>
      <a href="http://www.andra.com.br" style="color:#1a1a1a;">www.andra.com.br</a></p>
    </div>

  </div>
</div>
</body>
</html>`;
}

export function RelatorioEmail({ ocorrencia, fornecedor, onClose }: RelatorioEmailProps) {
  const html = gerarHTMLRelatorio(ocorrencia, fornecedor);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  function handleEmail() {
    const assunto = encodeURIComponent(`Não Conformidade - ${ocorrencia.protocolo}`);
    const corpo = encodeURIComponent(
      `Prezado(a),\n\nSegue em anexo o registro de Não Conformidade.\n\n` +
      `Protocolo: ${ocorrencia.protocolo}\n` +
      `Fornecedor: ${ocorrencia.fornecedorNome}\n` +
      `Nota Fiscal: ${ocorrencia.notaFiscal}\n` +
      `Status: ${ocorrencia.status}\n` +
      `Data: ${new Date(ocorrencia.dataCriacao).toLocaleDateString("pt-BR")}\n\n` +
      `Descrição: ${ocorrencia.descricao || "N/A"}\n\n` +
      `Conferente: ${ocorrencia.conferente || "N/A"}\n\n` +
      `Atenciosamente,\nAndra Materiais Elétricos`
    );
    const destinatario = fornecedor?.email || "";
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(destinatario)}&su=${assunto}&body=${corpo}`,
      "_blank"
    );
  }

  function handleCopyHTML() {
    // Open HTML in new window for user to copy/paste into email client
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 border bg-card shadow-xl my-4" onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary-foreground">
            Enviar Ocorrência — {ocorrencia.protocolo}
          </span>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-lg leading-none">&times;</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
          <button
            onClick={handleEmail}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar Email
          </button>
          <button
            onClick={handleCopyHTML}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Abrir Relatório
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>

        {/* Preview */}
        <div className="p-4">
          <iframe
            srcDoc={html}
            className="w-full border"
            style={{ height: "700px" }}
            title="Preview do relatório"
          />
        </div>
      </div>
    </div>
  );
}
