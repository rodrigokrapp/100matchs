import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './InicioPage.css';

const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');

  const handleEntrar = () => {
    if (!nome.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    // Salvar como visitante
    const visitante = {
      nome: nome.trim(),
      premium: false,
      tipo: 'visitante'
    };

    localStorage.setItem('visitante', JSON.stringify(visitante));
    navigate('/salas');
  };

  const handleSejaPremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  const handleSupporte = () => {
    navigate('/suporte6828');
  };

  const handleEntrarPremium = () => {
    navigate('/loginpremium');
  };

  return (
    <div className="inicio-page">
      <Header />
      
      <div className="inicio-container">
        <div className="hero-section">
          <div className="hero-image">
            <img src="/banner-converse-sem-match.jpg" alt="Converse Sem Match" className="banner-image" />
          </div>
        </div>

        <div className="main-content">
          <div className="entrada-card card">
            <h2>Entrar no Chat</h2>
            <p>Digite seu nome e comece a conversar agora mesmo</p>
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input"
                onKeyPress={(e) => e.key === 'Enter' && handleEntrar()}
              />
              <button onClick={handleEntrar} className="btn btn-primary">
                Entrar
              </button>
            </div>
          </div>

          <div className="actions-grid">
            <button onClick={handleSejaPremium} className="btn btn-premium premium-card">
              <div className="premium-icon">⭐</div>
              <div>
                <h3>SEJA PREMIUM</h3>
                <p>Acesso completo a todas as funcionalidades</p>
              </div>
            </button>

            <button onClick={handleEntrarPremium} className="btn btn-secondary">
              <div className="login-icon">🔑</div>
              <div>
                <h3>Entrar Premium</h3>
                <p>Já tem conta premium? Faça login</p>
              </div>
            </button>

            <button onClick={handleSupporte} className="btn btn-secondary">
              <div className="support-icon">💬</div>
              <div>
                <h3>Suporte</h3>
                <p>Precisa de ajuda? Clique aqui</p>
              </div>
            </button>
          </div>
        </div>

        <div className="features-section">
          <h2>Funcionalidades do Chat</h2>
          <div className="features-grid grid grid-4">
            <div className="feature-card card">
              <div className="feature-icon">🎥</div>
              <h3>Vídeo</h3>
              <p>Grave vídeos de até 10 segundos</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🎤</div>
              <h3>Áudio</h3>
              <p>Envie mensagens de voz</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📷</div>
              <h3>Fotos</h3>
              <p>Compartilhe imagens da galeria</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">😀</div>
              <h3>Emoticons</h3>
              <p>Expresse-se com emojis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioPage; 