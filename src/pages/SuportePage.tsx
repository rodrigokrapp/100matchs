import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import FloatingIcons from '../components/FloatingIcons';
import './SuportePage.css';

const SuportePage: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const handleValidarCodigo = () => {
    if (codigo === '6838') {
      setMostrarCadastro(true);
      setErro('');
    } else {
      setErro('Código inválido. Tente novamente.');
      setCodigo('');
    }
  };

  const handleCadastroPremium = () => {
    navigate('/cadastropremium6838k');
  };

  return (
    <div className="suporte-page">
      <FloatingIcons />
      <Header />
      
      <div className="suporte-container">
        <div className="suporte-content">
          <h1>🎧 Suporte 100matchs</h1>
          
          {!mostrarCadastro ? (
            <div className="codigo-section">
              <h2>Código de Acesso Premium</h2>
              <p>Digite o código de 4 dígitos para acessar o cadastro premium:</p>
              
              <div className="codigo-input-container">
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  className="codigo-input"
                  maxLength={4}
                />
                <button 
                  onClick={handleValidarCodigo}
                  className="validar-btn"
                  disabled={codigo.length !== 4}
                >
                  Validar Código
                </button>
              </div>
              
              {erro && <p className="erro-message">{erro}</p>}
            </div>
          ) : (
            <div className="cadastro-section">
              <div className="sucesso-message">
                <h2>✅ Código Validado com Sucesso!</h2>
                <p>Agora você pode acessar o cadastro premium.</p>
                
                <button 
                  onClick={handleCadastroPremium}
                  className="cadastro-premium-btn"
                >
                  🌟 Cadastro Premium
                </button>
              </div>
            </div>
          )}
          
          <div className="info-section">
            <h3>📞 Outras Formas de Suporte</h3>
            <div className="contato-info">
              <p>💬 Chat: Disponível 24/7</p>
              <p>📧 Email: suporte@100matchs.com</p>
              <p>📱 WhatsApp: (11) 99999-9999</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuportePage;