import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiHeadphones } from 'react-icons/fi';

const HomePageNova: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmitVisitante = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nome.trim() && email.trim()) {
      const userData = { nome: nome.trim(), email: email.trim(), tipo: 'gratuito' };
      localStorage.setItem('visitante', JSON.stringify(userData));
      navigate('/salas');
    } else {
      alert('Por favor, preencha seu nome e email para continuar!');
    }
  };

  const handleSejaPremium = () => {
    // Remover link específico - será configurado posteriormente
    alert('Link de pagamento será configurado posteriormente');
  };

  const handleSuporte = () => {
    navigate('/suporte6828');
  };

  const styles = {
    homepage: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '1rem 0',
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
      marginBottom: '20px',
    },
    btnSuporte: {
      background: '#1a237e',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '25px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)',
    },
    hero: {
      padding: '120px 0 80px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    },
    heroContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      gap: '3rem',
      alignItems: 'center',
      minHeight: '70vh',
    },
    heroSide: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '2rem',
    },
    imageContainer: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease',
    },
    personIcon: {
      fontSize: '4rem',
      textAlign: 'center' as const,
    },
    messageBubble: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      position: 'relative' as const,
      maxWidth: '250px',
      textAlign: 'center' as const,
    },
    heroCenter: {
      display: 'flex',
      justifyContent: 'center',
    },
    formContainer: {
      background: 'white',
      padding: '3rem',
      borderRadius: '30px',
      boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center' as const,
    },
    title: {
      color: '#1a237e',
      marginBottom: '1rem',
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    subtitle: {
      color: '#666',
      marginBottom: '2rem',
      fontSize: '1.1rem',
    },
    form: {
      marginBottom: '2rem',
    },
    inputGroup: {
      position: 'relative' as const,
      marginBottom: '1.5rem',
    },
    inputIcon: {
      position: 'absolute' as const,
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#666',
      fontSize: '1.2rem',
    },
    input: {
      width: '100%',
      padding: '15px 15px 15px 45px',
      border: '2px solid #e0e0e0',
      borderRadius: '15px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box' as const,
      outline: 'none',
    },
    btnVisitante: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '15px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 25px rgba(255, 107, 157, 0.3)',
    },
    divider: {
      margin: '2rem 0',
      position: 'relative' as const,
      textAlign: 'center' as const,
      color: '#666',
      fontWeight: 'bold',
    },
    dividerText: {
      background: 'white',
      padding: '0 15px',
    },
    btnPremium: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '15px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 8px 25px rgba(26, 35, 126, 0.3)',
    },
    features: {
      background: 'white',
      padding: '80px 0',
    },
    featuresTitle: {
      textAlign: 'center' as const,
      color: '#1a237e',
      fontSize: '2.5rem',
      marginBottom: '3rem',
      fontWeight: 'bold',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    featureCard: {
      background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
      padding: '2.5rem',
      borderRadius: '20px',
      textAlign: 'center' as const,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease',
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
  };

  return (
    <div style={styles.homepage}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.logo}>Plataforma Premium</h1>
          <button onClick={handleSuporte} style={styles.btnSuporte}>
            <FiHeadphones /> Suporte
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            
            {/* Lado Esquerdo - Jovem Chorando */}
            <div style={styles.heroSide}>
              <div style={{...styles.imageContainer, background: 'linear-gradient(135deg, #64b5f6 0%, #1976d2 100%)'}}>
                <div style={styles.personIcon}>😢📱</div>
              </div>
              <div style={{...styles.messageBubble, color: '#1976d2'}}>
                <p>Desliza desliza e nada de alguém né? Aqui o usuário FREE conhece alguém do seu bairro e cidade todo dia, bora chega aqui!</p>
              </div>
            </div>

            {/* Centro - Formulário */}
            <div style={styles.heroCenter}>
              <div style={styles.formContainer}>
                <h2 style={styles.title}>Acesse Nossa Comunidade Premium</h2>
                <p style={styles.subtitle}>Conecte-se com membros exclusivos da sua região!</p>
                
                <form onSubmit={handleSubmitVisitante} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <FiUser style={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <FiMail style={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <button type="submit" style={styles.btnVisitante}>
                    🚀 Entrar Gratuitamente
                  </button>
                </form>

                <div style={styles.divider}>
                  <span style={styles.dividerText}>ou</span>
                </div>

                <button onClick={handleSejaPremium} style={styles.btnPremium}>
                  ⭐ SEJA PREMIUM
                </button>
              </div>
            </div>

            {/* Lado Direito - Jovem Feliz */}
            <div style={styles.heroSide}>
              <div style={{...styles.imageContainer, background: 'linear-gradient(135deg, #ff8a80 0%, #f06292 100%)'}}>
                <div style={styles.personIcon}>😍📱</div>
              </div>
              <div style={{...styles.messageBubble, color: '#e91e63'}}>
                <p>Já encontrei 3 pessoas legais hoje! 💕</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.container}>
          <h3 style={styles.featuresTitle}>Por que escolher nossa Plataforma Premium?</h3>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🏠</div>
              <h4>Pessoas do seu bairro</h4>
              <p>Conheça quem está pertinho de você</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💬</div>
              <h4>Chat em tempo real</h4>
              <p>Converse instantaneamente</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎯</div>
              <h4>100% Real</h4>
              <p>Pessoas reais, conexões verdadeiras</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePageNova; 