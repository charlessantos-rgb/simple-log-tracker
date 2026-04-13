import { useState } from "react";
import { Fornecedor } from "@/lib/rnc-types";

interface CadastroFornecedorProps {
  fornecedores: Fornecedor[];
  onSave: (f: Fornecedor) => void;
  onClose: () => void;
}

export function CadastroFornecedor({ fornecedores, onSave, onClose }: CadastroFornecedorProps) {
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      ...form,
    });
    setForm({ nome: "", cnpj: "", email: "", telefone: "" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 border bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header preto */}
        <div className="bg-primary px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground font-extrabold text-lg">A</span>
          </div>
          <div className="h-8 w-px bg-primary-foreground/30" />
          <h2 className="text-lg font-bold text-primary-foreground">Cadastro Fornecedor</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-sm font-medium text-foreground">Fornecedor</label>
            <input
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-sm font-medium text-foreground">CNPJ</label>
            <input
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              className="border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-sm font-medium text-foreground">Telefone</label>
            <input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Cadastrar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
