import axios from 'axios';
import { Pedido, Produto, RelatorioCompra } from '../types';

const API_BASE_URL = 'https://egpcontrol-backned.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const pedidosApi = {
  // Buscar pedidos com paginação e filtros
  buscarPedidos: async (page = 1, limit = 25, search = '', column = '') => {
    const response = await api.get('/pedidos', {
      params: { page, limit, search, column }
    });
    return response.data;
  },

  // Criar novo pedido
  criarPedido: async (pedido: Omit<Pedido, '_id'>) => {
    const response = await api.post('/pedidos', pedido);
    return response.data;
  },

  // Atualizar pedido
  atualizarPedido: async (id: string, pedido: Partial<Pedido>) => {
    const response = await api.put(`/pedidos/${id}`, pedido);
    return response.data;
  },

  // Atualizar status do pedido (sem autenticação)
  atualizarStatus: async (id: string, dataSaida?: string, observacao?: string) => {
    const response = await axios.patch(`${API_BASE_URL}/pedidos/${id}/status`, {
      dataSaida,
      observacao
    });
    return response.data;
  },

  // Buscar produtos de um pedido
  buscarProdutosPedido: async (pedidoId: string) => {
    const response = await api.get(`/pedidos/${pedidoId}/produtos`);
    return response.data;
  },

  // Adicionar produto a um pedido
  adicionarProduto: async (pedidoId: string, produto: Omit<Produto, '_id' | 'pedidoId'>) => {
    const response = await api.post(`/pedidos/${pedidoId}/produtos`, produto);
    return response.data;
  },

  // Buscar relatório de compras
  buscarRelatorioCompras: async (): Promise<RelatorioCompra[]> => {
    const response = await api.get('/relatorio-compras');
    return response.data;
  }
};

export default api;

