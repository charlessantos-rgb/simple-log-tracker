import { useState, useEffect, useMemo } from "react";
import {
  Ocorrencia,
  Fornecedor,
  MaterialNaoConforme,
  Status,
  STATUS_OPTIONS,
  Conferente,
  gerarProtocolo,
  formatarMoeda,
  loadConferentes,
  loadMotivos,
  gerarDescricaoAutomatica,
} from "@/lib/rnc-types";

interface FormOcorrenciaProps {
  editData?: Ocorrencia | null;
  fornecedores: Fornecedor[];
  fornecedorPreSelecionadoId?: string;
  onSave: (o: Ocorrencia) => void;
  onClose: () => void;
}

const emptyMaterial: MaterialNaoConforme = {
  codigoAndra: "",
  codigoFornecedor: "",
  descricao: "",
  quantidade: 0,
  motivo: "",
  valorUnitario: 0,
};

export function FormOcorrencia({ editData, fornecedores, fornecedorPreSelecionadoId, onSave, onClose }: FormOcorrenciaProps) {
  const isEdit = !!editData;
  const [conferentesList] = useState<Conferente[]>(() => loadConferentes().filter((c) => c.ativo));
  const [MOTIVOS] = useState<string[]>(() => loadMotivos());

  const [status, setStatus] = useState<Status>(editData?.status || "Pendente");
  const [fornecedorId, setFornecedorId] = useState(editData?.fornecedorId || fornecedorPreSelecionadoId || "");
  const [notaFiscal, setNotaFiscal] = useState(editData?.notaFiscal || "");
  const [serie, setSerie] = useState(editData?.serie || "");
  const [chaveAcesso, setChaveAcesso] = useState(editData?.chaveAcesso || "");
  const [ordemCompra, setOrdemCompra] = useState(editData?.ordemCompra || "");
  const [cnpj, setCnpj] = useState(editData?.cnpj || "");
  const [materiais, setMateriais] = useState<MaterialNaoConforme[]>(editData?.materiais || []);
  const [embalagemLacrada, setEmbalagemLacrada] = useState(editData?.embalagemLacrada || false);
  const [embalagemAberta, setEmbalagemAberta] = useState(editData?.embalagemAberta || false);
  const [descricao, setDescricao] = useState(editData?.descricao || "");
  const [descricaoAuto, setDescricaoAuto] = useState(!isEdit);
  const [conferente, setConferente] = useState(editData?.conferente || "");

  const [matForm, setMatForm] = useState<MaterialNaoConforme>({ ...emptyMaterial });

  const selectedFornecedor = fornecedores.find((f) => f.id === fornecedorId);

  const descricaoSugerida = useMemo(() => gerarDescricaoAutomatica(materiais), [materiais]);

  // Atualiza descrição automaticamente quando materiais mudam (se modo auto ativo)
  useEffect(() => {
    if (descricaoAuto) setDescricao(descricaoSugerida);
  }, [descricaoSugerida, descricaoAuto]);

  function addMaterial() {
    if (!matForm.descricao.trim()) return;
    setMateriais((prev) => [...prev, { ...matForm }]);
    setMatForm({ ...emptyMaterial });
  }

  function removeMaterial(idx?: number) {
    if (typeof idx === "number") {
      setMateriais((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setMateriais((prev) => prev.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const oc: Ocorrencia = {
      id: editData?.id || crypto.randomUUID(),
      protocolo: editData?.protocolo || gerarProtocolo(),
      status,
      dataCriacao: editData?.dataCriacao || new Date().toISOString(),
      fornecedorId,
      fornecedorNome: selectedFornecedor?.nome || "",
      notaFiscal,
      serie,
      chaveAcesso,
      ordemCompra,
      cnpj: selectedFornecedor?.cnpj || cnpj,
      materiais,
      embalagemLacrada,
      embalagemAberta,
      descricao,
      conferente,
    };
    onSave(oc);
  }

  const protocolo = editData?.protocolo || gerarProtocolo();
  const totalMateriais = materiais.reduce((acc, m) => acc + (m.valorUnitario || 0) * (m.quantidade || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 border bg-card shadow-xl my-4 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary-foreground">
            {isEdit ? "Editar RNC" : "Nova Ocorrência (RNC)"}
          </span>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status + Date + Protocolo */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="font-medium text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="border bg-background px-2 py-1 text-sm text-foreground rounded focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium text-foreground">Data Abertura</label>
              <span className="border bg-background px-2 py-1 text-sm text-foreground rounded">
                {new Date(editData?.dataCriacao || Date.now()).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="font-semibold text-foreground">Protocolo</span>
              <span className="border bg-background px-2 py-1 text-xs font-mono text-foreground rounded">{protocolo}</span>
            </div>
          </div>

          {/* Fornecedor */}
          <fieldset className="border rounded p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Dados do Fornecedor</legend>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground w-20">Fornecedor</label>
              <select
                required
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className="flex-1 border bg-background px-2 py-1 text-sm text-foreground rounded focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">CNPJ</label>
                <input
                  value={selectedFornecedor?.cnpj || cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  readOnly={!!selectedFornecedor}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-48 rounded focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <span className="border bg-background px-2 py-1 text-sm text-foreground w-40 rounded">
                  {selectedFornecedor?.telefone || "—"}
                </span>
              </div>
            </div>
          </fieldset>

          {/* Nota Fiscal */}
          <fieldset className="border rounded p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Dados da Nota Fiscal</legend>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">NF</label>
                <input value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-28 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">Série</label>
                <input value={serie} onChange={(e) => setSerie(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-20 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1 flex-1 min-w-[260px]">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">Chave Acesso</label>
                <input value={chaveAcesso} onChange={(e) => setChaveAcesso(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground flex-1 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">O.C.</label>
                <input value={ordemCompra} onChange={(e) => setOrdemCompra(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-32 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
          </fieldset>

          {/* Materiais */}
          <fieldset className="border rounded p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Material Não Conforme</legend>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Cód. Andra</label>
                <input value={matForm.codigoAndra} onChange={(e) => setMatForm({ ...matForm, codigoAndra: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm w-28 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Cód. Forn.</label>
                <input value={matForm.codigoFornecedor} onChange={(e) => setMatForm({ ...matForm, codigoFornecedor: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm w-28 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-foreground">Descrição</label>
                <input value={matForm.descricao} onChange={(e) => setMatForm({ ...matForm, descricao: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Qtd</label>
                <input type="number" value={matForm.quantidade || ""} onChange={(e) => setMatForm({ ...matForm, quantidade: Number(e.target.value) })}
                  className="border bg-background px-2 py-1 text-sm w-20 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Vlr Unit. (R$)</label>
                <input type="number" step="0.01" value={matForm.valorUnitario || ""} onChange={(e) => setMatForm({ ...matForm, valorUnitario: Number(e.target.value) })}
                  className="border bg-background px-2 py-1 text-sm w-28 rounded focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Motivo</label>
                <select value={matForm.motivo} onChange={(e) => setMatForm({ ...matForm, motivo: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm w-44 rounded focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Selecione...</option>
                  {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button type="button" onClick={addMaterial}
                className="bg-status-resolvido px-4 py-1.5 text-xs font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity">
                + Adicionar
              </button>
            </div>

            <div className="border rounded bg-background max-h-44 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="border-b">
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Cód. Andra</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Cód. Forn.</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Descrição</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Qtd</th>
                    <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Vlr Unit.</th>
                    <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Subtotal</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Motivo</th>
                    <th className="px-2 py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {materiais.length === 0 ? (
                    <tr><td colSpan={9} className="px-2 py-4 text-center text-muted-foreground">Nenhum material adicionado</td></tr>
                  ) : (
                    materiais.map((m, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-2 py-1">{i + 1}</td>
                        <td className="px-2 py-1">{m.codigoAndra}</td>
                        <td className="px-2 py-1">{m.codigoFornecedor}</td>
                        <td className="px-2 py-1">{m.descricao}</td>
                        <td className="px-2 py-1 text-center">{m.quantidade}</td>
                        <td className="px-2 py-1 text-right">{formatarMoeda(m.valorUnitario || 0)}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatarMoeda((m.valorUnitario || 0) * (m.quantidade || 0))}</td>
                        <td className="px-2 py-1">{m.motivo}</td>
                        <td className="px-2 py-1 text-right">
                          <button type="button" onClick={() => removeMaterial(i)} className="text-destructive hover:underline text-xs">Remover</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={embalagemLacrada} onChange={(e) => setEmbalagemLacrada(e.target.checked)} />
                Embalagem lacrada
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={embalagemAberta} onChange={(e) => setEmbalagemAberta(e.target.checked)} />
                Embalagem aberta / manipulada
              </label>
              <span className="text-sm font-bold text-foreground ml-auto">
                Total interno: {formatarMoeda(totalMateriais)}
              </span>
            </div>
          </fieldset>

          {/* Descrição automática */}
          <fieldset className="border rounded p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Descrição da Ocorrência</legend>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={descricaoAuto}
                  onChange={(e) => {
                    setDescricaoAuto(e.target.checked);
                    if (e.target.checked) setDescricao(descricaoSugerida);
                  }}
                />
                Gerar descrição automaticamente a partir dos materiais e motivos
              </label>
              {!descricaoAuto && descricaoSugerida && (
                <button
                  type="button"
                  onClick={() => setDescricao(descricaoSugerida)}
                  className="text-xs text-accent-foreground bg-accent/40 hover:bg-accent/60 px-2 py-1 rounded transition-colors"
                >
                  Aplicar sugestão automática
                </button>
              )}
            </div>
            <textarea
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                setDescricaoAuto(false);
              }}
              rows={4}
              className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground rounded resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="A descrição será gerada automaticamente conforme você adicionar materiais com motivo..."
            />
          </fieldset>

          {/* Conferente */}
          <fieldset className="border rounded p-3">
            <legend className="px-2 text-sm font-bold text-foreground">Responsável pela Conferência</legend>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm font-medium text-foreground">Conferente</label>
              {conferentesList.length > 0 ? (
                <select
                  required
                  value={conferente}
                  onChange={(e) => setConferente(e.target.value)}
                  className="border bg-background px-2 py-1.5 text-sm text-foreground w-72 rounded focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Selecione um conferente...</option>
                  {conferentesList.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome}{c.setor ? ` — ${c.setor}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    value={conferente}
                    onChange={(e) => setConferente(e.target.value)}
                    placeholder="Digite o nome (cadastre conferentes no painel admin)"
                    className="border bg-background px-2 py-1 text-sm text-foreground w-80 rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">Nenhum conferente cadastrado — peça ao admin</span>
                </>
              )}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="border px-6 py-2 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground rounded hover:opacity-90 transition-opacity">
              Salvar RNC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
