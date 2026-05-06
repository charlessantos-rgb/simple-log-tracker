import { useState } from "react";
import { Ocorrencia, calcularDiasEmAberto } from "@/lib/rnc-types";

interface ResolverDialogProps {
  ocorrencia: Ocorrencia;
  onConfirm: (solucao: string) => void;
  onClose: () => void;
}

const SUGESTOES = [
  "Material substituído pelo fornecedor sem custo adicional, conforme acordo.",
  "Fornecedor emitiu nota fiscal de devolução e crédito foi confirmado.",
  "Diferença de quantidade complementada em entrega adicional realizada pelo fornecedor.",
  "Material reaproveitado internamente após avaliação técnica favorável.",
  "Devolução total realizada e confirmada com o fornecedor.",
  "Fornecedor emitiu nota de ajuste e regularização contábil concluída.",
];

export function ResolverDialog({ ocorrencia, onConfirm, onClose }: ResolverDialogProps) {
  const [solucao, setSolucao] = useState("");
  const dias = calcularDiasEmAberto(ocorrencia);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (solucao.trim().length < 10) return;
    onConfirm(solucao.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-8" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 bg-card border shadow-2xl rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-status-resolvido px-5 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-primary-foreground">Encerrar Ocorrência</h2>
            <p className="text-xs text-primary-foreground/85">Registre como esta RNC foi resolvida</p>
          </div>
          <button onClick={onClose} className="text-primary-foreground/80 hover:text-primary-foreground text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Resumo */}
          <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Protocolo</p>
              <p className="font-mono font-bold text-foreground mt-0.5">{ocorrencia.protocolo}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Fornecedor</p>
              <p className="font-medium text-foreground mt-0.5 truncate">{ocorrencia.fornecedorNome}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Aberta em</p>
              <p className="font-medium text-foreground mt-0.5">{new Date(ocorrencia.dataCriacao).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Tempo aberta</p>
              <p className={`font-extrabold mt-0.5 ${dias >= 7 ? "text-destructive" : dias >= 3 ? "text-status-pendente" : "text-status-resolvido"}`}>
                {dias} {dias === 1 ? "dia" : "dias"}
              </p>
            </div>
          </div>

          {/* Sugestões */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Sugestões rápidas (clique para aplicar):</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGESTOES.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSolucao(s)}
                  className="text-[11px] px-2 py-1 rounded-full bg-accent/30 hover:bg-accent/50 text-accent-foreground transition-colors border border-accent/40"
                >
                  {s.length > 60 ? s.substring(0, 60) + "..." : s}
                </button>
              ))}
            </div>
          </div>

          {/* Solução */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Descrição da solução aplicada <span className="text-destructive">*</span>
            </label>
            <textarea
              value={solucao}
              onChange={(e) => setSolucao(e.target.value)}
              rows={5}
              required
              minLength={10}
              autoFocus
              placeholder="Ex.: Fornecedor realizou substituição integral do material em 15/03/2025, conforme nota fiscal nº 12345. Conferência presencial confirmou conformidade dos itens entregues."
              className="w-full border border-input bg-background px-3 py-2.5 text-sm text-foreground rounded resize-none focus:outline-none focus:ring-2 focus:ring-status-resolvido/40"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-muted-foreground">Mínimo 10 caracteres. Esta descrição ficará registrada no histórico da RNC.</p>
              <p className="text-[11px] text-muted-foreground">{solucao.length} caracteres</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="border px-5 py-2 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={solucao.trim().length < 10}
              className="inline-flex items-center gap-2 bg-status-resolvido px-5 py-2 text-sm font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Confirmar Resolução
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
