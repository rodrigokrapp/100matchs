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
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0QkEyO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRjY5OUQ7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDwhLS0gUGVzc29hIDEgLSBIb21lbSBjb25mdXNvIChlc3F1ZXJkYSkgLS0+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTgwIiByPSI1MCIgZmlsbD0iI0Q0QTU3NCIgb3BhY2l0eT0iMC45Ii8+CiAgPHJlY3QgeD0iMTYwIiB5PSIyMzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMyRTJFMkUiIG9wYWNpdHk9IjAuOSIgcng9IjE1Ii8+CiAgPHRleHQgeD0iMjAwIiB5PSIxOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzAwMCI+8J+YsDwvdGV4dD4KICA8IS0tIFBlc3NvYSAyIC0gTXVsaGVyIGZlbGl6IChjZW50cm8pIC0tPgogIDxjaXJjbGUgY3g9IjYwMCIgY3k9IjE3MCIgcj0iNTUiIGZpbGw9IiNGNEMyQTEiIG9wYWNpdHk9IjAuOSIvPgogIDxyZWN0IHg9IjU1NSIgeT0iMjI1IiB3aWR0aD0iOTAiIGhlaWdodD0iMTMwIiBmaWxsPSIjRkY2QjM1IiBvcGFjaXR5PSIwLjkiIHJ4PSIxNSIvPgogIDx0ZXh0IHg9IjYwMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPvCfmIo8L3RleHQ+CiAgPHJlY3QgeD0iNTgwIiB5PSIyODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI3MCIgZmlsbD0iIzMzMyIgb3BhY2l0eT0iMC44IiByeD0iOCIvPgogIDx0ZXh0IHg9IjYwMCIgeT0iMzE1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkYiPvCfk7E8L3RleHQ+CiAgPCEtLSBQZXNzb2EgMyAtIEhvbWVtIHNvcnJpbmRvIChkaXJlaXRhKSAtLT4KICA8Y2lyY2xlIGN4PSIxMDAwIiBjeT0iMTkwIiByPSI1MiIgZmlsbD0iI0U4QjA3QSIgb3BhY2l0eT0iMC45Ii8+CiAgPHJlY3QgeD0iOTU4IiB5PSIyNDIiIHdpZHRoPSI4NCIgaGVpZ2h0PSIxMjUiIGZpbGw9IiM0QTkwRTIiIG9wYWNpdHk9IjAuOSIgcng9IjE1Ii8+CiAgPHRleHQgeD0iMTAwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPvCfmIQ8L3RleHQ+CiAgPGVsbGlwc2UgY3g9Ijk4NSIgY3k9IjE3NSIgcng9IjE1IiByeT0iOCIgZmlsbD0iIzMzMyIgb3BhY2l0eT0iMC43Ii8+CiAgPGVsbGlwc2UgY3g9IjEwMTUiIGN5PSIxNzUiIHJ4PSIxNSIgcnk9IjgiIGZpbGw9IiMzMzMiIG9wYWNpdHk9IjAuNyIvPgogIDwhLS0gVGV4dG8gIkRFU0xJWkEgREVTTElaQSBFIE5BREEK4oCmIiAtLT4KICA8cmVjdCB4PSI1MCIgeT0iODAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkYxNzQ0IiBvcGFjaXR5PSIwLjkiIHJ4PSIyMCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTE1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZFQjNCIj5ERVNMSVpBPC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZFQjNCIj5ERVNMSVpBIEU8L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIxODUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkVCM0IiPk5BREEK4oCmPC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfmJQ8L3RleHQ+CiAgPCEtLSBUZXh0byAiQ09OVkVSU0UgRlJFRSIgLS0+CiAgPHJlY3QgeD0iODUwIiB5PSIxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRkY2OUI0IiBvcGFjaXR5PSIwLjkiIHJ4PSIyMCIvPgogIDx0ZXh0IHg9IjEwMDAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+Q09OVkVSU0U8L3RleHQ+CiAgPHRleHQgeD0iMTAwMCIgeT0iMTkwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5GUkVFPC90ZXh0PgogIDwhLS0gRWxlbWVudG9zIGRlY29yYXRpdm9zIC0tPgogIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjMwMCIgcj0iMjAiIGZpbGw9IiNGRkVCM0IiIG9wYWNpdHk9IjAuMyIvPgogIDxjaXJjbGUgY3g9IjEwNTAiIGN5PSIzNTAiIHI9IjI1IiBmaWxsPSIjRkYxNzQ0IiBvcGFjaXR5PSIwLjMiLz4KICA8Y2lyY2xlIGN4PSI1MDAiIGN5PSI0NTAiIHI9IjE4IiBmaWxsPSIjMDBFNjc2IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+"
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