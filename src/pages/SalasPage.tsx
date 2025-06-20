import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiLogOut, FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import './SalasPage.css';

interface Sala {
  id: string;
  nome: string;
  tipo: 'capital' | 'personalizada' | 'premium' | 'chat' | 'visitante';
  usuarios: number;
  criada_em?: string;
}

const CAPITAIS_BRASILEIRAS = [
  'Rio Branco - AC', 'Maceió - AL', 'Macapá - AP', 'Manaus - AM',
  'Salvador - BA', 'Fortaleza - CE', 'Brasília - DF', 'Vitória - ES',
  'Goiânia - GO', 'São Luís - MA', 'Cuiabá - MT', 'Campo Grande - MS',
  'Belo Horizonte - MG', 'Belém - PA', 'João Pessoa - PB', 'Curitiba - PR',
  'Recife - PE', 'Teresina - PI', 'Rio de Janeiro - RJ', 'Natal - RN',
  'Porto Alegre - RS', 'Porto Velho - RO', 'Boa Vista - RR', 'Florianópolis - SC',
  'São Paulo - SP', 'Aracaju - SE', 'Palmas - TO'
];

const SalasPage: React.FC = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [salasCapitais, setSalasCapitais] = useState<Sala[]>([]);
  const [salasPersonalizadas, setSalasPersonalizadas] = useState<Sala[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Verificar se usuário está logado
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    const usuarioChat = localStorage.getItem('usuarioChat');
    const visitante = localStorage.getItem('visitante');
    
    if (usuarioPremium) {
      setUsuario({ ...JSON.parse(usuarioPremium), tipo: 'premium' });
    } else if (usuarioChat) {
      const userChat = JSON.parse(usuarioChat);
      
      // Verificar se o tempo de 15 minutos expirou
      const agora = new Date().getTime();
      const tempoDecorrido = agora - userChat.inicioSessao;
      
      if (tempoDecorrido > userChat.limiteTempo) {
        // Tempo expirado, fazer logout automático
        localStorage.removeItem('usuarioChat');
        localStorage.removeItem(`acesso_${userChat.email}`);
        alert('Seu tempo de acesso de 15 minutos expirou. Faça login novamente.');
        navigate('/inicio');
        return;
      }
      
      setUsuario({ ...userChat, tipo: 'chat' });
    } else if (visitante) {
      setUsuario(JSON.parse(visitante));
    } else {
      // Se veio da página início sem login, criar usuário visitante temporário
      const usuarioVisitante = {
        nome: 'Visitante',
        premium: false,
        tipo: 'visitante',
        limiteTempo: 5 * 60 * 1000, // 5 minutos
        inicioSessao: new Date().getTime()
      };
      localStorage.setItem('visitante', JSON.stringify(usuarioVisitante));
      setUsuario(usuarioVisitante);
    }

    // Inicializar salas das capitais
    const capitais = CAPITAIS_BRASILEIRAS.map((capital, index) => ({
      id: capital.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, ''),
      nome: capital,
      tipo: 'capital' as const,
      usuarios: 0 // Apenas usuários reais conectados
    }));

    setSalasCapitais(capitais);

    // Carregar salas personalizadas do localStorage
    const carregarSalasPersonalizadas = () => {
      const salasPersonalizadasSalvas = localStorage.getItem('salas-personalizadas');
      console.log('📂 Carregando salas personalizadas:', salasPersonalizadasSalvas);
      
      if (salasPersonalizadasSalvas) {
        const salas = JSON.parse(salasPersonalizadasSalvas);
        // Filtrar salas que não expiraram (24 horas)
        const salasValidas = salas.filter((sala: any) => {
          const agora = new Date().getTime();
          const criacao = new Date(sala.criada_em).getTime();
          const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
          console.log(`⏰ Sala "${sala.nome}" criada há ${diferencaHoras.toFixed(1)} horas`);
          return diferencaHoras < 24;
        });
        
        console.log('✅ Salas personalizadas válidas:', salasValidas);
        setSalasPersonalizadas(salasValidas);
        localStorage.setItem('salas-personalizadas', JSON.stringify(salasValidas));
      } else {
        console.log('📭 Nenhuma sala personalizada encontrada');
        setSalasPersonalizadas([]);
      }
    };
    
    carregarSalasPersonalizadas();
    
    // Atualizar salas personalizadas a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Atualizando salas personalizadas...');
      carregarSalasPersonalizadas();
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleEntrarSala = (salaId: string, nomeSala: string) => {
    navigate(`/chat/${salaId}`, { state: { nomeSala } });
  };

  const handleCriarSala = () => {
    navigate('/criarsala');
  };

  const salasFiltradas = salasCapitais.filter(sala => 
    sala.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const salasPersonalizadasFiltradas = salasPersonalizadas.filter(sala =>
    sala.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (!usuario) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="salas-page">
      <Header />
      
      <div className="salas-container">
        <div className="salas-header">
          <h1>Salas de Chat</h1>
          <p>Escolha uma sala e comece a conversar!</p>
          
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar salas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input search-input"
              />
              <button onClick={handleCriarSala} className="btn btn-primary criar-sala-btn">
                Criar Sala
              </button>
              <button onClick={() => navigate('/salascriadas')} className="btn btn-secondary criar-sala-btn">
                Salas Criadas
              </button>
            </div>
          </div>
        </div>

        {/* Salas das Capitais */}
        <div className="salas-section">
          <h2>🏛️ Capitais Brasileiras</h2>
          <div className="salas-grid grid grid-3">
            {salasFiltradas.map((sala) => (
              <div key={sala.id} className="sala-card card">
                <div className="sala-info">
                  <h3>{sala.nome}</h3>
                  <div className="sala-stats">
                    <span className="usuarios-online">
                      👥 {sala.usuarios} online
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleEntrarSala(sala.id, sala.nome)}
                  className="btn btn-primary"
                >
                  Entrar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Salas Personalizadas */}
        {salasPersonalizadas.length > 0 && (
          <div className="salas-section">
            <h2>🏠 Salas Personalizadas</h2>
            <p className="section-subtitle">Salas criadas pelos usuários (válidas por 24h)</p>
            <div className="salas-grid grid grid-3">
              {salasPersonalizadasFiltradas.map((sala) => (
                <div key={sala.id} className="sala-card card">
                  <div className="sala-info">
                    <h3>{sala.nome}</h3>
                    <div className="sala-stats">
                      <span className="usuarios-online">
                        👥 {sala.usuarios} online
                      </span>
                      <span className="sala-tempo">
                        ⏰ Criada há {Math.floor((new Date().getTime() - new Date(sala.criada_em!).getTime()) / (1000 * 60 * 60))}h
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEntrarSala(sala.id, sala.nome)}
                    className="btn btn-primary"
                  >
                    Entrar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {salasFiltradas.length === 0 && salasPersonalizadasFiltradas.length === 0 && busca && (
          <div className="no-results">
            <h3>Nenhuma sala encontrada</h3>
            <p>Tente buscar por outro termo ou crie uma nova sala</p>
            <button onClick={handleCriarSala} className="btn btn-primary">
              Criar Nova Sala
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  salasPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A855F7 100%)',
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
  userHeader: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  userHeaderContent: {
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
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
    background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
    color: 'white',
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
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
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
    color: '#2563eb',
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
    fontSize: '0.9rem',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  premiumBanner: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    color: 'white',
  },
  btnBanner: {
    background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

export default SalasPage;