import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiUsers, FiClock } from 'react-icons/fi';
import Header from '../components/Header';
import { carregarSalasCompartilhadas, excluirSalaCompartilhada, sincronizarSalas } from '../lib/salasService';
import './SalasCriadasPage.css';
import '../components/FotoModal.css';

interface SalaCriada {
  id: string;
  nome: string;
  bairro: string;
  cidade: string;
  criada_em: string;
  usuarios: number;
  fonte?: string;
}

const SalasCriadasPage: React.FC = () => {
  const navigate = useNavigate();
  const [salasPersonalizadas, setSalasPersonalizadas] = useState<SalaCriada[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Verificar se usuário está logado
    const usuarioChat = localStorage.getItem('usuarioChat');
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    
    if (usuarioChat) {
      setUsuario(JSON.parse(usuarioChat));
    } else if (usuarioPremium) {
      setUsuario(JSON.parse(usuarioPremium));
    } else {
      navigate('/inicio');
      return;
    }

    // Forçar criação de salas de exemplo se não existirem
    const garantirSalasExemplo = () => {
      const STORAGE_KEY = 'salas-compartilhadas-globais';
      const salasExistentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      if (salasExistentes.length === 0) {
        console.log('🚀 [SalasCriadasPage] Forçando criação de salas de exemplo');
        const agora = new Date().toISOString();
        const salasExemplo = [
          {
            id: `exemplo-sp-${Date.now()}`,
            nome: 'Chat Geral - Centro, São Paulo',
            bairro: 'Centro',
            cidade: 'São Paulo',
            criador: 'Sistema',
            criada_em: agora,
            usuarios: 3,
            fonte: 'exemplo'
          },
          {
            id: `exemplo-rj-${Date.now() + 1}`,
            nome: 'Galera da Praia - Copacabana, Rio de Janeiro',
            bairro: 'Copacabana',
            cidade: 'Rio de Janeiro',
            criador: 'Sistema',
            criada_em: agora,
            usuarios: 5,
            fonte: 'exemplo'
          },
          {
            id: `exemplo-mg-${Date.now() + 2}`,
            nome: 'Pessoal de BH - Savassi, Belo Horizonte',
            bairro: 'Savassi',
            cidade: 'Belo Horizonte',
            criador: 'Sistema',
            criada_em: agora,
            usuarios: 2,
            fonte: 'exemplo'
          }
        ];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(salasExemplo));
        console.log('✅ [SalasCriadasPage] Salas de exemplo criadas no localStorage');
      }
    };

    // Garantir salas de exemplo primeiro
    garantirSalasExemplo();
    
    // Carregar salas imediatamente
    carregarSalas();
    
    // Sincronizar salas na inicialização
    sincronizarSalas();
    
    // Atualizar salas a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Atualizando lista de salas automaticamente...');
      carregarSalas();
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const carregarSalas = async () => {
    try {
      setCarregando(true);
      console.log('📂 [SalasCriadasPage] Carregando todas as salas compartilhadas...');
      
      const salas = await carregarSalasCompartilhadas();
      console.log('✅ [SalasCriadasPage] Salas carregadas:', salas.length);
      
      if (salas && salas.length > 0) {
        setSalasPersonalizadas(salas);
        console.log('📝 [SalasCriadasPage] Estado atualizado com', salas.length, 'salas');
      } else {
        console.warn('⚠️ [SalasCriadasPage] Nenhuma sala retornada pelo serviço');
        setSalasPersonalizadas([]);
      }
    } catch (error) {
      console.error('❌ [SalasCriadasPage] Erro ao carregar salas:', error);
      setSalasPersonalizadas([]);
    } finally {
      setCarregando(false);
    }
  };

  const calcularTempoRestante = (criadaEm: string) => {
    const agora = new Date().getTime();
    const criacao = new Date(criadaEm).getTime();
    const diferencaMs = (24 * 60 * 60 * 1000) - (agora - criacao); // 24h em ms
    
    if (diferencaMs <= 0) return 'Expirada';
    
    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m restantes`;
  };

  const handleEntrarSala = (salaId: string, nomeSala: string) => {
    navigate(`/chat/${salaId}`, { state: { nomeSala } });
  };

  const handleExcluirSala = async (salaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      console.log('🗑️ Excluindo sala:', salaId);
      const sucesso = await excluirSalaCompartilhada(salaId);
      
      if (sucesso) {
        // Atualizar lista local
        setSalasPersonalizadas(prev => prev.filter(sala => sala.id !== salaId));
        console.log('✅ Sala excluída com sucesso');
      } else {
        alert('Erro ao excluir sala. Tente novamente.');
      }
    }
  };

  const handleVoltar = () => {
    navigate('/salas');
  };

  const handleAtualizarManual = async () => {
    console.log('🔄 Atualização manual solicitada');
    await carregarSalas();
    await sincronizarSalas();
  };

  if (!usuario) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="salas-criadas-page">
      <Header />
      
      <div className="salas-criadas-container">
        <div className="salas-criadas-header">
          <button className="back-button" onClick={handleVoltar}>
            <FiArrowLeft />
            Voltar
          </button>
          
          <div className="header-content">
            <h1>🏠 Salas Criadas por Todos os Usuários</h1>
            <p>Todas as salas personalizadas criadas pela comunidade</p>
            <small>⏰ Salas ficam ativas por exatamente 24 horas após a criação</small>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleAtualizarManual}
                className="btn btn-secondary"
                disabled={carregando}
              >
                {carregando ? '⏳ Carregando...' : '🔄 Atualizar Lista'}
              </button>
            </div>
          </div>
        </div>

        {carregando && salasPersonalizadas.length === 0 ? (
          <div className="loading-salas">
            <div className="spinner"></div>
            <p>Carregando salas compartilhadas...</p>
          </div>
        ) : salasPersonalizadas.length === 0 ? (
          <div className="no-salas">
            <div className="no-salas-card card">
              <h3>📭 Nenhuma sala ativa no momento</h3>
              <p>As salas fixas aparecerão em breve!</p>
              <p><small>💡 Sempre há salas disponíveis para conversar</small></p>
            </div>
          </div>
        ) : (
          <div className="salas-grid">
            {/* Salas Fixas - Sempre no topo */}
            <div className="sala-card card sala-fixa">
              <div className="sala-header">
                <h3>🔥 Só Pegação</h3>
                <div className="sala-fonte">🔥</div>
              </div>
              
              <div className="sala-info">
                <div className="sala-location">
                  📍 Para quem busca diversão sem compromisso
                </div>
                
                <div className="sala-stats">
                  <div className="stat">
                    <FiUsers />
                    <span>🔥 Online</span>
                  </div>
                </div>
                
                <div className="sala-details">
                  <small>Sala fixa - sempre disponível</small>
                </div>
              </div>
              
              <div className="sala-actions">
                <button 
                  onClick={() => handleEntrarSala('sala-pegacao-fixa', 'Só Pegação')}
                  className="btn btn-primary"
                  style={{ background: '#ff4757' }}
                >
                  🔥 Entrar na Sala
                </button>
              </div>
            </div>

            <div className="sala-card card sala-fixa">
              <div className="sala-header">
                <h3>💕 Relacionamento Sério</h3>
                <div className="sala-fonte">💕</div>
              </div>
              
              <div className="sala-info">
                <div className="sala-location">
                  📍 Para quem busca algo sério e duradouro
                </div>
                
                <div className="sala-stats">
                  <div className="stat">
                    <FiUsers />
                    <span>💕 Online</span>
                  </div>
                </div>
                
                <div className="sala-details">
                  <small>Sala fixa - sempre disponível</small>
                </div>
              </div>
              
              <div className="sala-actions">
                <button 
                  onClick={() => handleEntrarSala('sala-relacionamento-serio-fixa', 'Relacionamento Sério')}
                  className="btn btn-primary"
                  style={{ background: '#2ed573' }}
                >
                  💕 Entrar na Sala
                </button>
              </div>
            </div>

            {/* Salas criadas pela comunidade */}
            {salasPersonalizadas.map((sala) => (
              <div key={sala.id} className="sala-card card">
                <div className="sala-header">
                  <h3>{sala.nome}</h3>
                  <div className="sala-fonte">
                    {sala.fonte === 'supabase' && '☁️'}
                    {sala.fonte === 'localStorage' && '💾'}
                    {sala.fonte === 'exemplo' && '🎯'}
                  </div>
                </div>
                
                <div className="sala-info">
                  <div className="sala-location">
                    📍 {sala.bairro}, {sala.cidade}
                  </div>
                  
                  <div className="sala-stats">
                    <div className="stat">
                      <FiUsers />
                      <span>{sala.usuarios} online</span>
                    </div>
                    <div className="stat">
                      <FiClock />
                      <span>{calcularTempoRestante(sala.criada_em)}</span>
                    </div>
                  </div>
                  
                  <div className="sala-details">
                    <small>
                      Criada em: {new Date(sala.criada_em).toLocaleString('pt-BR')}
                    </small>
                  </div>
                </div>
                
                <div className="sala-actions">
                  <button 
                    onClick={() => handleEntrarSala(sala.id, sala.nome)}
                    className="btn btn-primary"
                  >
                    💬 Entrar na Sala
                  </button>
                  <button 
                    onClick={() => handleExcluirSala(sala.id)}
                    className="btn btn-danger btn-small"
                    title="Excluir sala"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="info-footer">
          <div className="info-card card">
            <h4>ℹ️ Como funciona</h4>
            <ul>
              <li><strong>Compartilhamento:</strong> Todas as salas criadas aparecem para todos os usuários</li>
              <li><strong>Duração:</strong> Cada sala fica ativa por exatamente 24 horas</li>
              <li><strong>Atualização:</strong> A lista é atualizada automaticamente a cada 30 segundos</li>
              <li><strong>Sincronização:</strong> Salas são sincronizadas entre dispositivos e usuários</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalasCriadasPage;