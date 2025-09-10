export interface Pedido {
  _id?: string;
  dataPedido: string;
  cliente: string;
  numeroPedido: string;
  numeroNfe: string;
  financeira: string;
  dataPrevista: string;
  transportadora?: string;
  observacao?: string;
  dataSaida?: string;
  status?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface Produto {
  _id?: string;
  pedidoId: string;
  nome: string;
  quantidade: number;
  dataCriacao?: string;
}

export interface RelatorioCompra {
  nome: string;
  quantidadeTotal: number;
  numeroPedidos: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

