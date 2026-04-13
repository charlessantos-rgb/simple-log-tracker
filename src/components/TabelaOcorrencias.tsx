import { useState, useMemo } from "react";
import { Ocorrencia, statusClasses } from "@/lib/rnc-types";

interface TabelaOcorrenciasProps {
  ocorrencias: Ocorrencia[];
  onEdit: (o: Ocorrencia) => void;
  onDelete: (id: string) => void;
  onResolve: (id: string) => void;
}

export function TabelaOcorrencias({ ocorrencias, onEdit, onDelete, onResolve }: TabelaOcorrenciasProps) {
  const [busca, setBusca] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    if (!busca.trim()) return ocorrencias;
    const q = busca.toLowerCase();
    return ocorrencias.filter(
      (o) =>
        o.protocolo.toLowerCase().includes(q) ||
        o.notaFiscal.toLowerCase().includes(q) ||
        o.fornecedorNome.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [ocorrencias, busca]);

  return (
    <fieldset className="border bg-card p-4 space-y-3">
      <legend className="px-2 text-sm font-semibold text-foreground">Ocorrências em Aberto</legend>

      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-foreground">Pesquisar</label>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border bg-background px-3 py-1.5 text-sm text-foreground w-64 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="overflow-x-auto border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Nº Protocolo</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Nº Nota Fiscal</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Fornecedor</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Data</th>
              <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  {ocorrencias.length === 0
                    ? 'Nenhuma ocorrência cadastrada. Clique em "Nova RNC" para começar.'
                    : "Nenhum resultado encontrado."}
                </td>
              </tr>
            ) : (
              filtradas.map((o) => (
                <tr
                  key={o.id}
                  className={`border-b cursor-pointer transition-colors ${
                    selectedId === o.id ? "bg-primary/20" : "hover:bg-muted/30"
                  }`}
                  onClick={() => setSelectedId(o.id === selectedId ? null : o.id)}
                >
                  <td className="px-3 py-2 font-mono text-xs font-medium text-foreground">{o.protocolo}</td>
                  <td className="px-3 py-2 text-foreground">{o.notaFiscal}</td>
                  <td className="px-3 py-2 text-foreground">{o.fornecedorNome}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString("pt-BR")}</td>
                  <td className="px-3 py-2 text-right space-x-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(o); }}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary hover:bg-muted transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(o.id); }}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            if (selectedId) onResolve(selectedId);
          }}
          disabled={!selectedId}
          className="bg-status-resolvido px-6 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Resolvido
        </button>
      </div>
    </fieldset>
  );
}
