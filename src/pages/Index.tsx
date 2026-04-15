import { useState, useEffect } from "react";
import {
  Ocorrencia,
  Fornecedor,
  loadOcorrencias,
  saveOcorrencias,
  loadFornecedores,
  saveFornecedores,
} from "@/lib/rnc-types";
import { Dashboard } from "@/components/Dashboard";
import { DashboardFinanceiro } from "@/components/DashboardFinanceiro";
import { TabelaOcorrencias } from "@/components/TabelaOcorrencias";
import { FormOcorrencia } from "@/components/FormOcorrencia";
import { CadastroFornecedor } from "@/components/CadastroFornecedor";
import { RelatorioEmail } from "@/components/RelatorioEmail";
import { RelatorioGerencial } from "@/components/RelatorioGerencial";

const Index = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(loadOcorrencias);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(loadFornecedores);
  const [showNovaRNC, setShowNovaRNC] = useState(false);
  const [editOcorrencia, setEditOcorrencia] = useState<Ocorrencia | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showEditRNC, setShowEditRNC] = useState(false);
  const [enviarOcorrencia, setEnviarOcorrencia] = useState<Ocorrencia | null>(null);
  const [showRelatorio, setShowRelatorio] = useState(false);

  useEffect(() => { saveOcorrencias(ocorrencias); }, [ocorrencias]);
  useEffect(() => { saveFornecedores(fornecedores); }, [fornecedores]);

  function handleSaveOcorrencia(o: Ocorrencia) {
    setOcorrencias((prev) => {
      const exists = prev.find((p) => p.id === o.id);
      if (exists) return prev.map((p) => (p.id === o.id ? o : p));
      return [o, ...prev];
    });
    setShowNovaRNC(false);
    setShowEditRNC(false);
    setEditOcorrencia(null);
  }

  function handleEdit(o: Ocorrencia) {
    setEditOcorrencia(o);
    setShowEditRNC(true);
  }

  function handleDelete(id: string) {
    if (confirm("Deseja excluir esta ocorrência?")) {
      setOcorrencias((prev) => prev.filter((o) => o.id !== id));
    }
  }

  function handleResolve(id: string) {
    setOcorrencias((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Resolvido" as const } : o))
    );
  }

  function handleSaveFornecedor(f: Fornecedor) {
    setFornecedores((prev) => [...prev, f]);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-6 py-0 shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo-50anos.png" alt="Andra 50 Anos" className="h-12" />
            <div className="h-6 w-px bg-primary-foreground/20" />
            <div>
              <h1 className="text-base font-bold text-primary-foreground leading-tight">Sistema RNC</h1>
              <p className="text-[11px] text-accent">Gestão de Não Conformidades</p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNovaRNC(true)}
              className="inline-flex items-center gap-1.5 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-md px-3.5 py-2 text-xs font-semibold text-accent transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova RNC
            </button>
            <button
              onClick={() => setShowCadastro(true)}
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Fornecedores
            </button>
            <button
              onClick={() => setShowRelatorio(true)}
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Relatório
            </button>
            <button
              onClick={() => {
                setOcorrencias(loadOcorrencias());
                setFornecedores(loadFornecedores());
              }}
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Painel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Painel de Controle</h2>
              <p className="text-sm text-muted-foreground">Visão geral do sistema de gestão de não conformidades</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <Dashboard ocorrencias={ocorrencias} fornecedores={fornecedores} />
        </div>

        {/* Painel Financeiro */}
        <DashboardFinanceiro ocorrencias={ocorrencias} />

        {/* Tabela */}
        <TabelaOcorrencias
          ocorrencias={ocorrencias}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResolve={handleResolve}
          onEnviar={(o) => setEnviarOcorrencia(o)}
        />

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6 border-t">
          <p className="font-medium text-accent">Andra S.A. Electric Solutions · 50 Anos</p>
          <p className="mt-1">Desenvolvido por Charles Santos · ©2025</p>
        </footer>
      </main>

      {/* Modals */}
      {showNovaRNC && (
        <FormOcorrencia
          fornecedores={fornecedores}
          onSave={handleSaveOcorrencia}
          onClose={() => setShowNovaRNC(false)}
        />
      )}

      {showEditRNC && (
        <FormOcorrencia
          editData={editOcorrencia}
          fornecedores={fornecedores}
          onSave={handleSaveOcorrencia}
          onClose={() => { setShowEditRNC(false); setEditOcorrencia(null); }}
        />
      )}

      {showCadastro && (
        <CadastroFornecedor
          fornecedores={fornecedores}
          onSave={handleSaveFornecedor}
          onClose={() => setShowCadastro(false)}
        />
      )}

      {enviarOcorrencia && (
        <RelatorioEmail
          ocorrencia={enviarOcorrencia}
          fornecedor={fornecedores.find((f) => f.id === enviarOcorrencia.fornecedorId)}
          onClose={() => setEnviarOcorrencia(null)}
        />
      )}

      {showRelatorio && (
        <RelatorioGerencial
          ocorrencias={ocorrencias}
          fornecedores={fornecedores}
          onClose={() => setShowRelatorio(false)}
        />
      )}
    </div>
  );
};

export default Index;
