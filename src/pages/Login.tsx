import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [persist, setPersist] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password, persist);
      setLoading(false);
      if (ok) navigate("/", { replace: true });
      else setError("Usuário ou senha incorretos.");
    }, 250);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary text-primary-foreground">
      {/* Animated golden gradient backdrop */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[700px] w-[700px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left side - Branding */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <img src="/logo-50anos.png" alt="Andra 50 Anos" className="h-24 drop-shadow-2xl" />
            </div>
            <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Sistema <span className="text-accent">RNC</span>
            </h1>
            <p className="mt-3 text-lg font-medium text-accent">
              Gestão de Não Conformidades · 50 Anos
            </p>
            <p className="mt-6 max-w-md mx-auto lg:mx-0 text-sm text-primary-foreground/70 leading-relaxed">
              Plataforma profissional para registro, acompanhamento e análise de
              não conformidades de fornecedores. Construída com a tradição de meio
              século da Andra Materiais Elétricos.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { label: "Anos", value: "50" },
                { label: "Offline", value: "100%" },
                { label: "Seguro", value: "✓" },
              ].map((b) => (
                <div key={b.label} className="rounded-lg border border-accent/20 bg-primary-foreground/5 p-3 text-center backdrop-blur-sm">
                  <p className="text-2xl font-extrabold text-accent">{b.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col justify-center">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/40 via-accent/10 to-accent/40 blur" />
              <div className="relative rounded-2xl border border-accent/20 bg-card p-8 shadow-2xl">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-extrabold text-foreground">Acesso ao Sistema</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entre com suas credenciais para continuar
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Usuário
                    </label>
                    <input
                      id="username"
                      autoFocus
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="seu.usuario"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={persist}
                      onChange={(e) => setPersist(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    Manter conectado neste dispositivo
                  </label>

                  {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Entrando..." : "Entrar no Sistema"}
                  </button>
                </form>

                <div className="mt-6 rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-foreground">
                  <p className="font-semibold text-foreground">Acesso inicial</p>
                  <p className="mt-1 text-muted-foreground">
                    Usuário: <code className="font-mono font-bold text-accent-foreground bg-accent/30 px-1 rounded">admin</code>{" "}
                    · Senha: <code className="font-mono font-bold text-accent-foreground bg-accent/30 px-1 rounded">admin</code>
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Altere a senha no painel administrativo após o primeiro acesso.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-primary-foreground/50">
              © 2025 Andra S.A. Electric Solutions · 50 Anos · Desenvolvido por Charles Santos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
