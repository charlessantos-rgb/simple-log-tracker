import { useState } from "react";
import { toast } from "sonner";

interface EmailListEditorProps {
  label: string;
  description?: string;
  emails: string[];
  onChange: (emails: string[]) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailListEditor({ label, description, emails, onChange }: EmailListEditorProps) {
  const [novo, setNovo] = useState("");

  function add() {
    const e = novo.trim();
    if (!e) return;
    if (!EMAIL_RE.test(e)) {
      toast.error("E-mail inválido");
      return;
    }
    if (emails.some((x) => x.toLowerCase() === e.toLowerCase())) {
      toast.error("E-mail já adicionado");
      return;
    }
    onChange([...emails, e]);
    setNovo("");
  }

  function remove(idx: number) {
    onChange(emails.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-bold text-foreground">{label}</label>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="exemplo@empresa.com.br"
          className="flex-1 border border-input bg-background px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={add}
          className="bg-primary px-4 py-2 text-xs font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity"
        >
          Adicionar
        </button>
      </div>
      {emails.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nenhum e-mail cadastrado.</p>
      ) : (
        <ul className="space-y-1">
          {emails.map((e, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/40 border rounded text-sm">
              <span className="font-mono text-xs">{e}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-destructive hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
