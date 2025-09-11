import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pedidosApi } from '../services/api';
import { Produto } from '../types';
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react';

const ProdutosPorPedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    quantidade: 1
  });

  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pedidosApi.buscarProdutosPedido(id!);
      console.log(response)
      setProdutos(response);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      carregarProdutos();
    }
  }, [id, carregarProdutos]);

  const removerProduto = async (produtoId: string) => {
    try {
      await pedidosApi.removerProduto(id!, produtoId);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
    }
  }

  const adicionarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pedidosApi.adicionarProduto(id!, novoProduto);
      setNovoProduto({ nome: '', quantidade: 1 });
      setShowForm(false);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Produtos do Pedido
            </h1>
            <p className="text-gray-600">Pedido #{id}</p>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Adicionar Produto</span>
          </button>
        )}
      </div>

      {/* Formulário de novo produto */}
      {showForm && isAuthenticated && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Adicionar Novo Produto</h3>
          <form onSubmit={adicionarProduto} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={novoProduto.nome}
                  onChange={(e) => setNovoProduto(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-egp-pink-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de produtos */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-egp-pink-500 to-egp-blue-500 text-white">
          <h2 className="text-xl font-semibold flex items-center">
            <Package className="mr-2" size={20} />
            Produtos do Pedido
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando produtos...
          </div>
        ) : produtos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum produto adicionado a este pedido</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 btn-primary"
              >
                Adicionar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Adição
                  </th>
                  {isAuthenticated && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.map((produto, index) => (
                  <tr key={produto._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.dataCriacao ? new Date(produto.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    {isAuthenticated && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Remover produto"
                          onClick={() => removerProduto(produto._id!)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botão para ver relatório de compras */}
      <div className="text-center">
        <Link
          to="/relatorio-compras"
          className="inline-flex items-center space-x-2 btn-primary"
        >
          <Package size={18} />
          <span>Ver Relatório de Compras</span>
        </Link>
      </div>
    </div>
  );
};

export default ProdutosPorPedido;

