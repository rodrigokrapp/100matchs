import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuHamburguer from './MenuHamburguer';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container" onClick={handleLogoClick}>
          <img 
            src="/logo-chat-coracao-rosa.svg" 
            alt="100 Matchs Logo" 
            className="logo" 
          />
          <h1 className="site-title">100 Matchs</h1>
        </div>
      </div>
      <MenuHamburguer />
    </header>
  );
};

export default Header; 