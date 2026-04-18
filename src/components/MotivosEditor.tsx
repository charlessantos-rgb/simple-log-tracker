import { useState } from "react";
import { toast } from "sonner";

interface MotivosEditorProps {
  motivos: string[];
  onChange: (list: string[]) => void;
}

export function MotivosEditor({ motivos, onChange }: MotivosEditorProps) {
  const [novo, setNovo] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValor, setEditValor] = useState("");

  function adicionar() {
    const v = novo.trim();
    if (!v) {
      toast.error("Informe o motivo");
      return;
    }
    if (motivos.some((m) => m.toLowerCase() === v.toLowerCase())) {
      toast.error("Esse motivo já existe");
      return;
    }
    onChange([...motivos, v]);
    setNovo("");
    toast.success("Motivo adicionado");
  }

  function remover(idx: number) {
    if (!confirm(`Remover o motivo "${motivos[idx]}"?`)) return;
    onChange(motivos.filter((_, i) => i !== idx));
    toast.success("Motivo removido");
  }

  function iniciarEdicao(idx: number) {
    setEditIdx(idx);
    setEditValor(motivos[idx]);
  }

  function salvarEdicao() {
    if (editIdx === null) return;
    const v = editValor.trim();
    if (!v) {
      toast.error("O motivo não pode ficar em branco");
      return;
    }
    if (motivos.some((m, i) => i !== editIdx && m.toLowerCase() === v.toLowerCase())) {
      toast.error("Já existe um motivo com esse nome");
      return;
    }
    const nova = [...motivos];
    nova[editIdx] = v;
    onChange(nova);
    setEditIdx(null);
    setEditValor("");
    toast.success("Motivo atualizado");
  }

  function mover(idx: number, dir: -1 | 1) {
    const novoIdx = idx + dir;
    if (novoIdx < 0 || novoIdx >= motivos.length) return;
    const nova = [...motivos];
    [nova[idx], nova[novoIdx]] = [nova[novoIdx], nova[idx]];
    onChange(nova);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionar(); } }}
          placeholder="Ex.: Produto fora do padrão de qualidade"
          className="flex-1 border border-input bg-background px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={adicionar}
          className="bg-primary px-4 py-2 text-sm font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity"
        >
          + Adicionar
        </button>
      </div>

      <div className="rounded border bg-background overflow-hidden">
        {motivos.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum motivo cadastrado.
          </p>
        ) : (
          <ul className="divide-y">
            {motivos.map((m, i) => (
              <li key={i} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/30 transition-colors">
                <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}.</span>
                {editIdx === i ? (
                  <>
                    <input
                      value={editValor}
                      onChange={(e) => setEditValor(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); salvarEdicao(); } }}
                      autoFocus
                      className="flex-1 border border-input bg-background px-2 py-1 text-sm rounded"
                    />
                    <button type="button" onClick={salvarEdicao} className="text-xs text-status-resolvido hover:underline font-semibold">Salvar</button>
                    <button type="button" onClick={() => { setEditIdx(null); setEditValor(""); }} className="text-xs text-muted-foreground hover:underline">Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-foreground">{m}</span>
                    <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-1" title="Subir">▲</button>
                    <button type="button" onClick={() => mover(i, 1)} disabled={i === motivos.length - 1} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-1" title="Descer">▼</button>
                    <button type="button" onClick={() => iniciarEdicao(i)} className="text-xs text-foreground hover:underline">Editar</button>
                    <button type="button" onClick={() => remover(i)} className="text-xs text-destructive hover:underline">Remover</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Os motivos aparecem na lista do formulário de RNC e são usados para gerar a descrição automática.
      </p>
    </div>
  );
}
