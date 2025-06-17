import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiHeart, FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import './InicioPage.css';

const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [showLoginPremium, setShowLoginPremium] = useState(false);
  const [loginData, setLoginData] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  const handleEntrarComoVisitante = () => {
    if (!nome.trim() || !email.trim()) {
      alert('Por favor, preencha seu nome e email para continuar!');
      return;
    }

    const visitante = {
      nome: nome.trim(),
      email: email.trim(),
      tipo: 'visitante'
    };

    localStorage.setItem('visitante', JSON.stringify(visitante));
    navigate('/salas');
  };

  const handleLoginPremium = () => {
    if (!loginData.nome.trim() || !loginData.email.trim() || !loginData.senha.trim()) {
      alert('Por favor, preencha todos os campos para fazer login premium!');
      return;
    }

    // Simular validação de usuário premium
    const usuarioPremium = {
      nome: loginData.nome.trim(),
      email: loginData.email.trim(),
      tipo: 'premium'
    };

    localStorage.setItem('usuario', JSON.stringify(usuarioPremium));
    alert('🎉 Login Premium realizado com sucesso! Bem-vindo(a)!');
    navigate('/salas');
  };

  const handleSerPremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  return (
    <div className="inicio-page">
      <Header />
      
      <div className="hero-banner-section">
        <div className="hero-banner-container">
          <img 
            src="https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=600&q=80"
            alt="Pessoas felizes conversando - Desliza, Desliza e Nada! Converse Free" 
            className="hero-banner-image"
          />
          <div className="hero-banner-overlay">
            <div className="hero-banner-content">
              <div className="banner-text-overlay">
                <div className="left-text">
                  <h2>DESLIZA</h2>
                  <h2>DESLIZA E</h2>
                  <h2>NADA!</h2>
                </div>
                <div className="right-text">
                  <h1>CONVERSE</h1>
                  <h1>FREE</h1>
                </div>
              </div>
              <h1 className="hero-banner-title">100 MATCHS</h1>
              <p className="hero-banner-subtitle">
                Conecte-se com pessoas incríveis da sua região e encontre seu match perfeito!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="inicio-container">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">
              <div className="hero-image">
                <div className="image-overlay">
                  <div className="overlay-text">
                    <h3>DESLIZA, DESLIZA E NADA!</h3>
                    <h2>CONVERSE FREE</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-text">
              <div className="features-grid">
                <div className="feature">
                  <span className="feature-icon">💝</span>
                  <span>Matches Instantâneos</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <span>100% Grátis</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔥</span>
                  <span>Chat em Tempo Real</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🌟</span>
                  <span>Perfis Verificados</span>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn-suporte"
                  onClick={() => {
                    console.log('🛠️ Botão Suporte clicado');
                    navigate('/suporte6828');
                  }}
                >
                  🛠️ Suporte
                </button>
                <button 
                  className="btn-seja-premium"
                  onClick={() => {
                    console.log('👑 Botão Seja Premium clicado');
                    console.log('🔗 Abrindo link:', 'https://pay.kiwify.com.br/E2Y9N6m');
                    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
                  }}
                >
                  👑 Seja Premium
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="forms-section">
          <div className="form-container visitante-form">
            <h3>Entrar como Visitante</h3>
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <button onClick={handleEntrarComoVisitante} className="btn-primary">
              ENTRAR COMO VISITANTE
            </button>
          </div>

          <div className="form-container premium-form">
            <button 
              onClick={() => setShowLoginPremium(!showLoginPremium)}
              className="btn-login-premium"
            >
              <FiStar /> LOGIN PREMIUM
            </button>

            {showLoginPremium && (
              <div className="login-premium-form">
                <h3>Login Premium</h3>
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={loginData.nome}
                    onChange={(e) => setLoginData({...loginData, nome: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email premium"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon">🔐</span>
                  <input
                    type="password"
                    placeholder="Senha premium"
                    value={loginData.senha}
                    onChange={(e) => setLoginData({...loginData, senha: e.target.value})}
                    className="form-input"
                  />
                </div>
                <button onClick={handleLoginPremium} className="btn-primary premium">
                  FAZER LOGIN PREMIUM
                </button>
              </div>
            )}

            <div className="premium-benefits">
              <h4>Benefícios Premium:</h4>
              <ul>
                <li>📸 Envio de fotos e vídeos</li>
                <li>🎤 Mensagens de áudio</li>
                <li>⏰ Mensagens temporárias</li>
                <li>🎯 Filtros avançados</li>
                <li>⭐ Badge exclusivo</li>
              </ul>
              <button onClick={handleSerPremium} className="btn-upgrade">
                SER PREMIUM AGORA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioPage; 