
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pedidosApi } from '../services/api';
import { Pedido } from '../types';
import FormularioPedido from './FormularioPedido';
import {
  Search,
  Plus,
  Edit,
  Trash,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PlanilhaControle: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 7;
  const [filtros, setFiltros] = useState({
    geral: '',
    cliente: '',
    numeroPedido: '',
    numeroNfe: '',
    financeira: '',
    transportadora: '',
    dataSaida: ''
  });
  const [showNewPedidoForm, setShowNewPedidoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    cliente: '',
    numeroPedido: '',
    numeroNfe: '',
    financeira: '',
    dataSaida: '',
    transportadora: ''
  });

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pedidosApi.buscarPedidos(currentPage, itemsPerPage);
      setPedidos(response.pedidos);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  const aplicarFiltro = async (column: string, value: string) => {
    try {
      setLoading(true);
      const response = await pedidosApi.buscarPedidos(1, itemsPerPage, value, column);
      setPedidos(response.pedidos);
      setTotalPages(response.totalPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao aplicar filtro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [column]: value }));
    if (value.trim()) {
      aplicarFiltro(column, value);
    } else {
      carregarPedidos();
    }
  };
  const deletarPedido = async (pedidoId: string) => {
    try {
      await pedidosApi.excluirPedido(pedidoId);
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
    }
  };

  const atualizarStatus = async (pedidoId: string, dataSaida?: string, observacao?: string) => {
    try {
      await pedidosApi.atualizarStatus(pedidoId, dataSaida, observacao);
      carregarPedidos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };
  const handleUploadXml = async (file: File) => {
    try {
      const response = await pedidosApi.enviarXML(file);
      console.log(response);
      carregarPedidos();
    } catch (error) {
      console.error("Erro ao importar XML:", error);
    }
  };
  const getStatusIcon = (status: string) => {
    if (status.includes('Saiu')) {
      return <CheckCircle className="text-green-600" size={16} />;
    } else if (status === 'Em atraso') {
      return <AlertTriangle className="text-red-600" size={16} />;
    } else {
      return <Clock className="text-yellow-600" size={16} />;
    }
  };

  const getStatusClass = (status: string) => {
    if (status.includes('Saiu')) {
      return 'status-saiu';
    } else if (status === 'Em atraso') {
      return 'status-em-atraso';
    } else {
      return 'status-em-producao';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Controle de Expedição
        </h1>
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNewPedidoForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Novo Pedido</span>
            </button>
            <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-md text-white font-medium shadow-md bg-pink-500 hover:opacity-90 transition">
              <Plus size={18} />
              <span>Importar XML</span>
              <input
                type="file"
                accept=".xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleUploadXml(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>Data Pedido</span>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="date"
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>Cliente</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="text"
                        value={searchFilters.cliente}
                        onChange={(e) => handleFilterChange('cliente', e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar cliente..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>Nº Pedido</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="text"
                        value={searchFilters.numeroPedido}
                        onChange={(e) => handleFilterChange('numeroPedido', e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar pedido..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>NFE</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="text"
                        value={searchFilters.numeroNfe}
                        onChange={(e) => handleFilterChange('numeroNfe', e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar NFE..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>Financeira</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="text"
                        value={searchFilters.financeira}
                        onChange={(e) => handleFilterChange('financeira', e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar financeira..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Data Prevista</th>
                <th className="px-4 py-3 text-left">Situação</th>
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>Data Saída</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="text"
                        value={searchFilters.dataSaida}
                        onChange={(e) => handleFilterChange('dataSaida', e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar data saída..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="space-y-2">
                    <span>Transportadora</span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" size={14} />
                      <input
                        type="text"
                        value={searchFilters.transportadora}
                        onChange={(e) => handleFilterChange('transportadora', e.target.value)}
                        className="w-full pl-8 pr-2 py-1 text-xs bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-70"
                        placeholder="Filtrar transportadora..."
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Observação</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido, index) => (
                  <tr key={pedido._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm">
                      {pedido.dataPedido ? format(new Date(pedido.dataPedido), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{pedido.cliente}</td>
                    <td className="px-4 py-3 text-sm font-mono">{pedido.numeroPedido}</td>
                    <td className="px-4 py-3 text-sm font-mono">{pedido.numeroNfe}</td>
                    <td className="px-4 py-3 text-sm">{pedido.financeira}</td>
                    <td className="px-4 py-3 text-sm">
                      {pedido.dataPrevista ? format(new Date(pedido.dataPrevista), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(pedido.status || '')}
                        <span className={`${getStatusClass(pedido.status || '')} text-xs`}>
                          {pedido.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        {pedido.dataSaida ? (
                          <span>{format(new Date(pedido.dataSaida), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        <button
                          onClick={() => {
                            if (!pedido._id) return
                            const dataSaida = prompt('Data de saída (dd/mm/aaaa):');
                            if (dataSaida === null || dataSaida.trim() === '') {
                              alert('A data de saída não pode ser vazia.');
                              return;
                            }
                            if (dataSaida) {
                              const observacao = prompt('Observação (opcional):') || '';
                              atualizarStatus(pedido._id, dataSaida, observacao);
                            }
                          }}
                          className="p-1 text-egp-pink-600 hover:bg-egp-pink-100 rounded"
                          title="Definir data de saída"
                        >
                          <Calendar size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{pedido.transportadora || '-'}</td>
                    <td className="px-4 py-3 text-sm">{pedido.observacao || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/pedido/${pedido._id}/produtos`}
                          className="p-1 text-egp-blue-600 hover:bg-egp-blue-100 rounded"
                          title="Gerenciar produtos"
                        >
                          <Package size={16} />
                        </Link>
                        {isAuthenticated && (
                          <>

                            <button
                              onClick={() => setEditingPedido(pedido)}
                              className="p-1 text-egp-pink-600 hover:bg-egp-pink-100 rounded"
                              title="Editar pedido"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deletarPedido(pedido._id || '')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Excluir pedido"
                            >
                              <Trash size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Formulário de novo/editar pedido */}
      {
        (showNewPedidoForm || editingPedido) && (
          <FormularioPedido
            pedido={editingPedido}
            onClose={() => {
              setShowNewPedidoForm(false);
              setEditingPedido(null);
            }}
            onSave={carregarPedidos}
          />
        )
      }
    </div >
  );
};

export default PlanilhaControle;


