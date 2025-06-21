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
      <div className="header-content">
        <div className="logo-container" onClick={handleLogoClick}>
          <img 
            src="/logo-top.jpg.jpg" 
            alt="100 Matchs Logo" 
            className="logo" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 