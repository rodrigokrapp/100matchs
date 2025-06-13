import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiHeart, FiHeadphones } from 'react-icons/fi';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmitVisitante = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim() && email.trim()) {
      localStorage.setItem('visitante', JSON.stringify({ nome, email, tipo: 'gratuito' }));
      navigate('/salas');
    }
  };

  const handleSejaPremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  const handleSuporte = () => {
    navigate('/suporte6828');
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">RESENHA sem Matchs</h1>
          <button onClick={handleSuporte} className="btn-suporte">
            <FiHeadphones /> Suporte
        </button>
      </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            
            {/* Lado Esquerdo - Jovem Chorando */}
            <div className="hero-side sad-side">
              <div className="image-container">
                <div className="sad-person">
                  <div className="person-icon">😢📱</div>
                  <p className="sad-text">Desliza, desliza...</p>
                </div>
              </div>
              <div className="message-bubble sad-bubble">
                <p>Desliza desliza e nada de alguém né?</p>
              </div>
            </div>

            {/* Centro - Formulário */}
            <div className="hero-center">
              <div className="form-container">
                <h2>Conheça pessoas do seu bairro!</h2>
                <p className="subtitle">Aqui o usuário FREE conhece alguém da sua cidade todo dia!</p>
                
                <form onSubmit={handleSubmitVisitante} className="form-visitante">
                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                </div>
                
                  <div className="input-group">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="btn-visitante">
                    Entrar como Visitante Gratuito
                  </button>
                </form>

                <div className="divider">
                  <span>ou</span>
                </div>
                
                <button onClick={handleSejaPremium} className="btn-premium">
                  <FiHeart /> SEJA PREMIUM
                </button>
              </div>
            </div>

            {/* Lado Direito - Jovem Feliz */}
            <div className="hero-side happy-side">
              <div className="image-container">
                <div className="happy-person">
                  <div className="person-icon">😍📱</div>
                  <p className="happy-text">Bora, chega aqui!</p>
                </div>
              </div>
              <div className="message-bubble happy-bubble">
                <p>Já encontrei 3 pessoas legais hoje! 💕</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h3>Por que escolher o Resenha sem Matchs?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h4>Pessoas do seu bairro</h4>
              <p>Conheça quem está pertinho de você</p>
                </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>Chat em tempo real</h4>
              <p>Converse instantaneamente</p>
                </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>100% Real</h4>
              <p>Pessoas reais, conexões verdadeiras</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;