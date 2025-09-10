import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidosApi } from '../services/api';
import { RelatorioCompra } from '../types';
import { ArrowLeft, Download, Package, FileText, ShoppingCart } from 'lucide-react';

const RelatorioCompras: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioCompra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      const response = await pedidosApi.buscarRelatorioCompras();
      setRelatorio(response);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const headers = ['Produto', 'Quantidade Total', 'Número de Pedidos'];
    const csvContent = [
      headers.join(','),
      ...relatorio.map(item => [
        `"${item.nome}"`,
        item.quantidadeTotal,
        item.numeroPedidos
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-compras-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarTXT = () => {
    const content = [
      'RELATÓRIO DE COMPRAS - EGP',
      '='.repeat(50),
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      '',
      'RESUMO DE PRODUTOS PARA COMPRA:',
      '-'.repeat(50),
      '',
      ...relatorio.map(item => 
        `${item.nome.padEnd(30)} | Qtd: ${item.quantidadeTotal.toString().padStart(5)} | Pedidos: ${item.numeroPedidos}`
      ),
      '',
      '-'.repeat(50),
      `Total de produtos diferentes: ${relatorio.length}`,
      `Quantidade total de itens: ${relatorio.reduce((sum, item) => sum + item.quantidadeTotal, 0)}`
    ].join('\\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resumo-compras-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalItens = relatorio.reduce((sum, item) => sum + item.quantidadeTotal, 0);
  const totalProdutosDiferentes = relatorio.length;

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
              Relatório de Compras
            </h1>
            <p className="text-gray-600">Resumo de produtos para compra</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={exportarTXT}
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText size={18} />
            <span>Exportar TXT</span>
          </button>
          <button
            onClick={exportarCSV}
            className="btn-primary flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-egp-pink-500 to-egp-pink-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Produtos Diferentes</p>
              <p className="text-3xl font-bold">{totalProdutosDiferentes}</p>
            </div>
            <Package size={40} className="text-pink-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-egp-blue-500 to-egp-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total de Itens</p>
              <p className="text-3xl font-bold">{totalItens}</p>
            </div>
            <ShoppingCart size={40} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Última Atualização</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <FileText size={40} className="text-green-200" />
          </div>
        </div>
      </div>

      {/* Tabela do relatório */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-egp-pink-500 to-egp-blue-500 text-white">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Lista de Produtos para Compra
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando relatório...
          </div>
        ) : relatorio.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum produto encontrado</p>
            <p className="text-sm mt-2">Adicione produtos aos pedidos para gerar o relatório</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome do Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nº de Pedidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Média por Pedido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatorio.map((item, index) => (
                  <tr key={item.nome} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-egp-blue-100 text-egp-blue-800">
                        {item.quantidadeTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.numeroPedidos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(item.quantidadeTotal / item.numeroPedidos).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumo final */}
      {relatorio.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Resumo do Relatório</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Total de produtos diferentes:</strong> {totalProdutosDiferentes}</p>
              <p><strong>Quantidade total de itens:</strong> {totalItens}</p>
            </div>
            <div>
              <p><strong>Data de geração:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Hora de geração:</strong> {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioCompras;

