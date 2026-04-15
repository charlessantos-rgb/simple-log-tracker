import { useMemo } from "react";
import { Ocorrencia, formatarMoeda, calcularValorTotal } from "@/lib/rnc-types";

interface DashboardFinanceiroProps {
  ocorrencias: Ocorrencia[];
}

export function DashboardFinanceiro({ ocorrencias }: DashboardFinanceiroProps) {
  const stats = useMemo(() => {
    const resolvidas = ocorrencias.filter((o) => o.status === "Resolvido");
    const pendentes = ocorrencias.filter((o) => o.status === "Pendente");
    const emAndamento = ocorrencias.filter((o) => o.status === "Em Andamento");
    const canceladas = ocorrencias.filter((o) => o.status === "Cancelado");

    const valorRecuperado = resolvidas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorPendente = pendentes.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorEmAndamento = emAndamento.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorCancelado = canceladas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorTotal = ocorrencias.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);

    return { valorRecuperado, valorPendente, valorEmAndamento, valorCancelado, valorTotal };
  }, [ocorrencias]);

  const topMateriais = useMemo(() => {
    const map: Record<string, { qtd: number; valor: number }> = {};
    ocorrencias.forEach((o) => {
      o.materiais.forEach((m) => {
        const key = m.descricao || m.codigoAndra || "Sem descrição";
        if (!map[key]) map[key] = { qtd: 0, valor: 0 };
        map[key].qtd += m.quantidade;
        map[key].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, 5);
  }, [ocorrencias]);

  const topMotivos = useMemo(() => {
    const map: Record<string, { count: number; valor: number }> = {};
    ocorrencias.forEach((o) => {
      o.materiais.forEach((m) => {
        const motivo = m.motivo || "Não informado";
        if (!map[motivo]) map[motivo] = { count: 0, valor: 0 };
        map[motivo].count += 1;
        map[motivo].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor);
  }, [ocorrencias]);

  const maxMotivoValor = topMotivos.length > 0 ? topMotivos[0][1].valor : 1;

  const cards = [
    { label: "Valor Total em RNC", value: stats.valorTotal, color: "bg-primary", textColor: "text-primary", icon: "📊" },
    { label: "Valor Recuperado", value: stats.valorRecuperado, color: "bg-status-resolvido", textColor: "text-status-resolvido", icon: "✅" },
    { label: "Valor Pendente", value: stats.valorPendente, color: "bg-status-pendente", textColor: "text-status-pendente", icon: "⏳" },
    { label: "Valor em Andamento", value: stats.valorEmAndamento, color: "bg-status-andamento", textColor: "text-status-andamento", icon: "🔄" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <span className="text-base">💰</span>
        </div>
        <h3 className="text-lg font-extrabold text-foreground">Painel Financeiro</h3>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${card.textColor}`}>{formatarMoeda(card.value)}</p>
            {card.label === "Valor Recuperado" && stats.valorTotal > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {Math.round((stats.valorRecuperado / stats.valorTotal) * 100)}% do total
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-status-resolvido transition-all duration-500"
                    style={{ width: `${(stats.valorRecuperado / stats.valorTotal) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Materiais por valor */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h4 className="text-sm font-bold text-foreground mb-4">Materiais com Maior Impacto Financeiro</h4>
          {topMateriais.length > 0 ? (
            <div className="space-y-3">
              {topMateriais.map(([nome, data]) => (
                <div key={nome} className="flex items-center justify-between">
                  <span className="text-sm text-foreground truncate flex-1">{nome}</span>
                  <div className="text-right ml-2">
                    <span className="text-sm font-bold text-foreground">{formatarMoeda(data.valor)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({data.qtd} un.)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>

        {/* Motivos por valor */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h4 className="text-sm font-bold text-foreground mb-4">Impacto Financeiro por Motivo</h4>
          {topMotivos.length > 0 ? (
            <div className="space-y-3">
              {topMotivos.map(([motivo, data]) => (
                <div key={motivo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{motivo}</span>
                    <span className="text-sm font-bold text-foreground">{formatarMoeda(data.valor)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${(data.valor / maxMotivoValor) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  );
}
