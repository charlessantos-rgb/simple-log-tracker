import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Ocorrencia,
  Fornecedor,
  loadOcorrencias,
  saveOcorrencias,
  loadFornecedores,
  saveFornecedores,
} from "@/lib/rnc-types";
import { exportarParaExcel, importarDeExcel } from "@/lib/excel-db";
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { DashboardFinanceiro } from "@/components/DashboardFinanceiro";
import { TabelaOcorrencias } from "@/components/TabelaOcorrencias";
import { FormOcorrencia } from "@/components/FormOcorrencia";
import { CadastroFornecedor } from "@/components/CadastroFornecedor";
import { RelatorioEmail } from "@/components/RelatorioEmail";
import { DashboardRelatorios } from "@/components/DashboardRelatorios";
import { RelatorioDiario } from "@/components/RelatorioDiario";

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(loadOcorrencias);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(loadFornecedores);
  const [showNovaRNC, setShowNovaRNC] = useState(false);
  const [editOcorrencia, setEditOcorrencia] = useState<Ocorrencia | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showEditRNC, setShowEditRNC] = useState(false);
  const [enviarOcorrencia, setEnviarOcorrencia] = useState<Ocorrencia | null>(null);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [showRelatorioDiario, setShowRelatorioDiario] = useState(false);
  const [showArquivo, setShowArquivo] = useState(false);
  const [fornecedorPreSelecionadoId, setFornecedorPreSelecionadoId] = useState<string | undefined>(undefined);

  const ocorrenciasAtivas = ocorrencias.filter((o) => o.status !== "Resolvido");
  const ocorrenciasArquivadas = ocorrencias.filter((o) => o.status === "Resolvido");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveOcorrencias(ocorrencias); }, [ocorrencias]);
  useEffect(() => { saveFornecedores(fornecedores); }, [fornecedores]);

  async function handleImportarExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("Atenção: importar uma planilha SUBSTITUIRÁ todos os dados atuais (ocorrências, fornecedores, conferentes, usuários e configurações). Deseja continuar?")) {
      e.target.value = "";
      return;
    }
    try {
      const r = await importarDeExcel(file);
      setOcorrencias(loadOcorrencias());
      setFornecedores(loadFornecedores());
      toast.success("Importação concluída", {
        description: `${r.ocorrencias} ocorrências, ${r.materiais} materiais, ${r.fornecedores} fornecedores, ${r.conferentes} conferentes, ${r.usuarios} usuários.`,
      });
    } catch (err: any) {
      toast.error(`Erro ao importar: ${err.message || err}`);
    } finally {
      e.target.value = "";
    }
  }

  function handleSaveOcorrencia(o: Ocorrencia) {
    setOcorrencias((prev) => {
      const exists = prev.find((p) => p.id === o.id);
      if (exists) return prev.map((p) => (p.id === o.id ? o : p));
      return [o, ...prev];
    });
    setShowNovaRNC(false);
    setShowEditRNC(false);
    setEditOcorrencia(null);
    setFornecedorPreSelecionadoId(undefined);
    toast.success(`RNC ${o.protocolo} salva`);
  }

  function handleEdit(o: Ocorrencia) {
    setEditOcorrencia(o);
    setShowEditRNC(true);
  }

  function handleDelete(id: string) {
    if (confirm("Deseja excluir esta ocorrência?")) {
      setOcorrencias((prev) => prev.filter((o) => o.id !== id));
      toast.success("Ocorrência excluída");
    }
  }

  function handleResolve(id: string) {
    setOcorrencias((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Resolvido" as const } : o))
    );
    toast.success("Marcada como resolvida");
  }

  function handleSaveFornecedor(f: Fornecedor) {
    setFornecedores((prev) => [...prev, f]);
  }

  function handleAbrirRNCComFornecedor(f: Fornecedor) {
    setShowCadastro(false);
    setFornecedorPreSelecionadoId(f.id);
    setShowNovaRNC(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-6 py-0 shadow-lg sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between h-16 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <img src="/logo-50anos.png" alt="Andra 50 Anos" className="h-12" />
            <div className="h-6 w-px bg-primary-foreground/20" />
            <div>
              <h1 className="text-base font-bold text-primary-foreground leading-tight">Sistema RNC</h1>
              <p className="text-[11px] text-accent">Gestão de Não Conformidades · 50 Anos</p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowNovaRNC(true)}
              className="inline-flex items-center gap-1.5 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-md px-3 py-2 text-xs font-semibold text-accent transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova RNC
            </button>
            <button
              onClick={() => setShowCadastro(true)}
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              Fornecedores
            </button>
            <button
              onClick={() => setShowRelatorio(true)}
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              Relatórios
            </button>
            <button
              onClick={() => setShowRelatorioDiario(true)}
              title="Relatório do dia para envio por e-mail"
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              Relatório do Dia
            </button>
            <button
              onClick={exportarParaExcel}
              title="Baixar todos os dados como planilha Excel"
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              Exportar
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importar dados de uma planilha Excel"
              className="inline-flex items-center gap-1.5 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              Importar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportarExcel}
              className="hidden"
            />

            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground hover:opacity-90 rounded-md px-3 py-2 text-xs font-bold transition-opacity"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </button>
            )}

            <div className="h-6 w-px bg-primary-foreground/20 mx-1" />

            <div className="flex items-center gap-2 text-primary-foreground">
              <div className="h-7 w-7 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold">
                {user?.nome?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-semibold">{user?.nome}</span>
                <span className="text-[10px] text-primary-foreground/60">{user?.role === "admin" ? "Admin" : "Usuário"}</span>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate("/login"); }}
              title="Sair"
              className="inline-flex items-center gap-1 hover:bg-destructive/30 border border-primary-foreground/15 rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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

        <DashboardFinanceiro ocorrencias={ocorrencias} />

        <TabelaOcorrencias
          ocorrencias={ocorrencias}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResolve={handleResolve}
          onEnviar={(o) => setEnviarOcorrencia(o)}
        />

        <footer className="text-center text-xs text-muted-foreground py-6 border-t">
          <p className="font-medium text-accent">Andra S.A. Electric Solutions · 50 Anos</p>
          <p className="mt-1">Desenvolvido por Charles Santos · ©2025</p>
        </footer>
      </main>

      {showNovaRNC && (
        <FormOcorrencia
          fornecedores={fornecedores}
          fornecedorPreSelecionadoId={fornecedorPreSelecionadoId}
          onSave={handleSaveOcorrencia}
          onClose={() => { setShowNovaRNC(false); setFornecedorPreSelecionadoId(undefined); }}
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
          onAbrirRNC={handleAbrirRNCComFornecedor}
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
        <DashboardRelatorios
          ocorrencias={ocorrencias}
          fornecedores={fornecedores}
          onClose={() => setShowRelatorio(false)}
        />
      )}

      {showRelatorioDiario && (
        <RelatorioDiario
          ocorrencias={ocorrencias}
          onClose={() => setShowRelatorioDiario(false)}
        />
      )}
    </div>
  );
};

export default Index;
