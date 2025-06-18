import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './SuportePage.css';

const SuportePage: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [mostrarCadastroPremium, setMostrarCadastroPremium] = useState(false);

  const handleValidarCodigo = () => {
    if (codigo.trim() === '6838') {
      setMostrarCadastroPremium(true);
    } else {
      alert('Código inválido! Tente novamente.');
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
      <Header />
      
      <div className="suporte-container">
        <div className="suporte-card card">
          <div className="suporte-header">
            <h1>🎧 Suporte</h1>
            <p>Central de ajuda e suporte técnico</p>
          </div>

          {!mostrarCadastroPremium ? (
            <div className="codigo-section">
              <h2>Código de Acesso</h2>
              <p>Digite o código de 4 dígitos para acessar funcionalidades especiais:</p>
              
              <div className="codigo-input-group">
                <input
                  type="text"
                  placeholder="Digite o código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input codigo-input"
                  maxLength={4}
                  onKeyPress={(e) => e.key === 'Enter' && handleValidarCodigo()}
                />
                <button 
                  onClick={handleValidarCodigo}
                  className="btn btn-primary"
                  disabled={codigo.length !== 4}
                >
                  Validar
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-section">
              <div className="success-message">
                <h2>✅ Código Validado!</h2>
                <p>Agora você pode se cadastrar como usuário Premium</p>
              </div>
              
              <button 
                onClick={handleCadastroPremium}
                className="btn btn-premium premium-button"
              >
                <div className="premium-icon">⭐</div>
                <div>
                  <h3>Cadastro Premium</h3>
                  <p>Acesse todas as funcionalidades exclusivas</p>
                </div>
              </button>
            </div>
          )}

          <div className="faq-section">
            <h2>❓ Perguntas Frequentes</h2>
            
            <div className="faq-item">
              <h3>Como funciona o chat?</h3>
              <p>Nosso chat permite enviar mensagens de texto, vídeos de até 10 segundos, áudios, imagens e emoticons em tempo real.</p>
            </div>

            <div className="faq-item">
              <h3>Qual a diferença entre usuário comum e Premium?</h3>
              <p>Usuários Premium têm acesso a todas as funcionalidades, podem criar salas personalizadas e não têm limitações de uso.</p>
            </div>

            <div className="faq-item">
              <h3>Como criar uma sala?</h3>
              <p>Na página de salas, clique em "Criar Sala", preencha o nome, bairro e cidade. Sua sala ficará disponível por 24 horas.</p>
            </div>

            <div className="faq-item">
              <h3>Problemas técnicos?</h3>
              <p>Verifique sua conexão com a internet e permissões do navegador para câmera e microfone. Atualize a página se necessário.</p>
            </div>
          </div>

          <div className="contact-section">
            <h2>📞 Contato</h2>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <h4>Email</h4>
                  <p>suporte@100matchs.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <div>
                  <h4>Chat Online</h4>
                  <p>Disponível das 9h às 18h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="actions">
            <button onClick={handleVoltar} className="btn btn-secondary">
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuportePage;