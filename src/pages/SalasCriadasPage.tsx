import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiUsers, FiClock } from 'react-icons/fi';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import './SalasCriadasPage.css';

interface SalaCriada {
  id: string;
  nome: string;
  bairro: string;
  cidade: string;
  criada_em: string;
  usuarios: number;
}

const SalasCriadasPage: React.FC = () => {
  const navigate = useNavigate();
  const [salasPersonalizadas, setSalasPersonalizadas] = useState<SalaCriada[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

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

    carregarSalasCriadas();
    
    // Atualizar salas a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Atualizando lista de salas...');
      carregarSalasCriadas();
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const carregarSalasCriadas = async () => {
    console.log('📂 Carregando salas do Supabase e localStorage...');
    
    try {
      // ✅ CARREGAR DO SUPABASE PRIMEIRO (SALAS COMPARTILHADAS)
      const { data: salasSupabase, error: supabaseError } = await supabase
        .from('salas_personalizadas')
        .select('*')
        .order('criada_em', { ascending: false });

      let salasValidas: SalaCriada[] = [];
      const agora = new Date().getTime();

      if (supabaseError) {
        console.warn('⚠️ Erro ao carregar do Supabase, usando localStorage:', supabaseError);
        
        // Fallback: carregar do localStorage
        const salasPersonalizadasSalvas = localStorage.getItem('salas-personalizadas');
        if (salasPersonalizadasSalvas) {
          const salas = JSON.parse(salasPersonalizadasSalvas);
          salasValidas = salas.filter((sala: SalaCriada) => {
            const criacao = new Date(sala.criada_em).getTime();
            const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
            return diferencaHoras < 24;
          });
        }
      } else {
        console.log('✅ Salas carregadas do Supabase:', salasSupabase?.length || 0);
        
        // Filtrar salas que não expiraram (24 horas) e remover as expiradas
        salasValidas = (salasSupabase || [])
          .filter((sala: any) => {
            const criacao = new Date(sala.criada_em).getTime();
            const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
            console.log(`⏰ Sala "${sala.nome}" criada há ${diferencaHoras.toFixed(1)} horas`);
            return diferencaHoras < 24;
          })
          .map((sala: any) => ({
            id: sala.id,
            nome: sala.nome,
            bairro: sala.bairro,
            cidade: sala.cidade,
            criada_em: sala.criada_em,
            usuarios: sala.usuarios_online || 0
          }));

        // Remover salas expiradas do Supabase
        const salasExpiradas = (salasSupabase || []).filter((sala: any) => {
          const criacao = new Date(sala.criada_em).getTime();
          const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
          return diferencaHoras >= 24;
        });

        if (salasExpiradas.length > 0) {
          console.log('🗑️ Removendo salas expiradas do Supabase:', salasExpiradas.length);
          const idsExpirados = salasExpiradas.map((sala: any) => sala.id);
          await supabase
            .from('salas_personalizadas')
            .delete()
            .in('id', idsExpirados);
        }
      }

      // Se não há salas válidas, criar salas de exemplo
      if (salasValidas.length === 0) {
        console.log('📭 Nenhuma sala encontrada, criando salas de exemplo...');
        const salasExemplo = [
          {
            id: `exemplo-1-${Date.now()}`,
            nome: 'Chat Geral - Centro, São Paulo',
            bairro: 'Centro',
            cidade: 'São Paulo',
            criada_em: new Date().toISOString(),
            usuarios: 0
          },
          {
            id: `exemplo-2-${Date.now() + 1}`,
            nome: 'Galera da Praia - Copacabana, Rio de Janeiro',
            bairro: 'Copacabana',
            cidade: 'Rio de Janeiro',
            criada_em: new Date().toISOString(),
            usuarios: 0
          }
        ];
        
        // Tentar salvar no Supabase
        try {
          await supabase
            .from('salas_personalizadas')
            .insert(salasExemplo.map(sala => ({
              id: sala.id,
              nome: sala.nome,
              bairro: sala.bairro,
              cidade: sala.cidade,
              criador: 'Sistema',
              criada_em: sala.criada_em,
              usuarios_online: 0
            })));
          console.log('✅ Salas de exemplo criadas no Supabase');
        } catch (error) {
          console.warn('⚠️ Erro ao criar salas de exemplo no Supabase');
        }
        
        localStorage.setItem('salas-personalizadas', JSON.stringify(salasExemplo));
        salasValidas = salasExemplo;
        console.log('🎯 Salas de exemplo criadas para demonstração');
      }

      console.log('✅ Total de salas válidas:', salasValidas.length);
      setSalasPersonalizadas(salasValidas);
      
    } catch (error) {
      console.error('❌ Erro ao carregar salas:', error);
      setSalasPersonalizadas([]);
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

  const handleExcluirSala = (salaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      const salasAtualizadas = salasPersonalizadas.filter(sala => sala.id !== salaId);
      setSalasPersonalizadas(salasAtualizadas);
      localStorage.setItem('salas-personalizadas', JSON.stringify(salasAtualizadas));
    }
  };

  const handleVoltar = () => {
    navigate('/salas');
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
            <h1>🏠 Salas Criadas</h1>
            <p>Todas as salas personalizadas criadas pelos usuários</p>
            <small>⏰ Salas ficam ativas por 24 horas após a criação</small>
            <button 
              onClick={carregarSalasCriadas}
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
            >
              🔄 Atualizar Lista
            </button>
          </div>
        </div>

        {salasPersonalizadas.length === 0 ? (
          <div className="no-salas">
            <div className="no-salas-card card">
              <h3>Nenhuma sala criada ainda</h3>
              <p>Seja o primeiro a criar uma sala personalizada!</p>
              <button 
                onClick={() => navigate('/criarsala')} 
                className="btn btn-primary"
              >
                Criar Primeira Sala
              </button>
            </div>
          </div>
        ) : (
          <div className="salas-grid">
            {salasPersonalizadas.map((sala) => (
              <div key={sala.id} className="sala-criada-card card">
                <div className="sala-header">
                  <h3>{sala.nome}</h3>
                  <button 
                    onClick={() => handleExcluirSala(sala.id)}
                    className="btn-excluir"
                    title="Excluir sala"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                
                <div className="sala-info">
                  <p className="sala-localizacao">
                    📍 {sala.bairro}, {sala.cidade}
                  </p>
                  
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
                  
                  <div className="sala-criacao">
                    <small>
                      Criada em {new Date(sala.criada_em).toLocaleString('pt-BR')}
                    </small>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleEntrarSala(sala.id, sala.nome)}
                  className="btn btn-primary btn-entrar"
                >
                  Entrar na Sala
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="info-section">
          <div className="info-card card">
            <h3>ℹ️ Informações Importantes</h3>
            <ul>
              <li>🕐 Salas personalizadas ficam ativas por exatamente 24 horas</li>
              <li>🗑️ Você pode excluir salas que criou a qualquer momento</li>
              <li>👥 O número de usuários online é atualizado em tempo real</li>
              <li>🔄 Esta página é atualizada automaticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalasCriadasPage; 