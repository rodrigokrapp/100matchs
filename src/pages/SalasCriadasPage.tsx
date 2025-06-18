import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiUsers, FiClock } from 'react-icons/fi';
import Header from '../components/Header';
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
    const visitante = localStorage.getItem('visitante');
    const usuarioPremium = localStorage.getItem('usuario');
    
    if (visitante) {
      setUsuario(JSON.parse(visitante));
    } else if (usuarioPremium) {
      setUsuario(JSON.parse(usuarioPremium));
    } else {
      navigate('/inicio');
      return;
    }

    carregarSalasCriadas();
  }, [navigate]);

  const carregarSalasCriadas = () => {
    const salasPersonalizadasSalvas = localStorage.getItem('salas-personalizadas');
    if (salasPersonalizadasSalvas) {
      const salas = JSON.parse(salasPersonalizadasSalvas);
      
      // Filtrar salas que não expiraram (24 horas) e remover as expiradas
      const agora = new Date().getTime();
      const salasValidas = salas.filter((sala: SalaCriada) => {
        const criacao = new Date(sala.criada_em).getTime();
        const diferencaHoras = (agora - criacao) / (1000 * 60 * 60);
        return diferencaHoras < 24;
      });
      
      setSalasPersonalizadas(salasValidas);
      
      // Atualizar localStorage removendo salas expiradas
      if (salasValidas.length !== salas.length) {
        localStorage.setItem('salas-personalizadas', JSON.stringify(salasValidas));
      }
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