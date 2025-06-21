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
      justifyContent: 'space-between',
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
    nav: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center'
    },
    navLink: {
      color: 'white',
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
              src="/logo - oficial.jpg.jpg" 
              alt="100 Matchs Logo" 
              style={styles.logoImage}
            />
            <span style={styles.logoText}>100 matchs</span>
          </Link>
          <nav style={styles.nav}>
            <Link to="/inicio" style={styles.navLink}>Início</Link>
            <Link to="/salas" style={styles.navLink}>Salas</Link>
            <Link to="/premium" style={styles.navLink}>Premium</Link>
            <button onClick={handleUpgrade} style={styles.upgradeBtn}>
              Upgrade ⭐
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section style={styles.hero}>
          <div style={styles.heroBanner}>
            <div style={styles.heroOverlay}>
              {/* Banner apenas com imagem, sem texto */}
            </div>
          </div>
          
          <Link to="/inicio" style={styles.ctaButton}>
            💬 Conversar free
          </Link>
        </section>

        <section style={styles.imagesSection}>
          <div style={styles.imageContainer}>
            <img 
              src="/feliz -site.jpg.png" 
              alt="Feliz Site" 
              style={styles.sectionImage}
            />
          </div>
          
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