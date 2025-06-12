import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaUsers, FaMapMarkerAlt, FaClock, FaSignOutAlt } from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  nome: string;
  isPremium: boolean;
  loginTime: number;
}

interface Sala {
  id: string;
  nome: string;
  cidade: string;
  bairro: string;
  criadorId: string;
  usuariosOnline: number;
  criadaEm: number;
}

// Capitais brasileiras para organizar as salas
const CAPITAIS_BRASILEIRAS = [
  { nome: 'São Paulo', estado: 'São Paulo' },
  { nome: 'Rio de Janeiro', estado: 'Rio de Janeiro' },
  { nome: 'Brasília', estado: 'Distrito Federal' },
  { nome: 'Salvador', estado: 'Bahia' },
  { nome: 'Fortaleza', estado: 'Ceará' },
  { nome: 'Belo Horizonte', estado: 'Minas Gerais' },
  { nome: 'Manaus', estado: 'Amazonas' },
  { nome: 'Curitiba', estado: 'Paraná' },
  { nome: 'Recife', estado: 'Pernambuco' },
  { nome: 'Porto Alegre', estado: 'Rio Grande do Sul' },
  { nome: 'Belém', estado: 'Pará' },
  { nome: 'Goiânia', estado: 'Goiás' },
  { nome: 'Guarulhos', estado: 'São Paulo' },
  { nome: 'Campinas', estado: 'São Paulo' },
  { nome: 'Nova Iguaçu', estado: 'Rio de Janeiro' }
];

const SalasPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Verificar usuário logado
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      navigate('/inicio');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Verificar se é visitante gratuito e calcular tempo restante
    if (!userData.isPremium) {
      const timeElapsed = Date.now() - userData.loginTime;
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutos em ms
      const remaining = thirtyMinutes - timeElapsed;

      if (remaining <= 0) {
        // Verificar se está bloqueado por 24h
        const lastBlock = localStorage.getItem(`blocked_${userData.email}`);
        if (lastBlock) {
          const blockTime = parseInt(lastBlock);
          const twentyFourHours = 24 * 60 * 60 * 1000;
          if (Date.now() - blockTime < twentyFourHours) {
            setIsBlocked(true);
            return;
          }
        }
        
        // Bloquear usuário
        localStorage.setItem(`blocked_${userData.email}`, Date.now().toString());
        localStorage.removeItem('currentUser');
        alert('Seu tempo de 30 minutos expirou! Você foi bloqueado por 24 horas.');
        navigate('/inicio');
        return;
      }

      setTimeLeft(Math.floor(remaining / 1000));
    }

    // Carregar salas (simulado - depois conectar com backend)
    loadSalas();
  }, [navigate]);

  // Timer para visitantes gratuitos
  useEffect(() => {
    if (user && !user.isPremium && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Tempo esgotado
            localStorage.setItem(`blocked_${user.email}`, Date.now().toString());
            localStorage.removeItem('currentUser');
            alert('Seu tempo expirou! Você foi bloqueado por 24 horas.');
            navigate('/inicio');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, timeLeft, navigate]);

  const loadSalas = () => {
    // Simular salas existentes (depois conectar com backend real)
    const salasMock: Sala[] = [
      { id: '1', nome: 'Galera de Copacabana', cidade: 'Rio de Janeiro', bairro: 'Copacabana', criadorId: 'user1', usuariosOnline: 12, criadaEm: Date.now() },
      { id: '2', nome: 'Pessoal da Vila Madalena', cidade: 'São Paulo', bairro: 'Vila Madalena', criadorId: 'user2', usuariosOnline: 8, criadaEm: Date.now() },
      { id: '3', nome: 'Turma de Ipanema', cidade: 'Rio de Janeiro', bairro: 'Ipanema', criadorId: 'user3', usuariosOnline: 15, criadaEm: Date.now() },
      { id: '4', nome: 'Galera do Centro', cidade: 'São Paulo', bairro: 'Centro', criadorId: 'user4', usuariosOnline: 6, criadaEm: Date.now() },
      { id: '5', nome: 'Pessoal de Brasília', cidade: 'Brasília', bairro: 'Asa Norte', criadorId: 'user5', usuariosOnline: 9, criadaEm: Date.now() },
    ];
    setSalas(salasMock);
  };

  const handleSalaClick = (sala: Sala) => {
    navigate(`/chat/${sala.id}`, { state: { sala } });
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/inicio');
  };

  const handlePremiumClick = () => {
    alert('Funcionalidade de pagamento será implementada em breve!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSalas = salas.filter(sala =>
    sala.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sala.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sala.bairro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const salasPorCidade = filteredSalas.reduce((acc, sala) => {
    if (!acc[sala.cidade]) {
      acc[sala.cidade] = [];
    }
    acc[sala.cidade].push(sala);
    return acc;
  }, {} as Record<string, Sala[]>);

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Bloqueado</h2>
          <p className="text-gray-600 mb-6">
            Você foi bloqueado por 24 horas após esgotar seu tempo gratuito.
          </p>
          <button onClick={handlePremiumClick} className="btn-premium w-full">
            ⭐ SEJA PREMIUM ⭐
          </button>
        </div>
      </div>
    );
  }

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                🏙️ Salas de Bate-papo
              </h1>
              <p className="text-gray-600">Encontre pessoas da sua região!</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer para visitantes gratuitos */}
              {!user.isPremium && (
                <div className="bg-orange-100 px-4 py-2 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-700">
                    <FaClock />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                  <p className="text-xs text-orange-600">Tempo restante</p>
                </div>
              )}
              
              {/* Info do usuário */}
              <div className="text-right">
                <p className="font-semibold">{user.nome}</p>
                <p className="text-sm text-gray-500">
                  {user.isPremium ? '⭐ Premium' : '🆓 Gratuito'}
                </p>
              </div>
              
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                <FaSignOutAlt size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Botão Premium (se não for premium) */}
        {!user.isPremium && (
          <div className="card mb-6 bg-gradient-to-r from-pink-50 to-blue-50 border-2 border-pink-200">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">🚀 Upgrade para Premium!</h3>
              <p className="text-gray-600 mb-4">
                Sem limite de tempo • Envie fotos e vídeos • Mensagens de áudio
              </p>
              <button onClick={handlePremiumClick} className="btn-premium">
                ⭐ SEJA PREMIUM ⭐
              </button>
            </div>
          </div>
        )}

        {/* Barra de pesquisa e botão criar sala */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por sala, cidade ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => navigate('/criar-sala')}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <FaPlus /> Criar Sala
            </button>
          </div>
        </div>

        {/* Lista de salas por cidade */}
        <div className="space-y-6">
          {Object.keys(salasPorCidade).length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma sala encontrada</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Tente pesquisar por outros termos' : 'Seja o primeiro a criar uma sala!'}
              </p>
              <button
                onClick={() => navigate('/criar-sala')}
                className="btn-premium"
              >
                <FaPlus className="inline mr-2" /> Criar Nova Sala
              </button>
            </div>
          ) : (
            Object.entries(salasPorCidade).map(([cidade, salasCity]) => (
              <div key={cidade} className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-pink-500" />
                  {cidade}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salasCity.map(sala => (
                    <div
                      key={sala.id}
                      onClick={() => handleSalaClick(sala)}
                      className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-lg mb-2">{sala.nome}</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        📍 {sala.bairro}, {sala.cidade}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <FaUsers />
                          {sala.usuariosOnline} online
                        </span>
                        <button className="btn-secondary text-sm px-3 py-1">
                          Entrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SalasPage;