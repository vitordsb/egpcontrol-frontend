
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, PlusCircle, PackageMinus, ChevronRight, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { estoqueApi } from '../services/api';
import type { EstoqueItem, EstoqueDetalhePedido } from '../types';
import ModalEntradaEstoque from '../components/modals/ModalEntradaEstoque';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import ModalSaidaEstoque from '../components/modals/ModalSaidaEstoque';

const ITENS_POR_PAGINA = 15;

const Estoque: React.FC = () => {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filtroNome, setFiltroNome] = useState<string>('');

  // expansão por produto
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detalhes, setDetalhes] = useState<Record<string, { loading: boolean; data: EstoqueDetalhePedido[] }>>({});

  // modal compra
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalNome, setModalNome] = useState<string>('');

  // modal de baixa estoque
  const [modalSaidaOpen, setModalSaidaOpen] = useState<boolean>(false);
  const [modalSaidaNome, setModalSaidaNome] = useState<string>('');

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await estoqueApi.listar();
      setItens(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erro ao carregar estoque', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const itensProcessados = useMemo(() => {
    const base = itens.map((i) => {
      const faltaComprar = Math.max(0, (i.quantidadePedidos || 0) - (i.estoque || 0));
      const saldo = (i.estoque || 0) - (i.quantidadePedidos || 0);
      return { ...i, faltaComprar, saldo };
    });

    const filtrados = filtroNome.trim()
      ? base.filter((i) => i.nome.toLowerCase().includes(filtroNome.trim().toLowerCase()))
      : base;

    filtrados.sort((a, b) => {
      if (b.faltaComprar !== a.faltaComprar) return b.faltaComprar - a.faltaComprar;
      return a.nome.localeCompare(b.nome);
    });

    return filtrados;
  }, [itens, filtroNome]);

  const totalPages = Math.max(1, Math.ceil(itensProcessados.length / ITENS_POR_PAGINA));
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * ITENS_POR_PAGINA;
    return itensProcessados.slice(start, start + ITENS_POR_PAGINA);
  }, [currentPage, itensProcessados]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const totais = useMemo(() => {
    return itensProcessados.reduce(
      (acc, cur) => {
        acc.pedidos += cur.quantidadePedidos || 0;
        acc.estoque += cur.estoque || 0;
        acc.faltaComprar += Math.max(0, (cur.quantidadePedidos || 0) - (cur.estoque || 0));
        return acc;
      },
      { pedidos: 0, estoque: 0, faltaComprar: 0 }
    );
  }, [itensProcessados]);

  const abrirCompra = (nome?: string) => { setModalNome(nome || ''); setModalOpen(true); };
  const confirmarCompra = async (nome: string, quantidade: number) => {
    await estoqueApi.adicionarEntrada({ nome, quantidade });
    await carregar(); // mantém página
  };

  const toggleExpand = async (nome: string) => {
    const isOpen = !!expanded[nome];
    const next = { ...expanded, [nome]: !isOpen };
    setExpanded(next);

    if (!isOpen && !detalhes[nome]) {
      setDetalhes(prev => ({ ...prev, [nome]: { loading: true, data: [] } }));
      try {
        const data = await estoqueApi.detalhes(nome);
        setDetalhes(prev => ({ ...prev, [nome]: { loading: false, data } }));
      } catch (e) {
        console.error('Erro ao carregar detalhes', e);
        setDetalhes(prev => ({ ...prev, [nome]: { loading: false, data: [] } }));
      }
    }
  };
  const abrirSaida = (nome?: string) => { setModalSaidaNome(nome || ''); setModalSaidaOpen(true); };

  const confirmarSaida = async (nome: string, quantidade: number) => {
    await estoqueApi.retirar({ nome, quantidade });
    await carregar(); // mantém a página atual
  };

  const formatarData = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return format(d, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Estoque</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => abrirCompra('')} className="flex items-center gap-2 rounded bg-pink-500 px-3 py-2 text-white hover:bg-pink-600">
            <PlusCircle size={18} /> Nova entrada
          </button>
          <button onClick={() => carregar()} className="flex items-center gap-2 rounded border px-3 py-2 hover:bg-gray-50">
            <RefreshCw size={18} /> Atualizar
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Total em pedidos (pendentes)</div>
          <div className="text-2xl font-semibold">{totais.pedidos}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Saldo em estoque</div>
          <div className="text-2xl font-semibold">{totais.estoque}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Falta comprar</div>
          <div className={`text-2xl font-semibold ${totais.faltaComprar > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totais.faltaComprar}
          </div>
        </div>
      </div>

      {/* Filtro */}
      <div className="rounded-lg border bg-white p-4 shadow">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full rounded border px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Filtrar por produto..."
            value={filtroNome}
            onChange={(e) => { setFiltroNome(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-left text-sm text-white">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Pedidos pendentes</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Falta comprar</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>Carregando...</td></tr>
              ) : pageSlice.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>Nenhum item encontrado</td></tr>
              ) : (
                pageSlice.map((item) => {
                  const isOpen = !!expanded[item.nome];
                  const det = detalhes[item.nome];

                  return (
                    <React.Fragment key={item.nome}>
                      <tr className="odd:bg-gray-50">
                        <td className="px-4 py-3 align-top">
                          <button
                            className="rounded border p-1 hover:bg-gray-50"
                            onClick={() => toggleExpand(item.nome)}
                            title={isOpen ? 'Recolher' : 'Expandir'}
                          >
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm align-top">{item.nome}</td>
                        <td className="px-4 py-3 font-mono text-sm align-top">{item.quantidadePedidos ?? 0}</td>
                        <td className="px-4 py-3 font-mono text-sm align-top">{item.estoque ?? 0}</td>
                        <td className={`px-4 py-3 font-mono text-sm align-top ${Math.max(0, (item.quantidadePedidos || 0) - (item.estoque || 0)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.max(0, (item.quantidadePedidos || 0) - (item.estoque || 0))}
                        </td>
                        <td className="flex gap-2 py-3 align-top">
                          <button
                            onClick={() => abrirCompra(item.nome)}
                            className="flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                            title="Lançar compra (entrada)"
                          >
                            <PackageMinus size={16} /> Comprar
                          </button>
                          <button
                            onClick={() => abrirSaida(item.nome)}
                            className="flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-gray-50 text-red-600 border-red-300"
                            title="Dar baixa (saída)"
                          >
                            <PackageMinus size={16} /> Dar baixa
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="rounded border bg-white p-3">
                              <div className="mb-2 text-sm font-semibold text-gray-700">
                                Pedidos vinculados a <span className="font-bold">{item.nome}</span>
                              </div>

                              {!det || det.loading ? (
                                <div className="text-sm text-gray-500">Carregando detalhes...</div>
                              ) : det.data.length === 0 ? (
                                <div className="text-sm text-gray-500">Nenhum pedido pendente para este produto.</div>
                              ) : (
                                <ul className="space-y-1">
                                  {det.data.map((p) => (
                                    <li key={String(p.pedidoId)} className="flex items-center justify-between text-sm">
                                      <div className="text-gray-700">
                                        pedido <strong>{p.numeroPedido ?? '—'}</strong>
                                        {' '}— nfe <strong>{p.numeroNfe ?? '—'}</strong>
                                        {' '}— data <strong>{formatarData(p.dataPrevista || p.dataPedido)}</strong>
                                      </div>
                                      {p.pedidoId && (
                                        <Link
                                          to={`/pedido/${p.pedidoId}/produtos`}
                                          className="inline-flex items-center gap-1 text-pink-600 hover:underline"
                                          title="Abrir pedido"
                                          target="_blank"
                                        >
                                          <LinkIcon size={14} />
                                          abrir
                                        </Link>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white">
                Voltar
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded bg-pink-500 px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-pink-600">
                Avançar
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalEntradaEstoque
        open={modalOpen}
        defaultNome={modalNome}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarCompra}
      />
      <ModalSaidaEstoque
        open={modalSaidaOpen}
        defaultNome={modalSaidaNome}
        onClose={() => setModalSaidaOpen(false)}
        onConfirm={confirmarSaida}
      />
    </div>
  );
};

export default Estoque;

