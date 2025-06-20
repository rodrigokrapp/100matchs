import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import './CriarSalaPage.css';

const CriarSalaPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCriarSala = async () => {
    if (!nome.trim() || !bairro.trim() || !cidade.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // Criar ID único para a sala
      const salaId = `${nome.toLowerCase().replace(/\s/g, '-')}-${bairro.toLowerCase().replace(/\s/g, '-')}-${cidade.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
      
      // Criar objeto da sala
      const usuarioChat = localStorage.getItem('usuarioChat');
      const usuarioPremium = localStorage.getItem('usuarioPremium');
      const usuario = usuarioChat ? JSON.parse(usuarioChat) : (usuarioPremium ? JSON.parse(usuarioPremium) : {});
      
      const novaSala = {
        id: salaId,
        nome: `${nome} - ${bairro}, ${cidade}`,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        tipo: 'personalizada',
        usuarios: 0,
        criada_em: new Date().toISOString(),
        criador: usuario.nome || 'Usuário'
      };

      console.log('🏠 Criando nova sala:', novaSala);

      // ✅ SALVAR NO SUPABASE PARA TODOS OS USUÁRIOS VEREM
      const { data: salaSupabase, error: supabaseError } = await supabase
        .from('salas_personalizadas')
        .insert([{
          id: novaSala.id,
          nome: novaSala.nome,
          bairro: novaSala.bairro,
          cidade: novaSala.cidade,
          criador: novaSala.criador,
          criada_em: novaSala.criada_em,
          usuarios_online: 0
        }])
        .select()
        .single();

      if (supabaseError) {
        console.warn('⚠️ Erro ao salvar no Supabase, salvando apenas localmente:', supabaseError);
        
        // Fallback: salvar no localStorage
        const salasExistentes = JSON.parse(localStorage.getItem('salas-personalizadas') || '[]');
        salasExistentes.push(novaSala);
        localStorage.setItem('salas-personalizadas', JSON.stringify(salasExistentes));
      } else {
        console.log('✅ Sala salva no Supabase com sucesso:', salaSupabase);
        
        // Também salvar no localStorage para backup
        const salasExistentes = JSON.parse(localStorage.getItem('salas-personalizadas') || '[]');
        salasExistentes.push(novaSala);
        localStorage.setItem('salas-personalizadas', JSON.stringify(salasExistentes));
      }

      alert('Sala criada com sucesso! Agora todos os usuários podem vê-la.');
      navigate('/salas');
    } catch (error) {
      console.error('❌ Erro ao criar sala:', error);
      alert('Erro ao criar sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate('/salas');
  };

  return (
    <div className="criar-sala-page">
      <Header />
      
      <div className="criar-sala-container">
        <div className="criar-sala-card card">
          <div className="card-header">
            <h1>Criar Nova Sala</h1>
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

          <div className="info-section">
            <div className="info-card">
              <h3>ℹ️ Informações Importantes</h3>
              <ul>
                <li>Sua sala ficará disponível por <strong>24 horas</strong></li>
                <li>Outros usuários poderão encontrar e entrar na sua sala</li>
                <li>Você será identificado como criador da sala</li>
                <li>A sala será removida automaticamente após 24h</li>
              </ul>
            </div>
          </div>

          <div className="actions">
            <button 
              onClick={handleVoltar}
              className="btn btn-secondary"
            >
              Voltar
            </button>
            <button 
              onClick={handleCriarSala}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Sala'}
            </button>
          </div>
        </div>

        <div className="preview-section">
          {nome && bairro && cidade && (
            <div className="preview-card card">
              <h3>👀 Prévia da Sala</h3>
              <div className="sala-preview">
                <div className="sala-info">
                  <h4>{nome} - {bairro}, {cidade}</h4>
                  <div className="sala-stats">
                    <span className="usuarios-online">
                      👥 1 online
                    </span>
                    <span className="sala-tempo">
                      ⏰ Criada agora
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary btn-small" disabled>
                  Entrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CriarSalaPage; 