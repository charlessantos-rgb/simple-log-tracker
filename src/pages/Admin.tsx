import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Conferente,
  Usuario,
  UserRole,
  AppConfig,
  loadConferentes,
  saveConferentes,
  loadUsuarios,
  saveUsuarios,
  loadConfig,
  saveConfig,
  hashPassword,
} from "@/lib/rnc-types";
import { useAuth } from "@/contexts/AuthContext";
import { EmailListEditor } from "@/components/EmailListEditor";

type Tab = "conferentes" | "usuarios" | "config";

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("conferentes");

  const [conferentes, setConferentes] = useState<Conferente[]>(loadConferentes());
  const [usuarios, setUsuarios] = useState<Usuario[]>(loadUsuarios());
  const [config, setConfig] = useState<AppConfig>(loadConfig());

  // Conferente form
  const [novoConfNome, setNovoConfNome] = useState("");
  const [novoConfSetor, setNovoConfSetor] = useState("");

  // Usuario form
  const [novoUserUsername, setNovoUserUsername] = useState("");
  const [novoUserNome, setNovoUserNome] = useState("");
  const [novoUserEmail, setNovoUserEmail] = useState("");
  const [novoUserRole, setNovoUserRole] = useState<UserRole>("user");
  const [novoUserSenha, setNovoUserSenha] = useState("");

  function persistConferentes(novo: Conferente[]) {
    setConferentes(novo);
    saveConferentes(novo);
  }
  function persistUsuarios(novo: Usuario[]) {
    setUsuarios(novo);
    saveUsuarios(novo);
  }

  function addConferente() {
    if (!novoConfNome.trim()) {
      toast.error("Informe o nome do conferente");
      return;
    }
    if (conferentes.some((c) => c.nome.toLowerCase() === novoConfNome.trim().toLowerCase())) {
      toast.error("Já existe um conferente com esse nome");
      return;
    }
    persistConferentes([
      ...conferentes,
      { id: crypto.randomUUID(), nome: novoConfNome.trim(), setor: novoConfSetor.trim() || undefined, ativo: true },
    ]);
    setNovoConfNome("");
    setNovoConfSetor("");
    toast.success("Conferente cadastrado");
  }

  function toggleConferente(id: string) {
    persistConferentes(conferentes.map((c) => c.id === id ? { ...c, ativo: !c.ativo } : c));
  }

  function removeConferente(id: string) {
    if (!confirm("Remover este conferente?")) return;
    persistConferentes(conferentes.filter((c) => c.id !== id));
    toast.success("Conferente removido");
  }

  function addUsuario() {
    if (!novoUserUsername.trim() || !novoUserNome.trim() || !novoUserSenha) {
      toast.error("Preencha usuário, nome e senha");
      return;
    }
    if (usuarios.some((u) => u.username.toLowerCase() === novoUserUsername.trim().toLowerCase())) {
      toast.error("Já existe um usuário com esse login");
      return;
    }
    if (novoUserSenha.length < 4) {
      toast.error("Senha deve ter ao menos 4 caracteres");
      return;
    }
    const novo: Usuario = {
      id: crypto.randomUUID(),
      username: novoUserUsername.trim(),
      nome: novoUserNome.trim(),
      email: novoUserEmail.trim(),
      role: novoUserRole,
      passwordHash: hashPassword(novoUserSenha),
      ativo: true,
      dataCriacao: new Date().toISOString(),
    };
    persistUsuarios([...usuarios, novo]);
    setNovoUserUsername("");
    setNovoUserNome("");
    setNovoUserEmail("");
    setNovoUserSenha("");
    setNovoUserRole("user");
    toast.success(`Usuário "${novo.username}" criado`);
  }

  function toggleUsuario(id: string) {
    if (id === user?.id) {
      toast.error("Você não pode desativar seu próprio usuário");
      return;
    }
    persistUsuarios(usuarios.map((u) => u.id === id ? { ...u, ativo: !u.ativo } : u));
  }

  function removeUsuario(id: string) {
    if (id === user?.id) {
      toast.error("Você não pode remover seu próprio usuário");
      return;
    }
    if (!confirm("Remover este usuário?")) return;
    persistUsuarios(usuarios.filter((u) => u.id !== id));
    toast.success("Usuário removido");
  }

  function resetSenha(u: Usuario) {
    const nova = prompt(`Nova senha para "${u.username}":`);
    if (!nova || nova.length < 4) {
      if (nova !== null) toast.error("Senha muito curta");
      return;
    }
    persistUsuarios(usuarios.map((x) => x.id === u.id ? { ...x, passwordHash: hashPassword(nova) } : x));
    toast.success("Senha redefinida");
  }

  function salvarConfig(e: React.FormEvent) {
    e.preventDefault();
    saveConfig(config);
    toast.success("Configurações salvas");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-6 py-3 shadow-lg">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-50anos.png" alt="Andra 50" className="h-10" />
            <div className="h-8 w-px bg-accent/40" />
            <div>
              <h1 className="text-base font-extrabold text-primary-foreground">Painel Administrativo</h1>
              <p className="text-[11px] text-accent">Andra · Sistema RNC · 50 Anos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar ao Sistema
            </button>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="inline-flex items-center gap-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/40 text-destructive-foreground rounded-md px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {([
            { id: "conferentes", label: "Conferentes" },
            { id: "usuarios", label: "Usuários" },
            { id: "config", label: "Configurações" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conferentes */}
        {tab === "conferentes" && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Cadastrar Conferente</h3>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome *</label>
                  <input value={novoConfNome} onChange={(e) => setNovoConfNome(e.target.value)} placeholder="Nome completo do conferente"
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Setor</label>
                  <input value={novoConfSetor} onChange={(e) => setNovoConfSetor(e.target.value)} placeholder="Ex.: Recebimento"
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <button onClick={addConferente}
                  className="bg-primary px-5 py-2 text-sm font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity">
                  Cadastrar
                </button>
              </div>
            </div>

            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="text-sm font-bold text-foreground">Conferentes Cadastrados ({conferentes.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Setor</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {conferentes.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum conferente cadastrado</td></tr>
                  ) : conferentes.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2 font-medium">{c.nome}</td>
                      <td className="px-4 py-2 text-muted-foreground">{c.setor || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.ativo ? "bg-status-resolvido/10 text-status-resolvido" : "bg-muted text-muted-foreground"}`}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button onClick={() => toggleConferente(c.id)} className="text-xs text-foreground hover:underline">
                          {c.ativo ? "Desativar" : "Ativar"}
                        </button>
                        <button onClick={() => removeConferente(c.id)} className="text-xs text-destructive hover:underline">
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usuários */}
        {tab === "usuarios" && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Cadastrar Usuário</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Login *</label>
                  <input value={novoUserUsername} onChange={(e) => setNovoUserUsername(e.target.value)} placeholder="ex: joao.silva"
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome completo *</label>
                  <input value={novoUserNome} onChange={(e) => setNovoUserNome(e.target.value)}
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">E-mail</label>
                  <input type="email" value={novoUserEmail} onChange={(e) => setNovoUserEmail(e.target.value)}
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Perfil</label>
                  <select value={novoUserRole} onChange={(e) => setNovoUserRole(e.target.value as UserRole)}
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded">
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Senha *</label>
                  <input type="password" value={novoUserSenha} onChange={(e) => setNovoUserSenha(e.target.value)} placeholder="mín. 4 caracteres"
                    className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
                </div>
                <div className="flex items-end">
                  <button onClick={addUsuario}
                    className="w-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity">
                    Cadastrar Usuário
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="text-sm font-bold text-foreground">Usuários ({usuarios.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Login</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">E-mail</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Perfil</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {usuarios.map((u) => (
                    <tr key={u.id} className={u.id === user?.id ? "bg-accent/5" : ""}>
                      <td className="px-4 py-2 font-mono text-xs">{u.username}{u.id === user?.id && <span className="ml-2 text-[10px] text-accent-foreground bg-accent/40 px-1.5 rounded">você</span>}</td>
                      <td className="px-4 py-2 font-medium">{u.nome}</td>
                      <td className="px-4 py-2 text-muted-foreground">{u.email || "—"}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-accent/30 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                          {u.role === "admin" ? "Admin" : "Usuário"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.ativo ? "bg-status-resolvido/10 text-status-resolvido" : "bg-muted text-muted-foreground"}`}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button onClick={() => resetSenha(u)} className="text-xs text-foreground hover:underline">Trocar senha</button>
                        <button onClick={() => toggleUsuario(u.id)} className="text-xs text-foreground hover:underline">{u.ativo ? "Desativar" : "Ativar"}</button>
                        <button onClick={() => removeUsuario(u.id)} className="text-xs text-destructive hover:underline">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configurações */}
        {tab === "config" && (
          <form onSubmit={salvarConfig} className="rounded-lg border bg-card p-5 space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-foreground">Identificação do Remetente (assinatura dos e-mails/relatórios)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome</label>
                <input value={config.remetenteNome} onChange={(e) => setConfig({ ...config, remetenteNome: e.target.value })}
                  className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Cargo</label>
                <input value={config.remetenteCargo} onChange={(e) => setConfig({ ...config, remetenteCargo: e.target.value })}
                  className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Empresa</label>
                <input value={config.remetenteEmpresa} onChange={(e) => setConfig({ ...config, remetenteEmpresa: e.target.value })}
                  className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Site</label>
                <input value={config.remetenteSite} onChange={(e) => setConfig({ ...config, remetenteSite: e.target.value })}
                  className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">E-mail destinatário padrão (opcional)</label>
                <input type="email" value={config.destinatarioPadrao || ""} onChange={(e) => setConfig({ ...config, destinatarioPadrao: e.target.value })} placeholder="usado quando o fornecedor não tem e-mail"
                  className="w-full border border-input bg-background px-3 py-2 text-sm rounded" />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Contatos com Cópia (CC)</h3>

              <div className="rounded-md border bg-muted/20 p-3">
                <EmailListEditor
                  label="Destinatários em CC para Novas RNCs"
                  description="Esses e-mails serão automaticamente incluídos em cópia ao enviar uma nova RNC ao fornecedor."
                  emails={config.ccNovaRNC || []}
                  onChange={(list) => setConfig({ ...config, ccNovaRNC: list })}
                />
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <EmailListEditor
                  label="Destinatários do Relatório Diário"
                  description="E-mails que receberão o resumo diário das ocorrências. O primeiro será o destinatário principal; os demais entram em cópia."
                  emails={config.ccRelatorio || []}
                  onChange={(list) => setConfig({ ...config, ccRelatorio: list })}
                />
              </div>
            </div>

            <div>
              <button type="submit"
                className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity">
                Salvar configurações
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
