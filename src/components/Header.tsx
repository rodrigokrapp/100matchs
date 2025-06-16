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
              <circle cx="50" cy="50" r="45" fill="none" stroke="#EC4899" strokeWidth="8"/>
              <path d="M25 45 Q50 20 75 45 Q50 70 25 45 Z" fill="#EC4899"/>
              <circle cx="50" cy="45" r="15" fill="white"/>
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