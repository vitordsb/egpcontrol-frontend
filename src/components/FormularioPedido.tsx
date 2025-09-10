import React, { useState } from 'react';
import { pedidosApi } from '../services/api';
import { Pedido } from '../types';
import { X, Save } from 'lucide-react';

interface FormularioPedidoProps {
  onClose: () => void;
  onSave: () => void;
  pedido?: Pedido | null;
}

const FormularioPedido: React.FC<FormularioPedidoProps> = ({ onClose, onSave, pedido }) => {
  const [formData, setFormData] = useState({
    dataPedido: pedido?.dataPedido || new Date().toISOString().split('T')[0],
    cliente: pedido?.cliente || '',
    numeroPedido: pedido?.numeroPedido || '',
    numeroNfe: pedido?.numeroNfe || '',
    financeira: pedido?.financeira || '',
    dataPrevista: pedido?.dataPrevista || '',
    transportadora: pedido?.transportadora || '',
    observacao: pedido?.observacao || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (pedido?._id) {
        await pedidosApi.atualizarPedido(pedido._id, formData);
      } else {
        await pedidosApi.criarPedido(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError('Erro ao salvar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {pedido ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do Pedido *
              </label>
              <input
                type="date"
                value={formData.dataPedido}
                onChange={(e) => handleChange('dataPedido', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => handleChange('cliente', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Pedido *
              </label>
              <input
                type="text"
                value={formData.numeroPedido}
                onChange={(e) => handleChange('numeroPedido', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                placeholder="Ex: 5319"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número da NFE *
              </label>
              <input
                type="text"
                value={formData.numeroNfe}
                onChange={(e) => handleChange('numeroNfe', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                placeholder="Ex: 5131"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financeira *
              </label>
              <input
                type="text"
                value={formData.financeira}
                onChange={(e) => handleChange('financeira', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                placeholder="Nome da financeira"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Prevista de Saída *
              </label>
              <input
                type="date"
                value={formData.dataPrevista}
                onChange={(e) => handleChange('dataPrevista', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transportadora
              </label>
              <input
                type="text"
                value={formData.transportadora}
                onChange={(e) => handleChange('transportadora', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                placeholder="Nome da transportadora (opcional)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação
            </label>
            <textarea
              value={formData.observacao}
              onChange={(e) => handleChange('observacao', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
              placeholder="Observações adicionais (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={18} />
              <span>{loading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioPedido;

