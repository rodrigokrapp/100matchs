import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuHamburguer from './MenuHamburguer';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  const handleSalasClick = () => {
    navigate('/salas');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container" onClick={handleLogoClick}>
          <img 
            src="/logo-nova-coracao-rosa.png" 
            alt="100 Matchs Logo" 
            className="logo" 
          />
          <h1 className="site-title">100 Matchs</h1>
        </div>
        <div className="salas-link" onClick={handleSalasClick}>
          salas
        </div>
      </div>
      <MenuHamburguer />
    </header>
  );
};

export default Header; 