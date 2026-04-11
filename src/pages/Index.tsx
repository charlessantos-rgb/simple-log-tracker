import { useState, useEffect, useMemo } from "react";

type Status = "Aberto" | "Em Andamento" | "Resolvido" | "Cancelado";

interface Ocorrencia {
  id: string;
  protocolo: string;
  nota: string;
  fornecedor: string;
  status: Status;
  descricao: string;
  dataCriacao: string;
}

const STATUS_OPTIONS: Status[] = ["Aberto", "Em Andamento", "Resolvido", "Cancelado"];

const statusClasses: Record<Status, string> = {
  "Aberto": "bg-status-aberto-bg text-status-aberto",
  "Em Andamento": "bg-status-andamento-bg text-status-andamento",
  "Resolvido": "bg-status-resolvido-bg text-status-resolvido",
  "Cancelado": "bg-status-cancelado-bg text-status-cancelado",
};

function gerarProtocolo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const r = Math.floor(Math.random() * 9000 + 1000);
  return `OC-${y}${m}${d}-${r}`;
}

function loadData(): Ocorrencia[] {
  try {
    const raw = localStorage.getItem("ocorrencias");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(data: Ocorrencia[]) {
  localStorage.setItem("ocorrencias", JSON.stringify(data));
}

const emptyForm = { nota: "", fornecedor: "", status: "Aberto" as Status, descricao: "" };

const Index = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(loadData);
  const [busca, setBusca] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { saveData(ocorrencias); }, [ocorrencias]);

  const filtradas = useMemo(() => {
    if (!busca.trim()) return ocorrencias;
    const q = busca.toLowerCase();
    return ocorrencias.filter(
      (o) =>
        o.protocolo.toLowerCase().includes(q) ||
        o.nota.toLowerCase().includes(q) ||
        o.fornecedor.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [ocorrencias, busca]);

  const ultima = ocorrencias.length > 0
    ? ocorrencias.reduce((a, b) => (a.dataCriacao > b.dataCriacao ? a : b))
    : null;

  function abrirNovo() {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function abrirEdicao(o: Ocorrencia) {
    setEditId(o.id);
    setForm({ nota: o.nota, fornecedor: o.fornecedor, status: o.status, descricao: o.descricao });
    setFormOpen(true);
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nota.trim() || !form.fornecedor.trim()) return;

    if (editId) {
      setOcorrencias((prev) =>
        prev.map((o) => (o.id === editId ? { ...o, ...form } : o))
      );
    } else {
      const nova: Ocorrencia = {
        id: crypto.randomUUID(),
        protocolo: gerarProtocolo(),
        dataCriacao: new Date().toISOString(),
        ...form,
      };
      setOcorrencias((prev) => [nova, ...prev]);
    }
    setFormOpen(false);
    setForm(emptyForm);
    setEditId(null);
  }

  function excluir(id: string) {
    if (confirm("Deseja excluir esta ocorrência?")) {
      setOcorrencias((prev) => prev.filter((o) => o.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Controle de Ocorrências</h1>
              <p className="text-xs text-muted-foreground">Sistema Logístico</p>
            </div>
          </div>
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova Ocorrência
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total de Ocorrências</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{ocorrencias.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Última Ocorrência</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {ultima ? `${ultima.protocolo} — ${new Date(ultima.dataCriacao).toLocaleDateString("pt-BR")}` : "Nenhuma"}
            </p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por protocolo, nota, fornecedor ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Protocolo</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nota</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fornecedor</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    {ocorrencias.length === 0
                      ? "Nenhuma ocorrência cadastrada. Clique em \"Nova Ocorrência\" para começar."
                      : "Nenhum resultado encontrado."}
                  </td>
                </tr>
              ) : (
                filtradas.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{o.protocolo}</td>
                    <td className="px-4 py-3 text-foreground">{o.nota}</td>
                    <td className="px-4 py-3 text-foreground">{o.fornecedor}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.dataCriacao).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button onClick={() => abrirEdicao(o)} className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-primary hover:bg-muted transition-colors">
                        Editar
                      </button>
                      <button onClick={() => excluir(o.id)} className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Formulário */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setFormOpen(false)}>
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editId ? "Editar Ocorrência" : "Nova Ocorrência"}
            </h2>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nota Fiscal</label>
                <input
                  required
                  type="text"
                  value={form.nota}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ex: NF-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fornecedor</label>
                <input
                  required
                  type="text"
                  value={form.fornecedor}
                  onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Descreva a ocorrência..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {editId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
