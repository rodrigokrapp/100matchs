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
                d="M75 25C75 15.335 67.165 7.5 57.5 7.5H22.5C12.835 7.5 5 15.335 5 25V50C5 59.665 12.835 67.5 22.5 67.5H35L45 85L55 67.5H57.5C67.165 67.5 75 59.665 75 50V25Z"
                fill="#E91E63"
                stroke="#E91E63"
                strokeWidth="3"
              />
              
              {/* Coração principal dentro do balão */}
              <path
                d="M40 25C37.8 22.8 34.2 22.8 32 25C29.8 22.8 26.2 22.8 24 25C21.8 27.2 21.8 30.8 24 33L32 41L40 33C42.2 30.8 42.2 27.2 40 25Z"
                fill="white"
              />
              
              {/* Coração adicional menor */}
              <path
                d="M60 35C58.5 33.5 56.5 33.5 55 35C53.5 33.5 51.5 33.5 50 35C48.5 36.5 48.5 38.5 50 40L55 45L60 40C61.5 38.5 61.5 36.5 60 35Z"
                fill="white"
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