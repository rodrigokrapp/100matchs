import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { salvarSalaCompartilhada, carregarSalasCompartilhadas } from '../lib/salasService';
import './CriarSalaPage.css';

interface SalaMini {
  id: string;
  nome: string;
  bairro: string;
  cidade: string;
  criada_em: string;
  usuarios: number;
  criador: string;
}

const CriarSalaPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [salasDisponiveis, setSalasDisponiveis] = useState<SalaMini[]>([]);
  const [carregandoSalas, setCarregandoSalas] = useState(false);

  useEffect(() => {
    // Carregar salas disponíveis ao carregar a página
    carregarSalas();
    
    // Atualizar salas a cada 30 segundos
    const interval = setInterval(() => {
      carregarSalas();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const carregarSalas = async () => {
    try {
      setCarregandoSalas(true);
      const salas = await carregarSalasCompartilhadas();
      setSalasDisponiveis(salas);
      console.log('✅ Salas carregadas na página criar:', salas.length);
    } catch (error) {
      console.error('❌ Erro ao carregar salas:', error);
    } finally {
      setCarregandoSalas(false);
    }
  };

  const handleCriarSala = async () => {
    if (!nome.trim() || !bairro.trim() || !cidade.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // Criar ID único para a sala
      const salaId = `${nome.toLowerCase().replace(/\s/g, '-')}-${bairro.toLowerCase().replace(/\s/g, '-')}-${cidade.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
      
      // Obter usuário logado
      const usuarioChat = localStorage.getItem('usuarioChat');
      const usuarioPremium = localStorage.getItem('usuarioPremium');
      const usuario = usuarioChat ? JSON.parse(usuarioChat) : (usuarioPremium ? JSON.parse(usuarioPremium) : {});
      
      console.log('🏠 Criando nova sala:', `${nome} - ${bairro}, ${cidade}`);

      // Salvar sala usando o serviço
      const resultado = await salvarSalaCompartilhada({
        id: salaId,
        nome: `${nome} - ${bairro}, ${cidade}`,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        criador: usuario.nome || 'Usuário'
      });

      if (resultado.success) {
        console.log(`✅ Sala criada com sucesso via ${resultado.fonte}`);
        alert('🎉 Sala criada com sucesso!\n\nSua sala já está disponível abaixo e ficará visível por 24 horas para todos os usuários.');
        
        // Limpar formulário
        setNome('');
        setBairro('');
        setCidade('');
        
        // Recarregar salas para mostrar a nova
        await carregarSalas();
      } else {
        console.error('❌ Erro ao salvar sala:', resultado.error);
        alert('❌ Erro ao criar sala. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao criar sala:', error);
      alert('Erro ao criar sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarSala = (salaId: string, nomeSala: string) => {
    navigate(`/chat/${salaId}`, { state: { nomeSala } });
  };

  const calcularTempoRestante = (criadaEm: string) => {
    const agora = new Date().getTime();
    const criacao = new Date(criadaEm).getTime();
    const diferencaMs = (24 * 60 * 60 * 1000) - (agora - criacao);
    
    if (diferencaMs <= 0) return 'Expirada';
    
    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  };

  const handleVoltar = () => {
    navigate('/salas');
  };

  return (
    <div className="criar-sala-page">
      <Header />
      
      <div className="criar-sala-container">
        {/* Seção de Criar Nova Sala */}
        <div className="criar-sala-card card">
          <div className="card-header">
            <h1>✨ Criar Nova Sala</h1>
            <p>Crie sua própria sala de chat personalizada</p>
          </div>

          <div className="form-section">
            <div className="input-group">
              <label htmlFor="nome">Nome da Sala</label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: Galera do Futebol"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input"
                maxLength={50}
              />
            </div>

            <div className="input-group">
              <label htmlFor="bairro">Bairro</label>
              <input
                id="bairro"
                type="text"
                placeholder="Ex: Copacabana"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="input"
                maxLength={50}
              />
            </div>

            <div className="input-group">
              <label htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                type="text"
                placeholder="Ex: Rio de Janeiro"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="input"
                maxLength={50}
              />
            </div>
          </div>

          <div className="actions">
            <button 
              onClick={handleVoltar}
              className="btn btn-secondary"
            >
              ← Voltar
            </button>
            <button 
              onClick={handleCriarSala}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '🔄 Criando...' : '🚀 Criar Sala'}
            </button>
          </div>
        </div>

        {/* Seção de Salas Disponíveis */}
        <div className="salas-disponiveis-section">
          <div className="section-header">
            <h2>🏠 Salas Disponíveis (24h)</h2>
            <p>Todas as salas criadas pela comunidade</p>
            <button 
              onClick={carregarSalas}
              className="btn btn-secondary btn-small"
              disabled={carregandoSalas}
            >
              {carregandoSalas ? '⏳' : '🔄'} Atualizar
            </button>
          </div>

          {carregandoSalas && salasDisponiveis.length === 0 ? (
            <div className="loading-salas">
              <div className="spinner"></div>
              <p>Carregando salas...</p>
            </div>
          ) : salasDisponiveis.length === 0 ? (
            <div className="no-salas">
              <div className="no-salas-card">
                <h3>📭 Nenhuma sala ativa</h3>
                <p>Seja o primeiro a criar uma sala!</p>
              </div>
            </div>
          ) : (
            <div className="salas-mini-grid">
              {salasDisponiveis.map((sala) => (
                <div key={sala.id} className="sala-mini-card">
                  <div className="sala-mini-header">
                    <h4>{sala.nome}</h4>
                    <span className="tempo-restante">
                      ⏰ {calcularTempoRestante(sala.criada_em)}
                    </span>
                  </div>
                  
                  <div className="sala-mini-info">
                    <div className="sala-location">
                      📍 {sala.bairro}, {sala.cidade}
                    </div>
                    <div className="sala-stats">
                      <span>👥 {sala.usuarios} online</span>
                      <span>👤 {sala.criador}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleEntrarSala(sala.id, sala.nome)}
                    className="btn btn-primary btn-small btn-entrar"
                  >
                    💬 Entrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="info-section">
          <div className="info-card card">
            <h3>ℹ️ Como Funciona</h3>
            <ul>
              <li><strong>Duração:</strong> Cada sala fica ativa por exatamente 24 horas</li>
              <li><strong>Visibilidade:</strong> Todas as salas aparecem para todos os usuários</li>
              <li><strong>Atualização:</strong> Lista atualiza automaticamente a cada 30 segundos</li>
              <li><strong>Acesso:</strong> Qualquer usuário pode entrar em qualquer sala</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarSalaPage; 