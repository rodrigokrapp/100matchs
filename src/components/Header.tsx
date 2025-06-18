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
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBzdHJva2U9IiNlOTFlNjMiIHN0cm9rZS13aWR0aD0iMTAiIGZpbGw9Im5vbmUiLz4KPHA+CjxwYXRoIGQ9Ik0zNSAzNUM0MCAzMCA0NSAzMCA1MCAzNUM1NSAzMCA2MCAzMCA2NSAzNSIgc3Ryb2tlPSIjZTkxZTYzIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHA+CjxwYXRoIGQ9Ik0zNSA2NVM0MCA3MCA0NSA3MCA1MCA2NVM1NSA3MCA2MCA3MCA2NSA2NSIgc3Ryb2tlPSIjZTkxZTYzIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHA+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDUiIHI9IjMiIGZpbGw9IiNlOTFlNjMiLz4KPHA+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjMiIGZpbGw9IiNlOTFlNjMiLz4KPC9zdmc+" 
          alt="100 Matchs Logo" 
          className="logo" 
        />
        <h1 className="site-title">100 Matchs</h1>
      </div>
    </header>
  );
};

export default Header; 