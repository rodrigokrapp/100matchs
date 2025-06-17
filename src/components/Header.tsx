import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/inicio');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section" onClick={handleLogoClick}>
          <div className="logo-icon">
            <img 
              src="https://i.imgur.com/VxYKzpL.png"
              alt="100 MATCHS" 
              className="logo-svg"
              style={{ width: '50px', height: '50px', borderRadius: '10px' }}
            />
          </div>
          <h1 className="logo-text">100 MATCHS</h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 