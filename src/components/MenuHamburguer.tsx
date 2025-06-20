import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import './MenuHamburguer.css';

const MenuHamburguer: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Verificar qual tipo de usuário está logado
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    const usuarioChat = localStorage.getItem('usuarioChat');
    
    if (usuarioPremium) {
      setUsuario({ ...JSON.parse(usuarioPremium), tipo: 'premium' });
    } else if (usuarioChat) {
      setUsuario({ ...JSON.parse(usuarioChat), tipo: 'chat' });
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMeuPerfil = () => {
    // Verificar se é usuário premium
    if (usuario.tipo !== 'premium') {
      alert('Opção apenas para usuário premium');
      setIsOpen(false);
      return;
    }
    
    // Apenas usuários premium podem acessar
    navigate('/meuperfil');
    setIsOpen(false);
  };

  const handleSair = () => {
    // Limpar todos os dados de usuário
    localStorage.removeItem('usuarioPremium');
    localStorage.removeItem('usuarioChat');
    localStorage.removeItem('visitante');
    
    // Redirecionar para página inicial
    navigate('/inicio');
    setIsOpen(false);
  };

  if (!usuario) {
    return null; // Não mostrar menu se não há usuário logado
  }

  return (
    <div className="menu-hamburguer">
      <button className={`menu-toggle ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
      </button>

      {isOpen && (
        <div className="menu-overlay" onClick={() => setIsOpen(false)}>
          <div className="menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <h3>Menu</h3>
              <span className={`user-type ${usuario.tipo}`}>
                {usuario.tipo === 'premium' ? '⭐ Premium' : '💬 Chat Gratuito'}
              </span>
            </div>

            <div className="menu-items">
              <button 
                className="menu-item"
                onClick={handleMeuPerfil}
              >
                <FiUser />
                <span>Meu Perfil</span>
              </button>

              <button className="menu-item logout" onClick={handleSair}>
                <FiLogOut />
                <span>Sair</span>
              </button>
            </div>

            <div className="menu-footer">
              <p>Olá, {usuario.nome}!</p>
              {usuario.tipo === 'chat' && (
                <p className="tempo-restante">
                  ⏰ Acesso limitado a 15 min
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuHamburguer; 