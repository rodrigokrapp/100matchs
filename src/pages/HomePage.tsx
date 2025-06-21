import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const handleUpgrade = () => {
    console.log('🔄 Redirecionando para upgrade...');
    // Remover link específico - será configurado posteriormente
    alert('Link de pagamento será configurado posteriormente');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'white',
      color: '#333',
      fontFamily: 'Inter, sans-serif'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '15px 0',
      boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px'
    },
    logo: {
      fontSize: '28px',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #ff6b9d, #4facfe)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    nav: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center'
    },
    navLink: {
      color: '#333',
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'all 0.3s ease'
    },
    upgradeBtn: {
      background: 'linear-gradient(135deg, #ff6b9d, #ff8fab)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '25px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
    },
    hero: {
      textAlign: 'center' as const,
      padding: '80px 20px',
      maxWidth: '800px',
      margin: '0 auto'
    },
    heroBanner: {
      position: 'relative' as const,
      width: '100%',
      height: 'auto',
      minHeight: '400px',
      overflow: 'hidden',
      borderRadius: '15px',
      marginBottom: '40px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      backgroundImage: 'url("/capa-principal.jpg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      aspectRatio: '16/9'
    },

    heroOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: '20px',
      background: 'transparent',
      textAlign: 'center' as const
    },
    heroTitle: {
      fontSize: '48px',
      fontWeight: 700,
      marginBottom: '20px',
      color: 'white',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
      '@media (max-width: 768px)': {
        fontSize: '36px'
      }
    },
    heroSubtitle: {
      fontSize: '20px',
      color: 'rgba(255, 255, 255, 0.95)',
      marginBottom: '30px',
      lineHeight: 1.6,
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
      maxWidth: '600px',
      '@media (max-width: 768px)': {
        fontSize: '18px'
      }
    },
    ctaButton: {
      background: 'linear-gradient(135deg, #ff6b9d, #ff8fab)',
      color: 'white',
      border: 'none',
      padding: '16px 32px',
      borderRadius: '30px',
      fontSize: '18px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 20px rgba(255, 107, 157, 0.3)',
      textDecoration: 'none',
      display: 'inline-block'
    },
    features: {
      padding: '80px 20px',
      background: 'rgba(248, 249, 250, 0.5)'
    },
    featuresContainer: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    featuresTitle: {
      textAlign: 'center' as const,
      fontSize: '36px',
      fontWeight: 700,
      marginBottom: '50px',
      color: '#333'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px'
    },
    featureCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '30px',
      borderRadius: '20px',
      textAlign: 'center' as const,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease'
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    featureTitle: {
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '15px',
      color: '#333'
    },
    featureDesc: {
      color: '#666',
      lineHeight: 1.6
    },
    footer: {
      background: '#333',
      color: 'white',
      textAlign: 'center' as const,
      padding: '40px 20px'
    }
  };

  return (
    <div style={styles.container}>
      <main>
        <section style={styles.hero}>
          <div style={styles.heroBanner}>
            <div style={styles.heroOverlay}>
              {/* Banner apenas com imagem, sem texto */}
            </div>
          </div>
          
          <Link to="/inicio" style={styles.ctaButton}>
            🚀 Começar Agora
          </Link>
        </section>

        <section style={styles.features}>
          <div style={styles.featuresContainer}>
            <h3>Por que escolher nossa Plataforma Premium?</h3>
            <div style={styles.featuresGrid}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🎯</div>
                <h4 style={styles.featureTitle}>Conteúdo Exclusivo</h4>
                <p style={styles.featureDesc}>
                  Acesso a materiais premium únicos e de alta qualidade
                </p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>💬</div>
                <h4 style={styles.featureTitle}>Comunidade Ativa</h4>
                <p style={styles.featureDesc}>
                  Conecte-se com membros premium em tempo real
                </p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🔒</div>
                <h4 style={styles.featureTitle}>100% Seguro</h4>
                <p style={styles.featureDesc}>
                  Ambiente seguro e privado para seus dados
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2024 Plataforma Premium. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default HomePage;