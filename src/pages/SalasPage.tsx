import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiLogOut, FiStar } from 'react-icons/fi';

interface Sala {
  id: string;
  nome: string;
  estado: string;
  usuarios: number;
  ultimaMensagem: string;
}

const SalasPage: React.FC = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const [salas] = useState<Sala[]>([
    { id: 'sp', nome: 'São Paulo', estado: 'SP', usuarios: 1247, ultimaMensagem: 'Alguém aí da zona sul?' },
    { id: 'rj', nome: 'Rio de Janeiro', estado: 'RJ', usuarios: 892, ultimaMensagem: 'Praia hoje?' },
    { id: 'bh', nome: 'Belo Horizonte', estado: 'MG', usuarios: 634, ultimaMensagem: 'Pão de açúcar ou brigadeiro?' },
    { id: 'salvador', nome: 'Salvador', estado: 'BA', usuarios: 567, ultimaMensagem: 'Axé! 🎉' },
    { id: 'fortaleza', nome: 'Fortaleza', estado: 'CE', usuarios: 445, ultimaMensagem: 'Sol o ano todo ☀️' },
    { id: 'brasilia', nome: 'Brasília', estado: 'DF', usuarios: 423, ultimaMensagem: 'Política deixa pra lá hehe' },
    { id: 'curitiba', nome: 'Curitiba', estado: 'PR', usuarios: 398, ultimaMensagem: 'Frio mas o coração é quente' },
    { id: 'recife', nome: 'Recife', estado: 'PE', usuarios: 376, ultimaMensagem: 'Frevo no sangue! 💃' },
    { id: 'manaus', nome: 'Manaus', estado: 'AM', usuarios: 289, ultimaMensagem: 'Floresta urbana 🌳' },
    { id: 'goiania', nome: 'Goiânia', estado: 'GO', usuarios: 267, ultimaMensagem: 'Sertanejo universitário?' },
    { id: 'porto-alegre', nome: 'Porto Alegre', estado: 'RS', usuarios: 243, ultimaMensagem: 'Chimarrão online? ☕' },
    { id: 'belem', nome: 'Belém', estado: 'PA', usuarios: 198, ultimaMensagem: 'Açaí é vida!' },
  ]);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário está logado
    const visitante = localStorage.getItem('visitante');
    const usuarioPremium = localStorage.getItem('usuario');
    
    if (visitante) {
      setUsuario(JSON.parse(visitante));
    } else if (usuarioPremium) {
      setUsuario(JSON.parse(usuarioPremium));
    } else {
      navigate('/inicio');
    }
  }, [navigate]);

  const handleEntrarSala = (salaId: string, nomeSala: string) => {
    navigate(`/chat/${salaId}`, { state: { nomeSala } });
  };

  const handleLogout = () => {
    localStorage.removeItem('visitante');
    localStorage.removeItem('usuario');
    navigate('/inicio');
  };

  const handleUpgradePremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  if (!usuario) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={styles.salasPage}>
        {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {usuario.tipo === 'premium' ? <FiStar /> : '👤'}
            </div>
            <div>
              <h3 style={styles.userName}>{usuario.nome}</h3>
              <span style={styles.userType}>
                {usuario.tipo === 'premium' ? '⭐ Premium' : '🆓 Gratuito'}
              </span>
          </div>
        </div>

          <div style={styles.headerActions}>
            {usuario.tipo !== 'premium' && (
              <button onClick={handleUpgradePremium} style={styles.btnUpgrade}>
                <FiStar /> Seja Premium
              </button>
            )}
            <button onClick={handleLogout} style={styles.btnLogout}>
              <FiLogOut /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.title}>Salas de Chat por Cidade</h1>
            <p style={styles.subtitle}>
              Escolha sua cidade e comece a conversar com pessoas da sua região!
            </p>
            </div>

          {/* Grid de Salas */}
          <div style={styles.salasGrid}>
            {salas.map((sala) => (
                    <div
                      key={sala.id}
                style={styles.salaCard}
                onClick={() => handleEntrarSala(sala.id, sala.nome)}
              >
                <div style={styles.salaHeader}>
                  <div style={styles.salaIcon}>
                    <FiMapPin />
                  </div>
                  <div style={styles.salaInfo}>
                    <h3 style={styles.salaNome}>{sala.nome}</h3>
                    <span style={styles.salaEstado}>{sala.estado}</span>
                  </div>
                  <div style={styles.salaUsuarios}>
                    <FiUsers />
                    <span>{sala.usuarios}</span>
                  </div>
                </div>
                
                <div style={styles.ultimaMensagem}>
                  <p>💬 {sala.ultimaMensagem}</p>
                </div>
                
                <div style={styles.salaFooter}>
                  <span style={styles.statusOnline}>🟢 Online agora</span>
                      </div>
                    </div>
                  ))}
          </div>

          {/* Informações para usuários gratuitos */}
          {usuario.tipo !== 'premium' && (
            <div style={styles.premiumBanner}>
              <div style={styles.bannerContent}>
                <FiStar size={40} />
                <div>
                  <h3>Quer mais recursos?</h3>
                  <p>Com o Premium você pode enviar fotos, vídeos, áudios e muito mais!</p>
                </div>
                <button onClick={handleUpgradePremium} style={styles.btnBanner}>
                  Upgrade agora
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  salasPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'white',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
  },
  userName: {
    color: 'white',
    margin: 0,
    fontSize: '1.2rem',
  },
  userType: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  btnUpgrade: {
    background: 'linear-gradient(135deg, #ffd700, #ffb347)',
    color: '#333',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'transform 0.2s',
  },
  btnLogout: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background 0.2s',
  },
  main: {
    padding: '2rem 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  welcomeSection: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  title: {
    color: 'white',
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.2rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  salasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  salaCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    hover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    },
  },
  salaHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  salaIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginRight: '1rem',
  },
  salaInfo: {
    flex: 1,
  },
  salaNome: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#333',
  },
  salaEstado: {
    color: '#666',
    fontSize: '0.9rem',
  },
  salaUsuarios: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  ultimaMensagem: {
    marginBottom: '1rem',
    padding: '0.8rem',
    background: '#f5f5f5',
    borderRadius: '10px',
  },
  salaFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusOnline: {
    color: '#4caf50',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  premiumBanner: {
    background: 'linear-gradient(135deg, #ffd700, #ffb347)',
    borderRadius: '20px',
    padding: '2rem',
    marginTop: '2rem',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    color: '#333',
  },
  btnBanner: {
    background: '#333',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

export default SalasPage;