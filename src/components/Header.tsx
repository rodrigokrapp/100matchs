import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  return (
    <header className="header">
      <div className="header-center">
        <div className="logo-container" onClick={handleLogoClick}>
          <h1 className="site-title">100 matchs</h1>
          <img 
            src="/logo - oficial.jpg.jpg" 
            alt="100 Matchs Logo" 
            className="logo" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 