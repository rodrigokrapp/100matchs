import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiKey, FiArrowLeft } from 'react-icons/fi';
import './SuportePage.css';

const SuportePage: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleValidarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (codigo === '6838') {
      setCodigoValidado(true);
      setErro('');
    } else {
      setErro('Código inválido. Tente novamente.');
      setCodigo('');
    }
  };

  const handleCadastroPremium = () => {
    navigate('/cadastropremium6838k');
  };

  const handleVoltar = () => {
    navigate('/inicio');
  };

  return (
    <div className="suporte-page">
      <div className="suporte-container">
        <button onClick={handleVoltar} className="btn-voltar">
          <FiArrowLeft /> Voltar
        </button>

        <div className="suporte-content">
          <div className="suporte-icon">
            <FiLock size={60} />
          </div>
          
          <h1>Área de Suporte</h1>
          <p>Para acessar funcionalidades especiais, digite o código de acesso:</p>

          {!codigoValidado ? (
            <form onSubmit={handleValidarCodigo} className="codigo-form">
              <div className="input-group">
                <FiKey className="input-icon" />
                <input
                  type="text"
                  placeholder="Digite o código de 4 dígitos"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  maxLength={4}
                  className={erro ? 'input-erro' : ''}
                  required
                />
              </div>
              
              {erro && <p className="erro-msg">{erro}</p>}
              
              <button type="submit" className="btn-validar">
                Validar Código
              </button>
            </form>
          ) : (
            <div className="codigo-validado">
              <div className="sucesso-icon">✅</div>
              <h2>Código Válido!</h2>
              <p>Agora você pode acessar o cadastro premium.</p>
              
              <button onClick={handleCadastroPremium} className="btn-cadastro-premium">
                Cadastro Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuportePage;