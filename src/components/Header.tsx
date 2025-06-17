import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  showSupport?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showSupport = true }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  const handleSuporteClick = () => {
    const codigo = prompt('Digite o código de suporte especial:');
    if (codigo === '6838') {
      alert('🎉 Código correto! Redirecionando para suporte premium...');
      window.open('https://wa.me/5511999999999?text=Olá! Preciso de suporte premium - Código: 6838', '_blank');
    } else if (codigo) {
      alert('❌ Código incorreto. Tente novamente.');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section" onClick={handleLogoClick}>
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" className="logo-svg">
              {/* Balão de fala */}
              <circle cx="50" cy="40" r="30" fill="#EC4899" stroke="#EC4899" strokeWidth="2"/>
              
              {/* Pontinha do balão */}
              <path d="M35 62 Q40 72 25 68 Z" fill="#EC4899"/>
              
              {/* Coração dentro do balão */}
              <path d="M38 35 C38 32, 41 30, 44 32 C47 30, 50 32, 50 35 C50 38, 44 44, 44 44 C44 44, 38 38, 38 35 Z" fill="white"/>
              <path d="M50 35 C50 32, 53 30, 56 32 C59 30, 62 32, 62 35 C62 38, 56 44, 56 44 C56 44, 50 38, 50 35 Z" fill="white"/>
            </svg>
          </div>
          <h1 className="logo-text">100 MATCHS</h1>
        </div>
        
        {showSupport && (
          <button onClick={handleSuporteClick} className="btn-suporte">
            🛠️ Suporte
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 