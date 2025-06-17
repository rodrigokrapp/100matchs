import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuportePage.css';

export const SuportePage: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [mostrarCadastroPremium, setMostrarCadastroPremium] = useState(false);
  const [erro, setErro] = useState('');
  
  const CODIGO_CORRETO = '6838';
  
  const validarCodigo = () => {
    if (codigo === CODIGO_CORRETO) {
      setMostrarCadastroPremium(true);
      setErro('');
    } else {
      setErro('Código inválido. Tente novamente.');
      setCodigo('');
    }
  };
  
  const irParaCadastroPremium = () => {
    navigate('/cadastropremium6838k');
  };
  
  return (
    <div className="suporte-page">
      <div className="suporte-container">
        <div className="suporte-header">
          <button className="btn-voltar" onClick={() => navigate('/')}>
            ← Voltar
          </button>
          <h1>🛠️ Suporte Técnico</h1>
        </div>
        
        <div className="suporte-content">
          <div className="codigo-section">
            <h2>Acesso Exclusivo</h2>
            <p>Digite o código de 4 dígitos para acessar recursos especiais:</p>
            
            <div className="codigo-input-container">
              <input
                type="text"
                value={codigo}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCodigo(valor);
                  setErro('');
                }}
                placeholder="0000"
                className="codigo-input"
                maxLength={4}
              />
              <button 
                className="btn-validar"
                onClick={validarCodigo}
                disabled={codigo.length !== 4}
              >
                Validar
              </button>
            </div>
            
            {erro && <div className="erro-message">{erro}</div>}
            
            {mostrarCadastroPremium && (
              <div className="cadastro-premium-section">
                <div className="success-message">
                  ✅ Código validado com sucesso!
                </div>
                <button 
                  className="btn-cadastro-premium"
                  onClick={irParaCadastroPremium}
                >
                  👑 Cadastro Premium
                </button>
              </div>
            )}
          </div>
          
          <div className="suporte-info">
            <h3>🚀 Recursos Premium</h3>
            <ul>
              <li>✨ Perfil destacado</li>
              <li>💬 Chat ilimitado</li>
              <li>🎯 Super likes</li>
              <li>👻 Modo invisível</li>
              <li>🔥 Boost de visibilidade</li>
              <li>📱 Recursos VIP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};