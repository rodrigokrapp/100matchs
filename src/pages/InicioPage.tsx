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
      
      <div className="inicio-container">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">
              <div className="floating-hearts">
                <FiHeart className="heart heart-1" />
                <FiHeart className="heart heart-2" />
                <FiHeart className="heart heart-3" />
              </div>
              <div className="phone-mockup">
                <div className="screen">
                  <div className="status-bar"></div>
                  <div className="chat-preview">
                    <div className="message-bubble left">Oi! 😊</div>
                    <div className="message-bubble right">Olá! Como vai? 💕</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-text">
              <h1 className="hero-title">100 MATCHS</h1>
              <p className="hero-subtitle">
                Conecte-se com pessoas incríveis da sua região e encontre seu match perfeito!
              </p>
              
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
                  onClick={() => navigate('/suporte6828')}
                >
                  🛠️ Suporte
                </button>
                <button 
                  className="btn-seja-premium"
                  onClick={() => window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank')}
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