import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PlanilhaControle from './components/PlanilhaControle';
import Login from './components/Login';
import ProdutosPorPedido from './components/ProdutosPorPedido';
import RelatorioCompras from './components/RelatorioCompras';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container max-w-full px-10 py-6">
            <Routes>
              <Route path="/" element={<PlanilhaControle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pedido/:id/produtos" element={<ProdutosPorPedido />} />
              <Route path="/relatorio-compras" element={<RelatorioCompras />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
