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
            <svg
              width="50"
              height="50"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Balão de conversa rosa */}
              <path
                d="M20 20C20 15 25 10 30 10H70C75 10 80 15 80 20V50C80 55 75 60 70 60H35L25 80L30 60H30C25 60 20 55 20 50V20Z"
                fill="#E91E63"
                stroke="#E91E63"
                strokeWidth="2"
              />
              
              {/* Coração principal dentro do balão */}
              <path
                d="M45 25C42 22 37 22 35 25C33 22 28 22 25 25C23 27 23 32 25 34L35 44L45 34C47 32 47 27 45 25Z"
                fill="white"
              />
              
              {/* Contorno interno do balão para dar profundidade */}
              <circle
                cx="50"
                cy="35"
                r="25"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
            </svg>
          </div>
          <h1 className="logo-text">100 MATCHS</h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 