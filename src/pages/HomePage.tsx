import React from 'react';
import { Link } from 'react-router-dom';

// Adicionar CSS para animação pulse
const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 6px 20px rgba(255, 107, 157, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(255, 107, 157, 0.5);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 6px 20px rgba(255, 107, 157, 0.3);
    }
  }
  
  @keyframes pulsePremium {
    0% {
      transform: scale(1);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
    }
  }
`;

// Injetar CSS no documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const HomePage: React.FC = () => {
  const handleUpgrade = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#7C3AED',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    },
    header: {
      background: 'rgba(124, 58, 237, 0.95)',
      padding: '15px 0',
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 20px'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoImage: {
      height: '40px',
      width: 'auto',
      cursor: 'pointer'
    },
    logoText: {
      fontSize: '28px',
      fontWeight: 700,
      color: 'white'
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
      backgroundImage: 'url("/desliza e nada 1.jpg.png")',
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
    ctaButton: {
      background: 'linear-gradient(135deg, #ff6b9d, #ff8fab)',
      color: 'white',
      border: 'none',
      padding: '24px 48px',
      borderRadius: '50px',
      fontSize: '24px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 25px rgba(255, 107, 157, 0.4)',
      textDecoration: 'none',
      display: 'inline-block',
      animation: 'pulse 2s infinite',
      margin: '20px 0'
    },
    premiumButton: {
      background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
      color: '#333',
      border: 'none',
      padding: '24px 48px',
      borderRadius: '50px',
      fontSize: '24px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
      textDecoration: 'none',
      display: 'inline-block',
      animation: 'pulsePremium 2s infinite',
      margin: '20px 0'
    },
    imagesSection: {
      padding: '60px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center' as const
    },
    imageContainer: {
      marginBottom: '40px'
    },
    sectionImage: {
      width: '100%',
      maxWidth: '600px',
      height: 'auto',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      marginBottom: '20px'
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
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/inicio" style={styles.logoContainer}>
            <img 
              src="/logo-top.jpg.jpg" 
              alt="100 Matchs Logo" 
              style={styles.logoImage}
            />
            <span style={styles.logoText}>100matchs</span>
          </Link>
        </div>
      </header>

      <main>
        <section style={styles.imagesSection}>
          {/* Banner principal com botão abaixo */}
          <div style={styles.imageContainer}>
            <img 
              src="/desliza e nada 1.jpg.png" 
              alt="Banner Principal" 
              style={styles.sectionImage}
            />
          </div>

          {/* Botão Conversar free abaixo do banner */}
          <div style={{textAlign: 'center', margin: '40px 0'}}>
            <Link to="/inicio" style={styles.ctaButton}>
              💬 Conversar free
            </Link>
          </div>
          
          {/* Primeira imagem */}
          <div style={styles.imageContainer}>
            <img 
              src="/feliz -site.jpg.png" 
              alt="Feliz Site" 
              style={styles.sectionImage}
            />
          </div>

          {/* Botão Seja Premium abaixo da primeira imagem */}
          <div style={{textAlign: 'center', margin: '40px 0'}}>
            <button onClick={handleUpgrade} style={styles.premiumButton}>
              ⭐ Seja Premium
            </button>
          </div>

          {/* Segunda imagem */}
          <div style={styles.imageContainer}>
            <img 
              src="/garota-feliz.jpg.jpg" 
              alt="Garota Feliz" 
              style={styles.sectionImage}
            />
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2024 100 Matchs. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default HomePage;