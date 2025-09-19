import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, FileText, Package } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-pink-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition-colors">
              Planilha de Controle de Saída EGP
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FileText size={18} />
              <span>Controle</span>
            </Link>

            <Link
              to="/estoque"
              className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <Package size={18} />
              <span>Estoque</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Olá, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <LogIn size={18} />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

