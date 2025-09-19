
import React, { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  defaultNome?: string;
  onClose: () => void;
  onConfirm: (nome: string, quantidade: number) => Promise<void> | void;
};

const ModalSaidaEstoque: React.FC<Props> = ({ open, defaultNome = '', onClose, onConfirm }) => {
  const [nome, setNome] = useState(defaultNome);
  const [quantidade, setQuantidade] = useState<number>(0);

  useEffect(() => {
    setNome(defaultNome || '');
    setQuantidade(0);
  }, [defaultNome, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Dar baixa no estoque</h2>
          <p className="text-sm text-gray-500">Registre a saída manual deste produto do estoque.</p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Produto (nome)</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex.: Controle Remoto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              min={1}
              value={Number.isNaN(quantidade) ? 0 : quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value || '0', 10))}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50 text-gray-700">
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={async () => {
              if (!nome.trim()) return alert('Informe o nome do produto');
              if (!quantidade || quantidade <= 0) return alert('Quantidade precisa ser > 0');
              await onConfirm(nome.trim(), quantidade);
              onClose();
            }}
          >
            Confirmar baixa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSaidaEstoque;
