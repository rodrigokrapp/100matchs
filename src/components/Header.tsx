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
      <div className="logo-container" onClick={handleLogoClick}>
        <img 
          src="/nova-logo.png" 
          alt="100 Matchs Logo" 
          className="logo" 
        />
        <h1 className="site-title">100 Matchs</h1>
      </div>
    </header>
  );
};

export default Header; 