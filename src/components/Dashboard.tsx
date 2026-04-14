import { useMemo } from "react";
import { Ocorrencia, Fornecedor, statusClasses, STATUS_OPTIONS } from "@/lib/rnc-types";

interface DashboardProps {
  ocorrencias: Ocorrencia[];
  fornecedores: Fornecedor[];
}

export function Dashboard({ ocorrencias, fornecedores }: DashboardProps) {
  const ultima = ocorrencias.length > 0
    ? ocorrencias.reduce((a, b) => (a.dataCriacao > b.dataCriacao ? a : b))
    : null;

  const statusCount = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_OPTIONS.forEach((s) => (counts[s] = 0));
    ocorrencias.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
    return counts;
  }, [ocorrencias]);

  const topConferentes = useMemo(() => {
    const map: Record<string, number> = {};
    ocorrencias.forEach((o) => {
      const c = o.conferente?.trim() || "Sem conferente";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [ocorrencias]);

  const topFornecedores = useMemo(() => {
    const map: Record<string, number> = {};
    ocorrencias.forEach((o) => {
      const f = o.fornecedorNome || "Desconhecido";
      map[f] = (map[f] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [ocorrencias]);

  const maxFornecedorCount = topFornecedores.length > 0 ? topFornecedores[0][1] : 1;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="rounded-lg border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total de RNCs</p>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-extrabold text-foreground">{ocorrencias.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Ocorrências registradas</p>
        </div>

        {/* Status breakdown */}
        {(["Pendente", "Em Andamento", "Resolvido"] as const).map((status) => {
          const icons: Record<string, JSX.Element> = {
            Pendente: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            "Em Andamento": (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            Resolvido: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          };
          const bgClass = status === "Pendente" ? "bg-status-pendente/10" : status === "Em Andamento" ? "bg-status-andamento/10" : "bg-status-resolvido/10";
          const textClass = status === "Pendente" ? "text-status-pendente" : status === "Em Andamento" ? "text-status-andamento" : "text-status-resolvido";
          const pct = ocorrencias.length > 0 ? Math.round((statusCount[status] / ocorrencias.length) * 100) : 0;

          return (
            <div key={status} className="rounded-lg border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{status}</p>
                <div className={`h-9 w-9 rounded-lg ${bgClass} flex items-center justify-center ${textClass}`}>
                  {icons[status]}
                </div>
              </div>
              <p className="text-4xl font-extrabold text-foreground">{statusCount[status]}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{pct}% do total</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === "Pendente" ? "bg-status-pendente" : status === "Em Andamento" ? "bg-status-andamento" : "bg-status-resolvido"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Second Row: Rankings + Última Ocorrência */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Conferentes */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-foreground">Conferentes</h3>
          </div>
          {topConferentes.length > 0 ? (
            <div className="space-y-2.5">
              {topConferentes.map(([nome, qtd], i) => (
                <div key={nome} className="flex items-center gap-3">
                  <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-foreground truncate">{nome}</span>
                  <span className="text-sm font-bold text-foreground">{qtd}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>

        {/* Top Fornecedores */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-foreground">Fornecedores com maior índice</h3>
          </div>
          {topFornecedores.length > 0 ? (
            <div className="space-y-3">
              {topFornecedores.map(([nome, qtd]) => (
                <div key={nome}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground truncate">{nome}</span>
                    <span className="text-xs font-bold text-muted-foreground ml-2">{qtd}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-destructive/70 transition-all duration-500"
                      style={{ width: `${(qtd / maxFornecedorCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>

        {/* Última Ocorrência */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-status-andamento/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-status-andamento" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-foreground">Última Ocorrência</h3>
          </div>
          {ultima ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Protocolo</p>
                <p className="text-sm font-mono font-medium text-foreground">{ultima.protocolo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fornecedor</p>
                <p className="text-sm font-medium text-foreground">{ultima.fornecedorNome}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mt-0.5 ${statusClasses[ultima.status]}`}>
                    {ultima.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm font-medium text-foreground">{new Date(ultima.dataCriacao).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
