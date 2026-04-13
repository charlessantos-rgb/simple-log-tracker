import { Ocorrencia, Fornecedor, statusClasses } from "@/lib/rnc-types";

interface DashboardProps {
  ocorrencias: Ocorrencia[];
  fornecedores: Fornecedor[];
}

export function Dashboard({ ocorrencias, fornecedores }: DashboardProps) {
  const ultima = ocorrencias.length > 0
    ? ocorrencias.reduce((a, b) => (a.dataCriacao > b.dataCriacao ? a : b))
    : null;

  // Contagem por conferente
  const contagemConferente: Record<string, number> = {};
  ocorrencias.forEach((o) => {
    const c = o.conferente?.trim() || "Sem conferente";
    contagemConferente[c] = (contagemConferente[c] || 0) + 1;
  });
  const topConferentes = Object.entries(contagemConferente)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Fornecedores com mais ocorrências
  const contagemFornecedor: Record<string, number> = {};
  ocorrencias.forEach((o) => {
    const f = o.fornecedorNome || "Desconhecido";
    contagemFornecedor[f] = (contagemFornecedor[f] || 0) + 1;
  });
  const topFornecedores = Object.entries(contagemFornecedor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded border bg-status-resolvido-bg p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground">Total de RNCs</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{ocorrencias.length}</p>
          <p className="text-xs text-muted-foreground">Todas as ocorrências registradas</p>
        </div>

        <div className="rounded border bg-status-pendente-bg p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground">Contagem de RNC por Conferente</p>
          <div className="mt-1 space-y-0.5">
            {topConferentes.length > 0 ? topConferentes.map(([nome, qtd], i) => (
              <p key={nome} className="text-xs text-foreground">
                {i + 1}º - {nome.toUpperCase()} ({qtd} ocorrências)
              </p>
            )) : <p className="text-xs text-muted-foreground">Sem dados</p>}
          </div>
        </div>

        <div className="rounded border bg-status-andamento-bg p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground">Fornecedores</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{fornecedores.length}</p>
          <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
        </div>

        <div className="rounded border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground">Fornecedores com maior índice</p>
          <div className="mt-1 space-y-0.5">
            {topFornecedores.length > 0 ? topFornecedores.map(([nome, qtd], i) => (
              <p key={nome} className="text-xs text-foreground">
                {i + 1}º - {nome.toUpperCase()} ({qtd} ocorrências)
              </p>
            )) : <p className="text-xs text-muted-foreground">Sem dados</p>}
          </div>
        </div>
      </div>

      {/* Última Ocorrência */}
      <fieldset className="rounded border bg-card p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">Última Ocorrência Registrada</legend>
        {ultima ? (
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-bold text-primary">Protocolo</p>
              <p className="text-foreground font-mono text-xs">{ultima.protocolo}</p>
            </div>
            <div>
              <p className="font-bold text-primary">Fornecedor</p>
              <p className="text-foreground">{ultima.fornecedorNome}</p>
            </div>
            <div>
              <p className="font-bold text-primary">Status</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses[ultima.status]}`}>
                {ultima.status}
              </span>
            </div>
            <div>
              <p className="font-bold text-primary">Data</p>
              <p className="text-foreground">{new Date(ultima.dataCriacao).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>
        )}
      </fieldset>
    </div>
  );
}
