import { useState } from "react";
import {
  Ocorrencia,
  Fornecedor,
  MaterialNaoConforme,
  Status,
  STATUS_OPTIONS,
  gerarProtocolo,
} from "@/lib/rnc-types";

interface FormOcorrenciaProps {
  editData?: Ocorrencia | null;
  fornecedores: Fornecedor[];
  onSave: (o: Ocorrencia) => void;
  onClose: () => void;
}

const emptyMaterial: MaterialNaoConforme = {
  codigoAndra: "",
  codigoFornecedor: "",
  descricao: "",
  quantidade: 0,
  motivo: "",
};

const MOTIVOS = [
  "Quantidade divergente",
  "Material danificado",
  "Material incorreto",
  "Falta de material",
  "Validade vencida",
  "Outros",
];

export function FormOcorrencia({ editData, fornecedores, onSave, onClose }: FormOcorrenciaProps) {
  const isEdit = !!editData;

  const [status, setStatus] = useState<Status>(editData?.status || "Pendente");
  const [fornecedorId, setFornecedorId] = useState(editData?.fornecedorId || "");
  const [notaFiscal, setNotaFiscal] = useState(editData?.notaFiscal || "");
  const [serie, setSerie] = useState(editData?.serie || "");
  const [chaveAcesso, setChaveAcesso] = useState(editData?.chaveAcesso || "");
  const [ordemCompra, setOrdemCompra] = useState(editData?.ordemCompra || "");
  const [cnpj, setCnpj] = useState(editData?.cnpj || "");
  const [materiais, setMateriais] = useState<MaterialNaoConforme[]>(editData?.materiais || []);
  const [embalagemLacrada, setEmbalagemLacrada] = useState(editData?.embalagemLacrada || false);
  const [embalagemAberta, setEmbalagemAberta] = useState(editData?.embalagemAberta || false);
  const [descricao, setDescricao] = useState(editData?.descricao || "");
  const [conferente, setConferente] = useState(editData?.conferente || "");

  // Material form
  const [matForm, setMatForm] = useState<MaterialNaoConforme>({ ...emptyMaterial });

  const selectedFornecedor = fornecedores.find((f) => f.id === fornecedorId);

  function addMaterial() {
    if (!matForm.descricao.trim()) return;
    setMateriais((prev) => [...prev, { ...matForm }]);
    setMatForm({ ...emptyMaterial });
  }

  function removeMaterial() {
    setMateriais((prev) => prev.slice(0, -1));
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 border bg-card shadow-xl my-4" onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
          <span className="text-sm font-semibold text-foreground">
            {isEdit ? "Editar RNC" : "Abrir Ocorrência"}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Status + Date + Protocolo */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="font-medium text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium text-foreground">Data Abertura</label>
              <span className="border bg-background px-2 py-1 text-sm text-foreground">
                {new Date(editData?.dataCriacao || Date.now()).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="font-semibold text-foreground">Registro de Nova Não Conformidade - Protocolo</span>
              <span className="border bg-background px-2 py-1 text-xs font-mono text-foreground">{protocolo}</span>
            </div>
          </div>

          {/* Dados do Fornecedor */}
          <fieldset className="border p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Dados do Fornecedor</legend>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground w-20">Fornecedor</label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className="flex-1 border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">CNPJ</label>
                <input
                  value={selectedFornecedor?.cnpj || cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  readOnly={!!selectedFornecedor}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <span className="border bg-background px-2 py-1 text-sm text-foreground w-40">
                  {selectedFornecedor?.telefone || "—"}
                </span>
              </div>
            </div>
          </fieldset>

          {/* Dados da Nota Fiscal */}
          <fieldset className="border p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Dados da Nota Fiscal</legend>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">Nota Fiscal</label>
                <input value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">Série</label>
                <input value={serie} onChange={(e) => setSerie(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-20 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">Chave Acesso</label>
                <input value={chaveAcesso} onChange={(e) => setChaveAcesso(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-foreground">O.C. | Pedido</label>
                <input value={ordemCompra} onChange={(e) => setOrdemCompra(e.target.value)}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-32 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
          </fieldset>

          {/* Material Não Conforme */}
          <fieldset className="border p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Material Não Conforme</legend>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Código Andra</label>
                <input value={matForm.codigoAndra} onChange={(e) => setMatForm({ ...matForm, codigoAndra: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Código Fornecedor</label>
                <input value={matForm.codigoFornecedor} onChange={(e) => setMatForm({ ...matForm, codigoFornecedor: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-xs font-medium text-foreground">Descrição</label>
                <input value={matForm.descricao} onChange={(e) => setMatForm({ ...matForm, descricao: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Quantidade</label>
                <input type="number" value={matForm.quantidade || ""} onChange={(e) => setMatForm({ ...matForm, quantidade: Number(e.target.value) })}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-20 focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-foreground">Motivo</label>
                <select value={matForm.motivo} onChange={(e) => setMatForm({ ...matForm, motivo: e.target.value })}
                  className="border bg-background px-2 py-1 text-sm text-foreground w-44 focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Selecione...</option>
                  {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Material list */}
            <div className="border bg-background max-h-32 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-2 py-1 text-left font-semibold text-muted-foreground">Nº</th>
                    <th className="px-2 py-1 text-left font-semibold text-muted-foreground">Cód. Andra</th>
                    <th className="px-2 py-1 text-left font-semibold text-muted-foreground">Cód. Fornecedor</th>
                    <th className="px-2 py-1 text-left font-semibold text-muted-foreground">Descrição</th>
                    <th className="px-2 py-1 text-left font-semibold text-muted-foreground">Qtd</th>
                    <th className="px-2 py-1 text-left font-semibold text-muted-foreground">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {materiais.map((m, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-2 py-1 text-foreground">{i + 1}</td>
                      <td className="px-2 py-1 text-foreground">{m.codigoAndra}</td>
                      <td className="px-2 py-1 text-foreground">{m.codigoFornecedor}</td>
                      <td className="px-2 py-1 text-foreground">{m.descricao}</td>
                      <td className="px-2 py-1 text-foreground">{m.quantidade}</td>
                      <td className="px-2 py-1 text-foreground">{m.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={embalagemLacrada} onChange={(e) => setEmbalagemLacrada(e.target.checked)} />
                Embalagem lacrada Fornecedor / Não manipulada
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={embalagemAberta} onChange={(e) => setEmbalagemAberta(e.target.checked)} />
                Embalagem aberta / Manipulada
              </label>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={addMaterial}
                  className="bg-status-resolvido px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                  Adicionar
                </button>
                <button type="button" onClick={removeMaterial}
                  className="bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                  Remover
                </button>
              </div>
            </div>
          </fieldset>

          {/* Descrição da Ocorrência */}
          <fieldset className="border p-3 space-y-2">
            <legend className="px-2 text-sm font-bold text-foreground">Descrição da Ocorrência</legend>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Descreva a ocorrência..."
            />
          </fieldset>

          {/* Responsável */}
          <fieldset className="border p-3">
            <legend className="px-2 text-sm font-bold text-foreground">Responsável</legend>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Conferente</label>
              <input
                value={conferente}
                onChange={(e) => setConferente(e.target.value)}
                className="border bg-background px-2 py-1 text-sm text-foreground w-64 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="submit"
              className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
              Salvar
            </button>
            <button type="button" onClick={onClose}
              className="border px-6 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
