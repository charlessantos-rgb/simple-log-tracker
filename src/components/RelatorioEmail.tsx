```tsx
import { Ocorrencia, Fornecedor, Material, loadConfig } from "@/lib/rnc-types";
import { toast } from "sonner";

interface RelatorioEmailProps {
  ocorrencia: Ocorrencia;
  fornecedor?: Fornecedor;
  onClose: () => void;
  onSent?: (ocorrenciaId: string) => void;
}

function escapeHtml(s: string | undefined | null): string {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
 
function gerarHTMLRelatorio(o: Ocorrencia, f?: Fornecedor): string {
  const cfg = loadConfig();
  const dataFormatada = new Date(o.dataCriacao).toLocaleDateString("pt-BR");
  const horaFormatada = new Date(o.dataCriacao).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusBg =
    o.status === "Pendente" ? "#D4A017"
    : o.status === "Resolvido" ? "#16a34a"
    : o.status === "Cancelado" ? "#dc2626"
    : "#2563eb";

  const totalItens = o.materiais.reduce((s: number, m: Material) => s + (m.quantidade || 0), 0);
  const motivosUnicos = Array.from(
    new Set(o.materiais.map((m: Material) => m.motivo).filter(Boolean) as string[])
  );

  const embalagemTexto = o.embalagemLacrada
    ? "Embalagem lacrada pelo fornecedor (não manipulada)"
    : o.embalagemAberta
    ? "Embalagem aberta / manipulada"
    : "Não informado";
  const embalagemIcone = o.embalagemLacrada ? "🔒" : o.embalagemAberta ? "📦" : "❔";
  const embalagemLabel = o.embalagemLacrada ? "Lacrada" : o.embalagemAberta ? "Aberta" : "—";

  const materiaisRows =
    o.materiais.length === 0
      ? `<tr><td colspan="6" style="padding:16px;text-align:center;color:#888;font-size:13px;">Nenhum material registrado</td></tr>`
      : o.materiais
          .map(
            (m: Material, i: number) => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 12px;font-size:13px;color:#333;">${i + 1}</td>
          <td style="padding:10px 12px;font-size:13px;color:#333;">${escapeHtml(m.codigoAndra) || "—"}</td>
          <td style="padding:10px 12px;font-size:13px;color:#333;">${escapeHtml(m.codigoFornecedor) || "—"}</td>
          <td style="padding:10px 12px;font-size:13px;color:#333;">${escapeHtml(m.descricao) || "—"}</td>
          <td style="padding:10px 12px;font-size:13px;color:#333;">${m.quantidade || 0}</td>
          <td style="padding:10px 12px;font-size:13px;">
            <span style="background:#D4A017;color:#fff;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;">${escapeHtml(m.motivo) || "—"}</span>
          </td>
        </tr>`
          )
          .join("");

  const sectionHeader = (titulo: string) => `
    <tr>
      <td style="background:#1a1a1a;color:#fff;padding:12px 18px;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;border-radius:6px 6px 0 0;">
        ${escapeHtml(titulo)}
      </td>
    </tr>`;

  const infoRow = (label: string, value: string | undefined) => `
    <div style="margin-bottom:14px;">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:3px;">${escapeHtml(label)}</div>
      <div style="font-size:14px;color:#1a1a1a;font-weight:500;">${escapeHtml(value) || "—"}</div>
    </div>`;

  const acoes = [
    { titulo: "Reposição do material correto", desc: "Em substituição ao item divergente." },
    { titulo: "Devolução do material com divergência", desc: "Para regularização do processo." },
    { titulo: "Devolução de Material em Excesso", desc: "Quando aplicável." },
  ];
  const acoesHtml = acoes
    .map(
      (a) => `
    <div style="background:#fff;border:1px solid #f0d68a;border-radius:6px;padding:12px 16px;margin-bottom:8px;">
      <div style="font-size:14px;font-weight:600;color:#1a1a1a;margin-bottom:2px;">${a.titulo}</div>
      <div style="font-size:12px;color:#8a6d1f;">${a.desc}</div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<!--<head><meta charset="UTF-8" /><title>RNC ${escapeHtml(o.protocolo)}</title></head> -->
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
  <tr><td align="center">
    <table role="presentation" width="780" cellpadding="0" cellspacing="0" style="max-width:780px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(90deg,#1a1a1a,#2a2a2a);padding:18px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="60" valign="middle">
                <div style="width:54px;height:54px;border:2px solid #D4A017;border-radius:50%;display:inline-block;text-align:center;line-height:50px;color:#D4A017;font-weight:700;font-size:11px;">ANDRA</div>
              </td>
              <td valign="middle" style="padding-left:16px;">
                <div style="color:#fff;font-size:18px;font-weight:700;">Andra S.A. Electric Solutions</div>
                <div style="color:#D4A017;font-size:11px;font-weight:600;letter-spacing:0.5px;margin-top:2px;">REGISTRO DE NÃO CONFORMIDADE — RECEBIMENTO DE MATERIAIS</div>
                <div style="color:#bbb;font-size:11px;font-style:italic;margin-top:2px;">50 Anos de Excelência em Soluções Elétricas</div>
              </td>
              <td valign="middle" align="right" width="120">
                <span style="background:${statusBg};color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;">${escapeHtml(o.status.toUpperCase())}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- PROTOCOLO -->
      <tr>
        <td style="background:#fff8e1;border-top:2px solid #D4A017;border-bottom:2px solid #D4A017;padding:10px 24px;">
          <table width="100%"><tr>
            <td style="font-size:11px;font-weight:700;color:#8a6d1f;letter-spacing:0.5px;">PROTOCOLO N° </td>
            <td align="right" style="font-size:13px;font-weight:700;color:#1a1a1a;">${escapeHtml(o.protocolo)}</td>
          </tr></table>
        </td>
      </tr>

      <!-- SAUDAÇÃO -->
      <tr>
        <td style="padding:20px 24px 8px;">
          <div style="font-size:13px;color:#1a1a1a;margin-bottom:8px;">Prezado(a) <strong>${escapeHtml(o.fornecedorNome) || "fornecedor"}</strong>,</div>
          <div style="font-size:13px;color:#444;line-height:1.6;">
            Comunicamos a abertura do Registro de Não Conformidade <strong>${escapeHtml(o.protocolo)}</strong>, identificado durante o processo de conferência do recebimento referente à Nota Fiscal nº <strong>${escapeHtml(o.notaFiscal) || "—"}</strong>. Solicitamos a análise das informações abaixo e o devido posicionamento, conforme nosso procedimento interno de tratamento de não conformidades.
          </div>
        </td>
      </tr>

      <!-- 4 CARDS RESUMO -->
      <tr>
        <td style="padding:14px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:8px 0;">
            <tr>
              <td width="25%" style="background:#fff;border:1px solid #eee;border-left:4px solid #D4A017;border-radius:4px;padding:12px;">
                <div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Itens não conformes</div>
                <div style="font-size:22px;font-weight:700;color:#1a1a1a;margin-top:6px;">${o.materiais.length}</div>
              </td>
              <td width="25%" style="background:#fff;border:1px solid #eee;border-left:4px solid #D4A017;border-radius:4px;padding:12px;">
                <div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Qtd. total</div>
                <div style="font-size:22px;font-weight:700;color:#1a1a1a;margin-top:6px;">${totalItens}</div>
              </td>
              <td width="25%" style="background:#fff;border:1px solid #eee;border-left:4px solid #D4A017;border-radius:4px;padding:12px;">
                <div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Abertura</div>
                <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-top:6px;">${dataFormatada}</div>
                <div style="font-size:11px;color:#888;">${horaFormatada}</div>
              </td>
              <td width="25%" style="background:#fff;border:1px solid #eee;border-left:4px solid #D4A017;border-radius:4px;padding:12px;">
                <div style="font-size:10px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Embalagem</div>
                <div style="font-size:18px;margin-top:4px;">${embalagemIcone}</div>
                <div style="font-size:11px;color:#666;">${embalagemLabel}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- DADOS FORNECEDOR -->
      <tr><td style="padding:8px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${sectionHeader("Dados do Fornecedor & Documento Fiscal")}
          <tr><td style="background:#fafafa;border:1px solid #eee;border-top:0;padding:18px;border-radius:0 0 6px 6px;">
            <table width="100%"><tr>
              <td width="50%" valign="top" style="padding-right:12px;">
                ${infoRow("Razão Social", o.fornecedorNome)}
                ${infoRow("CNPJ", f?.cnpj || o.cnpj)}
                ${infoRow("Telefone de Contato", f?.telefone)}
                ${infoRow("E-mail", f?.email)}
              </td>
              <td width="50%" valign="top" style="padding-left:12px;">
                ${infoRow("Data de Abertura", `${dataFormatada} às ${horaFormatada}`)}
                ${infoRow("Nota Fiscal", o.notaFiscal)}
                ${infoRow("Série", o.serie)}
                ${infoRow("Ordem de Compra / Pedido", o.ordemCompra)}
              </td>
            </tr></table>
            ${
              o.chaveAcesso
                ? `<div style="margin-top:8px;padding-top:12px;border-top:1px dashed #ddd;">
                    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:4px;">Chave de Acesso NF-e</div>
                    <div style="font-size:12px;color:#1a1a1a;font-family:monospace;">${escapeHtml(o.chaveAcesso)}</div>
                  </div>`
                : ""
            }
          </td></tr>
        </table>
      </td></tr>

      <!-- MATERIAIS -->
      <tr><td style="padding:8px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${sectionHeader(`Materiais Não Conformes (${o.materiais.length})`)}
          <tr><td style="background:#fff;border:1px solid #eee;border-top:0;border-radius:0 0 6px 6px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="background:#fafafa;border-bottom:2px solid #D4A017;">
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Nº</th>
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Cód. Andra</th>
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Cód. Fornecedor</th>
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Descrição</th>
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Qtd.</th>
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Motivo</th>
                </tr>
              </thead>
              <tbody>${materiaisRows}</tbody>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- DESCRIÇÃO TÉCNICA -->
      <tr><td style="padding:8px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${sectionHeader("Descrição Técnica da Ocorrência")}
          <tr><td style="background:#fafafa;border:1px solid #eee;border-top:0;padding:18px;border-radius:0 0 6px 6px;">
            <div style="font-size:13px;color:#333;line-height:1.6;margin-bottom:14px;">
              ${escapeHtml(o.descricao || "Sem descrição.").replace(/\n/g, "<br/>")}
            </div>
            <table width="100%"><tr>
              <td width="50%" style="font-size:12px;color:#444;"><strong>Conferente Responsável:</strong> ${escapeHtml(o.conferente) || "—"}</td>
              <td width="50%" style="font-size:12px;color:#444;"><strong>Status da embalagem:</strong> ${escapeHtml(embalagemTexto)}</td>
            </tr></table>
            ${
              motivosUnicos.length > 0
                ? `<div style="margin-top:12px;font-size:12px;color:#444;">
                    <strong>Motivos identificados:</strong>
                    ${motivosUnicos
                      .map(
                        (m) =>
                          `<span style="display:inline-block;background:#D4A017;color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;margin-left:6px;">${escapeHtml(m)}</span>`
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </td></tr>
        </table>
      </td></tr>

      <!-- AÇÃO REQUERIDA -->
      <tr><td style="padding:8px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #f0d68a;border-radius:6px;">
          <tr><td style="padding:18px;">
            <div style="font-size:14px;font-weight:700;color:#8a6d1f;margin-bottom:8px;">⚠ Ação Requerida</div>
            <div style="font-size:13px;color:#5a4a1f;line-height:1.6;margin-bottom:14px;">
              Solicitamos o retorno com o plano de ação para tratativa da divergência identificada, podendo contemplar uma das seguintes alternativas:
            </div>
            ${acoesHtml}
            <div style="font-size:12px;color:#5a4a1f;line-height:1.6;margin-top:14px;">
              Pedimos que o posicionamento seja enviado dentro do prazo estabelecido, conforme a complexidade do caso.<br/><br/>
              Toda a tratativa deverá ser respondida diretamente a este e-mail, mantendo o número do protocolo no assunto, para garantir o correto acompanhamento do processo.
            </div>
          </td></tr>
        </table>
      </td></tr>

      <!-- SLA -->
      <tr><td style="padding:8px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${sectionHeader("Prazos Médios para Tratativa (SLA)")}
          <tr><td style="background:#fafafa;border:1px solid #eee;border-top:0;padding:18px;border-radius:0 0 6px 6px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:10px 0;">
              <tr>
                <td width="33%" align="center" style="background:#fff;border:1px solid #eee;border-radius:6px;padding:14px;">
                  <div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.5px;">Simples</div>
                  <div style="font-size:20px;font-weight:700;color:#1a1a1a;margin-top:6px;">1 a 5</div>
                  <div style="font-size:11px;color:#888;">dias úteis</div>
                </td>
                <td width="33%" align="center" style="background:#fff;border:1px solid #eee;border-radius:6px;padding:14px;">
                  <div style="font-size:11px;font-weight:700;color:#D4A017;text-transform:uppercase;letter-spacing:0.5px;">Moderada</div>
                  <div style="font-size:20px;font-weight:700;color:#1a1a1a;margin-top:6px;">3 a 8</div>
                  <div style="font-size:11px;color:#888;">dias úteis</div>
                </td>
                <td width="33%" align="center" style="background:#fff;border:1px solid #eee;border-radius:6px;padding:14px;">
                  <div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;">Complexa</div>
                  <div style="font-size:20px;font-weight:700;color:#1a1a1a;margin-top:6px;">5 a 10+</div>
                  <div style="font-size:11px;color:#888;">dias úteis</div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- ASSINATURA -->
      <tr><td style="padding:18px 24px;border-top:1px solid #eee;">
        <div style="font-size:13px;color:#444;margin-bottom:6px;">Atenciosamente,</div>
        <div style="font-size:14px;font-weight:700;color:#1a1a1a;">${escapeHtml(cfg.remetenteNome)}</div>
        <div style="font-size:12px;color:#666;">${escapeHtml(cfg.remetenteCargo)} · ${escapeHtml(cfg.remetenteEmpresa)}</div>
        <div style="font-size:12px;color:#D4A017;font-weight:600;margin-top:4px;">${escapeHtml(cfg.remetenteSite)}</div>
      </td></tr>

      <!-- RODAPÉ -->
      <tr><td style="background:#fafafa;padding:14px 24px;text-align:center;border-top:1px solid #eee;">
        <div style="font-size:11px;color:#888;">Documento gerado automaticamente pelo Sistema de RNC Andra · Protocolo <strong style="color:#D4A017;">${escapeHtml(o.protocolo)}</strong></div>
        <div style="font-size:10px;color:#aaa;margin-top:4px;font-style:italic;">Esta comunicação é confidencial e destinada exclusivamente ao fornecedor mencionado.</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function RelatorioEmail({ ocorrencia, fornecedor, onClose, onSent }: RelatorioEmailProps) {
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

  async function handleAbrirNoGmail() {
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

    const destinatario = fornecedor?.email || cfg.destinatarioPadrao || "";
    const ccList = (cfg.ccNovaRNC || []).filter((e) => e && e.trim()).join(",");
    const assunto = `Não Conformidade ${ocorrencia.protocolo} — ${ocorrencia.fornecedorNome}`;
    const corpoFallback = copiouRich
      ? ""
      : `Relatório de Não Conformidade ${ocorrencia.protocolo}.\n\nFornecedor: ${ocorrencia.fornecedorNome}\nNF: ${ocorrencia.notaFiscal}\nStatus: ${ocorrencia.status}\nConferente: ${ocorrencia.conferente}`;

    const ccParam = ccList ? `&cc=${encodeURIComponent(ccList)}` : "";
    const bodyParam = corpoFallback ? `&body=${encodeURIComponent(corpoFallback)}` : "";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatario)}${ccParam}&su=${encodeURIComponent(assunto)}${bodyParam}`;
    window.open(url, "_blank");

    onSent?.(ocorrencia.id);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-lg font-semibold">
            Enviar Ocorrência — {ocorrencia.protocolo}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-500 hover:text-gray-800"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4">
          <button
            onClick={handleAbrirNoGmail}
            className="rounded bg-[#D4A017] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Abrir no Gmail (com visual)
          </button>
          <button
            onClick={handleOpenReport}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Abrir Relatório
          </button>
          <button
            onClick={handlePrint}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Imprimir / PDF
          </button>
          <p className="w-full pt-2 text-xs text-gray-500">
            Os valores financeiros não constam neste e-mail (controle interno).
          </p>
        </div>

        <div className="max-h-[60vh] overflow-auto border-t bg-gray-100 p-4">
          <iframe
            title="Pré-visualização"
            srcDoc={html}
            className="h-[60vh] w-full rounded border bg-white"
          />
        </div>
      </div>
    </div>
  );
}
```
