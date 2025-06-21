import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <header className="header">
      <div className="header-content">
        <button onClick={handleBackClick} className="back-button">
          ←
        </button>
        <div className="logo-container" onClick={handleLogoClick}>
          <img 
            src="/logo-top.jpg.jpg" 
            alt="100 Matchs Logo" 
            className="logo" 
          />
          <span className="site-title">100matchs</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 