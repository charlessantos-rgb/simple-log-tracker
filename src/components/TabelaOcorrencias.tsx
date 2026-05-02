import { useState, useMemo, useEffect } from "react";
import { Ocorrencia, statusClasses } from "@/lib/rnc-types";

interface TabelaOcorrenciasProps {
  ocorrencias: Ocorrencia[];
  onEdit: (o: Ocorrencia) => void;
  onDelete: (id: string) => void;
  onResolve: (id: string) => void;
  onEnviar: (o: Ocorrencia) => void;
  titulo?: string;
  modoArquivo?: boolean;
  itensPorPagina?: number;
}

export function TabelaOcorrencias({
  ocorrencias,
  onEdit,
  onDelete,
  onResolve,
  onEnviar,
  titulo = "Ocorrências Ativas",
  modoArquivo = false,
  itensPorPagina = 10,
}: TabelaOcorrenciasProps) {
  const [busca, setBusca] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);

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

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / itensPorPagina));
  useEffect(() => { if (pagina > totalPaginas) setPagina(1); }, [totalPaginas, pagina]);
  useEffect(() => { setPagina(1); }, [busca]);

  const inicio = (pagina - 1) * itensPorPagina;
  const paginadas = filtradas.slice(inicio, inicio + itensPorPagina);

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-bold text-foreground">{titulo}</h3>
          <span className="ml-1 bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
            {ocorrencias.length}
          </span>
        </div>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border rounded-md bg-background pl-8 pr-3 py-1.5 text-sm text-foreground w-56 focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Protocolo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nota Fiscal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fornecedor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <svg className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    {ocorrencias.length === 0
                      ? 'Nenhuma ocorrência cadastrada. Clique em "Nova RNC" para começar.'
                      : "Nenhum resultado encontrado."}
                  </p>
                </td>
              </tr>
            ) : (
              filtradas.map((o) => (
                <tr
                  key={o.id}
                  className={`cursor-pointer transition-colors ${
                    selectedId === o.id ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                  onClick={() => setSelectedId(o.id === selectedId ? null : o.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{o.protocolo}</td>
                  <td className="px-4 py-3 text-foreground">{o.notaFiscal}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{o.fornecedorNome}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEnviar(o); }}
                        title="Enviar por e-mail"
                        className="p-1.5 rounded hover:bg-status-andamento/10 text-status-andamento transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(o); }}
                        title="Editar"
                        className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(o.id); }}
                        title="Excluir"
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {filtradas.length} de {ocorrencias.length} ocorrências
        </p>
        <button
          onClick={() => { if (selectedId) onResolve(selectedId); }}
          disabled={!selectedId}
          className="inline-flex items-center gap-1.5 bg-status-resolvido rounded-md px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Marcar como Resolvido
        </button>
      </div>
    </div>
  );
}
