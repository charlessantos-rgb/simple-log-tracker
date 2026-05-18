import { Ocorrencia, Fornecedor, loadConfig } from "@/lib/rnc-types";
import { toast } from "sonner";

interface RelatorioEmailProps {
  ocorrencia: Ocorrencia;
  fornecedor?: Fornecedor;
  onClose: () => void;
  onSent?: (ocorrenciaId: string) => void;
}

function gerarHTMLRelatorio(o: Ocorrencia, f?: Fornecedor): string {
  const cfg = loadConfig();
  const dataFormatada = new Date(o.dataCriacao).toLocaleDateString("pt-BR");
  const horaFormatada = new Date(o.dataCriacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const statusBg =
    o.status === "Pendente" ? "#D4A017" :
    o.status === "Resolvido" ? "#16a34a" :
    o.status === "Cancelado" ? "#dc2626" : "#2563eb";

  const totalItens = o.materiais.reduce((s, m) => s + (m.quantidade || 0), 0);
  const motivosUnicos = Array.from(new Set(o.materiais.map((m) => m.motivo).filter(Boolean)));

  // Linhas da tabela de materiais (sem valores financeiros)
  const materiaisRows = o.materiais.map((m, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;${i % 2 === 1 ? "background:#fafafa;" : ""}">
      <td style="padding:10px 12px;font-size:12px;color:#374151;text-align:center;font-weight:600;">${i + 1}</td>
      <td style="padding:10px 12px;font-size:12px;color:#111827;font-family:'Courier New',monospace;font-weight:600;">${m.codigoAndra || "—"}</td>
      <td style="padding:10px 12px;font-size:12px;color:#374151;font-family:'Courier New',monospace;">${m.codigoFornecedor || "—"}</td>
      <td style="padding:10px 12px;font-size:12px;color:#111827;line-height:1.45;">${m.descricao || "—"}</td>
      <td style="padding:10px 12px;font-size:13px;text-align:center;font-weight:700;color:#111827;">${m.quantidade || 0}</td>
      <td style="padding:10px 12px;font-size:12px;"><span style="display:inline-block;background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;">${m.motivo || "—"}</span></td>
    </tr>
  `).join("");

  const embalagemTexto = o.embalagemLacrada
    ? "Embalagem lacrada pelo fornecedor (não manipulada)"
    : o.embalagemAberta
    ? "Embalagem aberta / manipulada"
    : "Não informado";
  const embalagemIcone = o.embalagemLacrada ? "🔒" : o.embalagemAberta ? "📦" : "❔";

  const sectionHeader = (titulo: string) => `
    <tr><td style="padding:0;">
      <div style="background:linear-gradient(90deg,#1a1a1a 0%,#2a2a2a 100%);color:#D4A017;padding:9px 16px;font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;border-left:4px solid #D4A017;">
        ${titulo}
      </div>
    </td></tr>`;

  const infoRow = (label: string, value: string) => `
    <p style="margin:0 0 8px;font-size:12px;color:#374151;line-height:1.5;">
      <span style="color:#6b7280;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.4px;display:block;margin-bottom:2px;">${label}</span>
      <span style="color:#111827;font-weight:600;">${value || "—"}</span>
    </p>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>RNC ${o.protocolo}</title></head>
<body style="margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f3f4f6;color:#111827;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:920px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 60%,#2a2a2a 100%);padding:24px 28px;border-bottom:3px solid #D4A017;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;width:80px;">
          <img src="${window.location.origin}/logo-50anos.png" style="height:64px;display:block;" alt="Andra 50 Anos" />
        </td>
        <td style="vertical-align:middle;text-align:center;padding:0 12px;">
          <h1 style="margin:0;font-size:22px;color:#D4A017;font-weight:800;letter-spacing:0.4px;">Andra S.A. Electric Solutions</h1>
          <p style="margin:6px 0 0;font-size:12px;color:#d1d5db;letter-spacing:0.3px;">REGISTRO DE NÃO CONFORMIDADE — RECEBIMENTO DE MATERIAIS</p>
          <p style="margin:3px 0 0;font-size:11px;color:#9ca3af;font-style:italic;">50 Anos de Excelência em Soluções Elétricas</p>
        </td>
        <td style="vertical-align:middle;width:90px;text-align:right;">
          <div style="display:inline-block;background:${statusBg};color:#fff;padding:6px 12px;font-size:11px;font-weight:800;border-radius:14px;letter-spacing:0.6px;">${o.status.toUpperCase()}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- PROTOCOLO BAR -->
  <tr><td style="background:#fffbeb;border-bottom:1px solid #fde68a;padding:12px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">Protocolo Oficial</td>
        <td style="text-align:right;font-size:14px;color:#1a1a1a;font-family:'Courier New',monospace;font-weight:800;letter-spacing:0.5px;">${o.protocolo}</td>
      </tr>
    </table>
  </td></tr>

  <!-- SAUDAÇÃO -->
  <tr><td style="padding:22px 28px 6px;">
    <p style="margin:0 0 10px;font-size:13px;color:#111827;">Prezado(a) <strong>${o.fornecedorNome || "fornecedor"}</strong>,</p>
    <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
      Comunicamos formalmente a abertura do Registro de Não Conformidade <strong>${o.protocolo}</strong>, identificado durante o processo de conferência do recebimento referente à Nota Fiscal nº <strong>${o.notaFiscal || "—"}</strong>.
      Solicitamos a análise das informações abaixo e o devido posicionamento, conforme nosso procedimento interno de tratamento de não conformidades.
    </p>
  </td></tr>

  <!-- RESUMO EXECUTIVO -->
  <tr><td style="padding:18px 28px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;border-left:4px solid #D4A017;">
      <tr>
        <td style="padding:14px 16px;border-right:1px solid #e5e7eb;text-align:center;width:25%;">
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Itens não conformes</div>
          <div style="font-size:22px;color:#1a1a1a;font-weight:800;margin-top:4px;">${o.materiais.length}</div>
        </td>
        <td style="padding:14px 16px;border-right:1px solid #e5e7eb;text-align:center;width:25%;">
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Qtd. total</div>
          <div style="font-size:22px;color:#1a1a1a;font-weight:800;margin-top:4px;">${totalItens}</div>
        </td>
        <td style="padding:14px 16px;border-right:1px solid #e5e7eb;text-align:center;width:25%;">
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Abertura</div>
          <div style="font-size:14px;color:#1a1a1a;font-weight:800;margin-top:6px;">${dataFormatada}</div>
          <div style="font-size:11px;color:#6b7280;">${horaFormatada}</div>
        </td>
        <td style="padding:14px 16px;text-align:center;width:25%;">
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Embalagem</div>
          <div style="font-size:18px;margin-top:4px;">${embalagemIcone}</div>
          <div style="font-size:10px;color:#374151;font-weight:600;">${o.embalagemLacrada ? "Lacrada" : o.embalagemAberta ? "Aberta" : "—"}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- INFORMAÇÕES -->
  <tr><td style="padding:18px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${sectionHeader("Dados do Fornecedor & Documento Fiscal")}
      <tr><td style="padding:16px 18px;background:#fff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:50%;padding-right:14px;">
              ${infoRow("Razão Social", o.fornecedorNome)}
              ${infoRow("CNPJ", f?.cnpj || o.cnpj)}
              ${infoRow("Telefone de Contato", f?.telefone || "")}
              ${infoRow("E-mail", f?.email || "")}
            </td>
            <td style="vertical-align:top;width:50%;padding-left:14px;border-left:1px solid #f3f4f6;">
              ${infoRow("Data de Abertura", `${dataFormatada} às ${horaFormatada}`)}
              ${infoRow("Nota Fiscal", o.notaFiscal)}
              ${infoRow("Série", o.serie)}
              ${infoRow("Ordem de Compra / Pedido", o.ordemCompra)}
            </td>
          </tr>
          ${o.chaveAcesso ? `<tr><td colspan="2" style="padding-top:10px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.4px;font-weight:700;">Chave de Acesso NF-e</p>
            <p style="margin:4px 0 0;font-size:11px;color:#111827;font-family:'Courier New',monospace;word-break:break-all;background:#f9fafb;padding:6px 8px;border-radius:4px;border:1px solid #e5e7eb;">${o.chaveAcesso}</p>
          </td></tr>` : ""}
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- MATERIAIS -->
  <tr><td style="padding:14px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${sectionHeader(`Materiais Não Conformes (${o.materiais.length})`)}
      <tr><td style="padding:0;background:#fff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f3f4f6;border-bottom:2px solid #D4A017;">
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;width:40px;">Nº</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Cód. Andra</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Cód. Fornecedor</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Descrição</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;width:60px;">Qtd.</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Motivo</th>
            </tr>
          </thead>
          <tbody>
            ${materiaisRows || '<tr><td colspan="6" style="padding:14px;text-align:center;font-size:12px;color:#9ca3af;">Nenhum material registrado</td></tr>'}
          </tbody>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- DESCRIÇÃO -->
  <tr><td style="padding:14px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${sectionHeader("Descrição Técnica da Ocorrência")}
      <tr><td style="padding:16px 18px;background:#fff;">
        <p style="margin:0 0 14px;font-size:13px;color:#111827;line-height:1.7;text-align:justify;">${(o.descricao || "Sem descrição.").replace(/\n/g, "<br/>")}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;padding-top:10px;margin-top:10px;">
          <tr>
            <td style="padding-top:10px;font-size:11px;color:#6b7280;">
              <strong style="color:#374151;">Conferente Responsável:</strong>
              <span style="color:#111827;font-weight:700;">${o.conferente || "—"}</span>
            </td>
            <td style="padding-top:10px;font-size:11px;color:#6b7280;text-align:right;">
              <strong style="color:#374151;">Status da embalagem:</strong>
              <span style="color:#111827;font-weight:600;">${embalagemTexto}</span>
            </td>
          </tr>
          ${motivosUnicos.length > 0 ? `<tr><td colspan="2" style="padding-top:10px;font-size:11px;color:#6b7280;">
            <strong style="color:#374151;">Motivos identificados:</strong>
            ${motivosUnicos.map((m) => `<span style="display:inline-block;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;margin:2px 3px 0 0;">${m}</span>`).join("")}
          </td></tr>` : ""}
        </table>
      </td></tr>
    </table>
  </td></tr>

<!-- AÇÃO REQUERIDA -->
<tr>
  <td style="padding:14px 28px 0;">
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        background:#fffbeb;
        border:1px solid #fde68a;
        border-left:4px solid #D4A017;
        border-radius:8px;
      "
    >
      <tr>
        <td style="padding:16px 18px;">

          <p style="
            margin:0 0 12px;
            font-size:12px;
            color:#92400e;
            font-weight:800;
            text-transform:uppercase;
            letter-spacing:0.5px;
          ">
            ⚠ Ação Requerida
          </p>

          <p style="
            margin:0 0 14px;
            font-size:12px;
            color:#374151;
            line-height:1.7;
          ">
            Solicitamos o retorno com o plano de ação para tratativa da divergência identificada,
            podendo contemplar uma das seguintes alternativas:
          </p>

          <!-- OPÇÕES -->
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              border-collapse:separate;
              margin-bottom:16px;
            "
          >

            <!-- ITEM -->
            <tr>
              <td style="
                padding:0 0 10px 0;
              ">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background:#ffffff;
                    border:1px solid #fcd34d;
                    border-radius:6px;
                  "
                >
                  <tr>
                    <td style="
                      width:4px;
                      background:#D4A017;
                    "></td>

                    <td style="
                      padding:12px 14px;
                    ">
                      <p style="
                        margin:0 0 4px;
                        font-size:12px;
                        color:#111827;
                        font-weight:700;
                      ">
                        Reposição do material correto
                      </p>

                      <p style="
                        margin:0;
                        font-size:11px;
                        color:#6b7280;
                        line-height:1.5;
                      ">
                        Em substituição ao item divergente.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ITEM -->
            <tr>
              <td style="
                padding:0 0 10px 0;
              ">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background:#ffffff;
                    border:1px solid #fcd34d;
                    border-radius:6px;
                  "
                >
                  <tr>
                    <td style="
                      width:4px;
                      background:#D4A017;
                    "></td>

                    <td style="
                      padding:12px 14px;
                    ">
                      <p style="
                        margin:0 0 4px;
                        font-size:12px;
                        color:#111827;
                        font-weight:700;
                      ">
                        Devolução do material com divergência
                      </p>

                      <p style="
                        margin:0;
                        font-size:11px;
                        color:#6b7280;
                        line-height:1.5;
                      ">
                        Para regularização do processo.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ITEM -->
            <tr>
              <td style="
                padding:0 0 10px 0;
              ">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background:#ffffff;
                    border:1px solid #fcd34d;
                    border-radius:6px;
                  "
                >
                  <tr>
                    <td style="
                      width:4px;
                      background:#D4A017;
                    "></td>

                    <td style="
                      padding:12px 14px;
                    ">
                      <p style="
                        margin:0 0 4px;
                        font-size:12px;
                        color:#111827;
                        font-weight:700;
                      ">
                        Emissão de nota de crédito
                      </p>

                      <p style="
                        margin:0;
                        font-size:11px;
                        color:#6b7280;
                        line-height:1.5;
                      ">
                        Quando aplicável.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ITEM -->
            <tr>
              <td>
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background:#ffffff;
                    border:1px solid #fcd34d;
                    border-radius:6px;
                  "
                >
                  <tr>
                    <td style="
                      width:4px;
                      background:#D4A017;
                    "></td>

                    <td style="
                      padding:12px 14px;
                    ">
                      <p style="
                        margin:0 0 4px;
                        font-size:12px;
                        color:#111827;
                        font-weight:700;
                      ">
                        Ajuste contábil
                      </p>

                      <p style="
                        margin:0;
                        font-size:11px;
                        color:#6b7280;
                        line-height:1.5;
                      ">
                        Caso necessário.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>

          <!-- PRAZO -->
          <div style="
            border-top:1px solid #fde68a;
            padding-top:14px;
          ">

            <p style="
              margin:0 0 10px;
              font-size:12px;
              color:#374151;
              line-height:1.6;
            ">
              Pedimos que o posicionamento seja enviado dentro do prazo estabelecido,
              conforme a complexidade do caso.
            </p>

            <p style="
              margin:0;
              font-size:12px;
              color:#374151;
              line-height:1.6;
            ">
              Toda a tratativa deverá ser respondida diretamente a este e-mail,
              mantendo o número do protocolo no assunto,
              para garantir o correto acompanhamento do processo.
            </p>

          </div>

        </td>
      </tr>
    </table>
  </td>
</tr>

  <!-- PRAZOS -->
  <tr><td style="padding:14px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${sectionHeader("Prazos Médios para Tratativa (SLA)")}
      <tr><td style="padding:0;background:#fff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:14px;text-align:center;border-right:1px solid #f3f4f6;width:33%;">
              <div style="display:inline-block;background:#dcfce7;color:#166534;padding:4px 10px;border-radius:10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Simples</div>
              <div style="margin-top:8px;font-size:16px;font-weight:800;color:#111827;">1 a 5</div>
              <div style="font-size:10px;color:#6b7280;text-transform:uppercase;">dias úteis</div>
            </td>
            <td style="padding:14px;text-align:center;border-right:1px solid #f3f4f6;width:33%;">
              <div style="display:inline-block;background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Moderada</div>
              <div style="margin-top:8px;font-size:16px;font-weight:800;color:#111827;">3 a 8</div>
              <div style="font-size:10px;color:#6b7280;text-transform:uppercase;">dias úteis</div>
            </td>
            <td style="padding:14px;text-align:center;width:33%;">
              <div style="display:inline-block;background:#fee2e2;color:#991b1b;padding:4px 10px;border-radius:10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">Complexa</div>
              <div style="margin-top:8px;font-size:16px;font-weight:800;color:#111827;">5 a 10+</div>
              <div style="font-size:10px;color:#6b7280;text-transform:uppercase;">dias úteis</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- ASSINATURA -->
  <tr><td style="padding:24px 28px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1a1a1a;padding-top:14px;">
      <tr><td style="padding-top:14px;">
        <p style="margin:0 0 10px;font-size:12px;color:#374151;">Atenciosamente,</p>
        <p style="margin:0;font-size:13px;color:#111827;font-weight:800;">${cfg.remetenteNome}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${cfg.remetenteCargo} · ${cfg.remetenteEmpresa}</p>
        <p style="margin:8px 0 0;font-size:11px;">
          <a href="http://${cfg.remetenteSite}" style="color:#D4A017;text-decoration:none;font-weight:700;">${cfg.remetenteSite}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- RODAPÉ -->
  <tr><td style="background:#0a0a0a;padding:14px 28px;text-align:center;">
    <p style="margin:0;font-size:10px;color:#9ca3af;letter-spacing:0.4px;">
      Documento gerado automaticamente pelo Sistema de RNC Andra · Protocolo <strong style="color:#D4A017;">${o.protocolo}</strong>
    </p>
    <p style="margin:4px 0 0;font-size:9px;color:#6b7280;">Esta comunicação é confidencial e destinada exclusivamente ao fornecedor mencionado.</p>
  </td></tr>

</table>
</body></html>`;
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
    // Body intencionalmente vazio quando o HTML rico foi copiado:
    // assim, ao colar (Ctrl+V) no corpo do Gmail, nada é duplicado fora do quadro.
    const corpoFallback = copiouRich
      ? ""
      : `Relatório de Não Conformidade ${ocorrencia.protocolo}.\n\nFornecedor: ${ocorrencia.fornecedorNome}\nNF: ${ocorrencia.notaFiscal}\nStatus: ${ocorrencia.status}\nConferente: ${ocorrencia.conferente}`;

    const ccParam = ccList ? `&cc=${encodeURIComponent(ccList)}` : "";
    const bodyParam = corpoFallback ? `&body=${encodeURIComponent(corpoFallback)}` : "";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatario)}${ccParam}&su=${encodeURIComponent(assunto)}${bodyParam}`;
    window.open(url, "_blank");

    // Sinaliza o envio (ícone verde na tabela)
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
