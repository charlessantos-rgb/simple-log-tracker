import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Ocorrencia, Status, loadConfig } from "@/lib/rnc-types";

interface RelatorioDiarioProps {
  ocorrencias: Ocorrencia[];
  onClose: () => void;
}

function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function gerarHTML(ocorrenciasDoDia: Ocorrencia[], dataRef: string, todas: Ocorrencia[]): string {
  const cfg = loadConfig();
  const dataFormatada = new Date(dataRef + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const porStatus: Record<Status, Ocorrencia[]> = {
    Pendente: [], "Em Andamento": [], Resolvido: [], Cancelado: [],
  };
  ocorrenciasDoDia.forEach((o) => porStatus[o.status].push(o));

  const totalDia = ocorrenciasDoDia.length;
  const totalMateriais = ocorrenciasDoDia.reduce((acc, o) => acc + o.materiais.length, 0);

  const pendentesAbertas = todas.filter((o) => o.status === "Pendente" || o.status === "Em Andamento");

  const corStatus: Record<Status, string> = {
    Pendente: "#D4A017",
    "Em Andamento": "#007bff",
    Resolvido: "#28a745",
    Cancelado: "#dc3545",
  };

  const cardOcorrencia = (o: Ocorrencia, idx: number) => {
    const horaCriacao = new Date(o.dataCriacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const corHeader = corStatus[o.status];

    const linhasMateriais = o.materiais.length === 0
      ? `<tr><td colspan="5" style="padding:10px;text-align:center;color:#999;font-size:11px;font-style:italic;">Nenhum material registrado</td></tr>`
      : o.materiais.map((m, i) => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:6px 8px;font-size:11px;color:#666;width:24px;text-align:center;">${i + 1}</td>
          <td style="padding:6px 8px;font-size:11px;font-family:monospace;color:#333;">${m.codigoAndra || "—"}</td>
          <td style="padding:6px 8px;font-size:12px;color:#1a1a1a;font-weight:600;">${m.descricao || "—"}</td>
          <td style="padding:6px 8px;font-size:11px;text-align:center;color:#333;">${m.quantidade || 0}</td>
          <td style="padding:6px 8px;font-size:11px;color:#b8860b;font-weight:600;">${m.motivo || "—"}</td>
        </tr>`).join("");

    return `
      <div style="margin-bottom:14px;border:1px solid #ddd;border-radius:6px;overflow:hidden;background:#fff;">
        <div style="background:${corHeader};padding:8px 14px;display:flex;justify-content:space-between;align-items:center;">
          <div style="color:#fff;font-size:12px;font-weight:700;">
            #${idx + 1} · ${o.protocolo}
          </div>
          <div style="color:#fff;font-size:11px;font-weight:600;background:rgba(0,0,0,0.18);padding:2px 8px;border-radius:10px;">
            ${o.status}
          </div>
        </div>

        <div style="padding:10px 14px;background:#fafafa;border-bottom:1px solid #eee;display:flex;flex-wrap:wrap;gap:14px;font-size:11px;">
          <div><span style="color:#888;text-transform:uppercase;font-weight:700;font-size:10px;">Fornecedor:</span> <strong style="color:#1a1a1a;">${o.fornecedorNome || "—"}</strong></div>
          <div><span style="color:#888;text-transform:uppercase;font-weight:700;font-size:10px;">NF:</span> <strong style="color:#1a1a1a;">${o.notaFiscal || "—"}${o.serie ? `/${o.serie}` : ""}</strong></div>
          <div><span style="color:#888;text-transform:uppercase;font-weight:700;font-size:10px;">O.C.:</span> <strong style="color:#1a1a1a;">${o.ordemCompra || "—"}</strong></div>
          <div><span style="color:#888;text-transform:uppercase;font-weight:700;font-size:10px;">Conferente:</span> <strong style="color:#1a1a1a;">${o.conferente || "—"}</strong></div>
          <div><span style="color:#888;text-transform:uppercase;font-weight:700;font-size:10px;">Hora:</span> <strong style="color:#1a1a1a;">${horaCriacao}</strong></div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="padding:6px 8px;text-align:center;font-size:10px;color:#666;text-transform:uppercase;font-weight:700;width:24px;">#</th>
              <th style="padding:6px 8px;text-align:left;font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Cód. Andra</th>
              <th style="padding:6px 8px;text-align:left;font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Material</th>
              <th style="padding:6px 8px;text-align:center;font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Qtd</th>
              <th style="padding:6px 8px;text-align:left;font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Motivo</th>
            </tr>
          </thead>
          <tbody>${linhasMateriais}</tbody>
        </table>

        ${o.descricao ? `
        <div style="padding:10px 14px;background:#fffdf5;border-top:1px solid #eee;font-size:11px;color:#555;line-height:1.5;">
          <strong style="color:#888;text-transform:uppercase;font-size:10px;font-weight:700;">Descrição:</strong> ${o.descricao}
        </div>` : ""}
      </div>`;
  };

  const blocoStatus = (status: Status) => {
    const lista = porStatus[status];
    if (lista.length === 0) return "";
    return `
      <div style="margin-bottom:22px;">
        <div style="background:${corStatus[status]};color:#fff;padding:8px 14px;font-size:13px;font-weight:700;border-radius:4px;margin-bottom:10px;display:flex;justify-content:space-between;">
          <span>${status}</span>
          <span style="font-weight:600;font-size:12px;">${lista.length} ${lista.length === 1 ? "ocorrência" : "ocorrências"}</span>
        </div>
        ${lista.map((o, i) => cardOcorrencia(o, i)).join("")}
      </div>`;
  };

  const blocoVazio = totalDia === 0
    ? `<div style="padding:30px;text-align:center;color:#666;font-size:13px;border:1px dashed #ccc;border-radius:6px;background:#fafafa;">
         Nenhuma ocorrência registrada nesta data.
       </div>`
    : "";

  const blocoAbertasResumo = pendentesAbertas.length > 0
    ? `<div style="margin-top:18px;padding:12px 15px;background:#fff8e1;border-left:4px solid #D4A017;font-size:12px;border-radius:4px;">
         <strong>⚠ Atenção:</strong> Há atualmente <strong>${pendentesAbertas.length}</strong> 
         ${pendentesAbertas.length === 1 ? "ocorrência em aberto" : "ocorrências em aberto"} no sistema 
         (somando Pendentes e Em Andamento de todas as datas).
       </div>` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Relatório Diário RNC — ${dataRef}</title></head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;">
<div style="max-width:920px;margin:0 auto;background:#fff;border:2px solid #1a1a1a;border-radius:6px;overflow:hidden;">

  <div style="background:#1a1a1a;padding:18px 25px;display:flex;align-items:center;gap:15px;">
    <img src="${window.location.origin}/logo-50anos.png" style="height:60px;" alt="Andra 50 Anos" />
    <div style="flex:1;text-align:center;">
      <h1 style="margin:0;font-size:22px;color:#D4A017;font-weight:800;">Relatório Diário de Ocorrências</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#ccc;">${dataFormatada}</p>
    </div>
  </div>

  <div style="padding:22px 25px;">
    <div style="display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap;">
      <div style="flex:1;min-width:130px;padding:12px;border:1px solid #ddd;border-radius:4px;background:#fafafa;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Total no dia</div>
        <div style="font-size:24px;font-weight:800;color:#1a1a1a;margin-top:4px;">${totalDia}</div>
      </div>
      <div style="flex:1;min-width:130px;padding:12px;border:1px solid #ddd;border-radius:4px;background:#f5f5f5;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Materiais</div>
        <div style="font-size:24px;font-weight:800;color:#1a1a1a;margin-top:4px;">${totalMateriais}</div>
      </div>
      <div style="flex:1;min-width:130px;padding:12px;border:1px solid #ddd;border-radius:4px;background:#fff8e1;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Pendentes</div>
        <div style="font-size:24px;font-weight:800;color:#D4A017;margin-top:4px;">${porStatus.Pendente.length}</div>
      </div>
      <div style="flex:1;min-width:130px;padding:12px;border:1px solid #ddd;border-radius:4px;background:#e3f2fd;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Em Andamento</div>
        <div style="font-size:24px;font-weight:800;color:#007bff;margin-top:4px;">${porStatus["Em Andamento"].length}</div>
      </div>
      <div style="flex:1;min-width:130px;padding:12px;border:1px solid #ddd;border-radius:4px;background:#e8f5e9;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Resolvidas</div>
        <div style="font-size:24px;font-weight:800;color:#28a745;margin-top:4px;">${porStatus.Resolvido.length}</div>
      </div>
      <div style="flex:1;min-width:130px;padding:12px;border:1px solid #ddd;border-radius:4px;background:#ffebee;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;font-weight:700;">Canceladas</div>
        <div style="font-size:24px;font-weight:800;color:#dc3545;margin-top:4px;">${porStatus.Cancelado.length}</div>
      </div>
    </div>

    ${blocoVazio}
    ${blocoStatus("Pendente")}
    ${blocoStatus("Em Andamento")}
    ${blocoStatus("Resolvido")}
    ${blocoStatus("Cancelado")}
    ${blocoAbertasResumo}

    <div style="border-top:1px solid #ddd;padding-top:15px;margin-top:25px;font-size:11px;color:#666;line-height:1.6;">
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

export function RelatorioDiario({ ocorrencias, onClose }: RelatorioDiarioProps) {
  const cfg = loadConfig();
  const [dataRef, setDataRef] = useState<string>(toDateOnly(new Date()));

  const ocorrenciasDoDia = useMemo(
    () => ocorrencias.filter((o) => o.dataCriacao.startsWith(dataRef)),
    [ocorrencias, dataRef]
  );

  const html = useMemo(
    () => gerarHTML(ocorrenciasDoDia, dataRef, ocorrencias),
    [ocorrenciasDoDia, dataRef, ocorrencias]
  );

  function abrirRelatorio() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  function imprimir() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  async function abrirNoGmail() {
    let copiouRich = false;
    try {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([`Relatório Diário RNC — ${dataRef}`], { type: "text/plain" });
      const item = new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText });
      await navigator.clipboard.write([item]);
      copiouRich = true;
    } catch {
      copiouRich = false;
    }

    const destinatarios = (cfg.ccRelatorio || []).filter((e) => e && e.trim());
    const to = destinatarios[0] || "";
    const cc = destinatarios.slice(1).join(",");
    const dataFmt = new Date(dataRef + "T12:00:00").toLocaleDateString("pt-BR");
    const assunto = `Relatório Diário RNC — ${dataFmt} (${ocorrenciasDoDia.length} ocorrências)`;
    const corpo = copiouRich
      ? "Cole aqui (Ctrl+V) — o relatório completo formatado foi copiado para a área de transferência."
      : `Relatório Diário de Ocorrências — ${dataFmt}\nTotal: ${ocorrenciasDoDia.length} ocorrências.`;

    const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : "";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}${ccParam}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
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

  const semDestinatarios = !cfg.ccRelatorio || cfg.ccRelatorio.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 border bg-card shadow-2xl my-4 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary-foreground">Relatório Diário de Ocorrências</span>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-xl leading-none">&times;</button>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground">Data:</label>
            <input
              type="date"
              value={dataRef}
              onChange={(e) => setDataRef(e.target.value)}
              className="border border-input bg-background px-3 py-2 text-sm rounded"
            />
            <span className="text-xs text-muted-foreground ml-2">
              {ocorrenciasDoDia.length} {ocorrenciasDoDia.length === 1 ? "ocorrência" : "ocorrências"}
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={abrirNoGmail}
            className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground rounded hover:opacity-90 transition-opacity shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar por Gmail
          </button>
          <button onClick={abrirRelatorio} className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors">
            Abrir Relatório
          </button>
          <button onClick={imprimir} className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors">
            Imprimir / PDF
          </button>
        </div>

        {semDestinatarios && (
          <div className="px-4 py-2 bg-status-pendente-bg/40 border-b text-xs text-status-pendente">
            <strong>Atenção:</strong> nenhum destinatário configurado para o Relatório Diário. Cadastre os e-mails em <em>Admin → Configurações → Destinatários do Relatório</em>.
          </div>
        )}

        <div className="p-4">
          <iframe srcDoc={html} className="w-full border rounded" style={{ height: "650px" }} title="Preview do relatório diário" />
        </div>
      </div>
    </div>
  );
}
