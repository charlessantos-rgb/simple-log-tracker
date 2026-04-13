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
import { TabelaOcorrencias } from "@/components/TabelaOcorrencias";
import { FormOcorrencia } from "@/components/FormOcorrencia";
import { CadastroFornecedor } from "@/components/CadastroFornecedor";
import { RelatorioEmail } from "@/components/RelatorioEmail";

const Index = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(loadOcorrencias);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(loadFornecedores);
  const [showNovaRNC, setShowNovaRNC] = useState(false);
  const [editOcorrencia, setEditOcorrencia] = useState<Ocorrencia | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showEditRNC, setShowEditRNC] = useState(false);
  const [enviarOcorrencia, setEnviarOcorrencia] = useState<Ocorrencia | null>(null);

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
      <header className="bg-primary px-6 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-xl">A</span>
            </div>
            <div className="h-8 w-px bg-primary-foreground/30" />
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Sistema RNC</h1>
              <p className="text-xs text-primary-foreground/70">Gestão de Não Conformidades</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNovaRNC(true)}
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova RNC
            </button>
            <button
              onClick={() => setShowCadastro(true)}
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Cadastro
            </button>
            <button
              onClick={() => setShowEditRNC(true)}
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Editar RNC
            </button>
            <button
              onClick={() => {
                setOcorrencias(loadOcorrencias());
                setFornecedores(loadFornecedores());
              }}
              className="inline-flex items-center gap-2 border border-primary-foreground/30 px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Painel */}
        <div>
          <h2 className="text-3xl font-extrabold text-primary mb-1">Painel</h2>
          <p className="text-sm text-muted-foreground mb-4">Visão geral do sistema de gestão de não conformidades</p>
          <Dashboard ocorrencias={ocorrencias} fornecedores={fornecedores} />
        </div>

        {/* Tabela */}
        <TabelaOcorrencias
          ocorrencias={ocorrencias}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResolve={handleResolve}
          onEnviar={(o) => setEnviarOcorrencia(o)}
        />

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-4 border-t">
          Desenvolvido por Charles Santos · VBA, C# Automação · ©2025 · ANDRA 50 Anos
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
    </div>
  );
};

export default Index;
