import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiEdit3, FiSave, FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import './MeuPerfilPremiumPage.css';

interface PerfilPremium {
  id: string;
  nome: string;
  email: string;
  descricao: string;
  fotos: string[];
  fotoPrincipal: number; // índice da foto principal (0-4)
}

const MeuPerfilPremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuario] = useState<any>(JSON.parse(localStorage.getItem('usuario') || '{}'));
  const [perfil, setPerfil] = useState<PerfilPremium>({
    id: usuario.id || '',
    nome: usuario.nome || '',
    email: usuario.email || '',
    descricao: '',
    fotos: ['', '', '', '', ''],
    fotoPrincipal: 0
  });
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState('');

  // 🧹 FUNÇÃO DE LIMPEZA AGRESSIVA DO LOCALSTORAGE
  const limparLocalStorageAgressivo = () => {
    try {
      console.log('🧹 Iniciando limpeza agressiva do localStorage...');
      
      // Salvar dados críticos
      const dadosCriticos = {
        usuario: localStorage.getItem('usuario'),
        user_token: localStorage.getItem('user_token'),
        auth_session: localStorage.getItem('auth_session')
      };
      
      // Lista de chaves a remover (dados pesados)
      const chavesParaRemover = [];
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && (
          chave.includes('lastChatMessage') ||
          chave.includes('audioRecording') ||
          chave.includes('blob_') ||
          chave.includes('data:image') ||
          chave.includes('chat_') ||
          chave.includes('temp') ||
          chave.includes('upload') ||
          chave.startsWith('perfil_') ||
          chave.includes('forceProfile') ||
          chave.includes('lastProfile')
        )) {
          chavesParaRemover.push(chave);
        }
      }
      
      // Remover chaves problemáticas
      chavesParaRemover.forEach(chave => {
        try {
          localStorage.removeItem(chave);
        } catch (e) {
          console.warn('Erro ao remover', chave);
        }
      });
      
      console.log(`🗑️ Removidas ${chavesParaRemover.length} chaves do localStorage`);
      
      // Se ainda há problemas, limpar TUDO e restaurar críticos
      try {
        localStorage.setItem('teste_quota', 'teste');
        localStorage.removeItem('teste_quota');
      } catch (quotaError) {
        console.log('🧹 Quota ainda excedida, limpando TUDO...');
        localStorage.clear();
        
        // Restaurar apenas dados críticos
        Object.entries(dadosCriticos).forEach(([key, value]) => {
          if (value) {
            try {
              localStorage.setItem(key, value);
            } catch (e) {
              console.warn('Erro ao restaurar', key);
            }
          }
        });
      }
      
      console.log('✅ Limpeza concluída');
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      // Em último caso, limpar tudo
      localStorage.clear();
    }
  };

  useEffect(() => {
    // Verificar se usuário premium está logado
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    if (!usuarioPremium) {
      navigate('/inicio');
      return;
    }

    const user = JSON.parse(usuarioPremium);
    setPerfil(user);

    // Carregar perfil existente ou criar novo
    const perfilSalvo = localStorage.getItem(`perfil_${user.email}`);
    if (perfilSalvo) {
      setPerfil(JSON.parse(perfilSalvo));
      setNovaDescricao(JSON.parse(perfilSalvo).descricao);
    } else {
      const novoPerfil = {
        id: user.email,
        nome: user.nome,
        email: user.email,
        descricao: '',
        fotos: ['', '', '', '', ''],
        fotoPrincipal: 0
      };
      setPerfil(novoPerfil);
    }
  }, [navigate]);

  const handleFotoUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const novasFotos = [...perfil.fotos];
        novasFotos[index] = e.target?.result as string;
        const novoPerfilAtualizado = { ...perfil, fotos: novasFotos };
        setPerfil(novoPerfilAtualizado);
        salvarPerfil(novoPerfilAtualizado);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefinirFotoPrincipal = (index: number) => {
    if (perfil.fotos[index]) {
      const novoPerfilAtualizado = { ...perfil, fotoPrincipal: index };
      setPerfil(novoPerfilAtualizado);
      salvarPerfil(novoPerfilAtualizado);
    }
  };

  const handleSalvarDescricao = () => {
    const novoPerfilAtualizado = { ...perfil, descricao: novaDescricao };
    setPerfil(novoPerfilAtualizado);
    salvarPerfil(novoPerfilAtualizado);
    setEditandoDescricao(false);
  };

  const handleSalvarEIrParaSalas = () => {
    const novoPerfilAtualizado = { ...perfil, descricao: novaDescricao };
    setPerfil(novoPerfilAtualizado);
    salvarPerfil(novoPerfilAtualizado);
    setEditandoDescricao(false);
    navigate('/salas');
  };

  const salvarPerfil = async (perfilAtualizado: PerfilPremium) => {
    console.log('💾 Salvando perfil - Supabase first, localStorage como fallback');
    
    // 🧹 LIMPEZA AGRESSIVA PARA EVITAR QUOTA EXCEEDED
    try {
      console.log('🧹 Limpando localStorage para evitar quota exceeded...');
      
      // Primeiro: limpar dados conhecidamente pesados
      const chavesProblematicas = [
        'lastChatMessage', 'audioRecording', 'tempUpload', 'blob_', 'data:image',
        'forceProfileRefresh', 'lastProfileUpdate'
      ];
      
      // Obter todas as chaves do localStorage
      const todasChaves = [];
      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave) todasChaves.push(chave);
      }
      
      // Remover chaves problemáticas
      todasChaves.forEach(chave => {
        if (chavesProblematicas.some(problema => chave.includes(problema))) {
          try {
            localStorage.removeItem(chave);
            console.log(`🗑️ Removido: ${chave}`);
          } catch (e) {
            console.warn(`Erro ao remover ${chave}:`, e);
          }
        }
      });
      
      // Limpar chats antigos (manter apenas 1 mais recente)
      const chatKeys = todasChaves.filter(key => key.startsWith('chat_'));
      if (chatKeys.length > 1) {
        chatKeys.slice(0, -1).forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`🗑️ Chat removido: ${key}`);
          } catch (e) {
            console.warn(`Erro ao remover chat ${key}:`, e);
          }
        });
      }
      
      // Remover perfis antigos grandes (manter apenas o atual)
      const perfilKeys = todasChaves.filter(key => 
        key.startsWith('perfil_') && 
        !key.includes(perfilAtualizado.nome) && 
        !key.includes(perfilAtualizado.email)
      );
      perfilKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🗑️ Perfil antigo removido: ${key}`);
        } catch (e) {
          console.warn(`Erro ao remover perfil ${key}:`, e);
        }
      });
      
      console.log('✅ Limpeza do localStorage concluída');
      
    } catch (cleanupError) {
      console.warn('⚠️ Erro na limpeza do localStorage:', cleanupError);
      
      // Limpeza de emergência: remover TUDO exceto dados críticos
      try {
        const dadosCriticos = {
          usuario: localStorage.getItem('usuario'),
          user_token: localStorage.getItem('user_token')
        };
        
        localStorage.clear();
        
        // Restaurar apenas dados críticos
        if (dadosCriticos.usuario) localStorage.setItem('usuario', dadosCriticos.usuario);
        if (dadosCriticos.user_token) localStorage.setItem('user_token', dadosCriticos.user_token);
        
        console.log('🧹 Limpeza de emergência realizada');
      } catch (emergencyError) {
        console.error('❌ Erro na limpeza de emergência:', emergencyError);
      }
    }

    // ✅ PRIORITÁRIO: Salvar no Supabase (fonte da verdade)
    let sucessoSupabase = false;
    try {
      const { error } = await supabase
        .from('perfis')
        .upsert([{
          email: perfilAtualizado.email,
          nome: perfilAtualizado.nome,
          descricao: perfilAtualizado.descricao,
          fotos: perfilAtualizado.fotos,
          foto_principal: perfilAtualizado.fotoPrincipal,
          is_premium: true,
          updated_at: new Date().toISOString()
        }]);

      if (!error) {
        console.log('✅ Perfil salvo no Supabase!');
        sucessoSupabase = true;
      } else {
        console.error('Erro Supabase:', error);
      }
    } catch (supabaseError) {
      console.error('Erro conexão Supabase:', supabaseError);
    }

    // ✅ NOVO: NÃO SALVAR MAIS NO LOCALSTORAGE - APENAS SUPABASE
    // O localStorage será usado apenas para dados críticos (login, token)
    // As fotos e perfis ficarão APENAS no Supabase para evitar quota exceeded
    console.log('📝 Dados salvos apenas no Supabase - localStorage reservado para dados críticos');

    // ✅ EVENTOS DE ATUALIZAÇÃO
    try {
      window.dispatchEvent(new CustomEvent('perfilUpdated', {
        detail: { 
          userName: perfilAtualizado.nome,
          fotos: perfilAtualizado.fotos,
          timestamp: Date.now()
        }
      }));

      window.dispatchEvent(new CustomEvent('mini_photo_updated', {
        detail: { 
          userName: perfilAtualizado.nome,
          allPhotos: perfilAtualizado.fotos,
          timestamp: Date.now()
        }
      }));

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceRefreshProfile', {
          detail: { 
            userName: perfilAtualizado.nome,
            fotos: perfilAtualizado.fotos,
            timestamp: Date.now()
          }
        }));
      }, 100);
      
    } catch (eventError) {
      console.error('Erro eventos:', eventError);
    }

    // ✅ FEEDBACK VISUAL
    if (sucessoSupabase) {
      console.log('🎉 Perfil salvo com sucesso!');
    } else {
      console.warn('⚠️ Verifique sua conexão - dados podem não estar sincronizados');
    }
  };

  const removerFoto = (index: number) => {
    const novasFotos = [...perfil.fotos];
    novasFotos[index] = '';
    
    // Se a foto removida era a principal, definir a primeira foto disponível como principal
    let novaFotoPrincipal = perfil.fotoPrincipal;
    if (index === perfil.fotoPrincipal) {
      novaFotoPrincipal = novasFotos.findIndex(foto => foto !== '');
      if (novaFotoPrincipal === -1) novaFotoPrincipal = 0;
    }
    
    const novoPerfilAtualizado = { ...perfil, fotos: novasFotos, fotoPrincipal: novaFotoPrincipal };
    setPerfil(novoPerfilAtualizado);
    salvarPerfil(novoPerfilAtualizado);
  };

  if (!usuario) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="meu-perfil-page">
      <Header />
      
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="premium-badge">
            <FiStar />
            <span>Perfil Premium</span>
          </div>
          <h1>Meu Perfil</h1>
          <p>Personalize seu perfil com fotos e descrição</p>
        </div>

        <div className="perfil-content">
          {/* Seção de Fotos */}
          <div className="fotos-section">
            <h2>Suas Fotos (máximo 5)</h2>
            <div className="fotos-grid">
              {perfil.fotos.map((foto, index) => (
                <div key={index} className={`foto-slot ${index === perfil.fotoPrincipal ? 'principal' : ''}`}>
                  {foto ? (
                    <div className="foto-container">
                      <img src={foto} alt={`Foto ${index + 1}`} />
                      <div className="foto-overlay">
                        <button 
                          onClick={() => handleDefinirFotoPrincipal(index)}
                          className="btn-principal"
                          disabled={index === perfil.fotoPrincipal}
                        >
                          {index === perfil.fotoPrincipal ? '⭐ Principal' : 'Definir Principal'}
                        </button>
                        <button 
                          onClick={() => removerFoto(index)}
                          className="btn-remover"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="foto-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFotoUpload(index, e)}
                        style={{ display: 'none' }}
                      />
                      <FiCamera />
                      <span>Adicionar Foto</span>
                    </label>
                  )}
                  {index === perfil.fotoPrincipal && foto && (
                    <div className="principal-badge">
                      <FiStar />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Seção de Descrição */}
          <div className="descricao-section">
            <h2>Sua Descrição</h2>
            {editandoDescricao ? (
              <div className="descricao-edit">
                <textarea
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                  rows={5}
                />
                <div className="descricao-actions">
                  <button onClick={handleSalvarDescricao} className="btn btn-primary">
                    <FiSave />
                    Salvar
                  </button>
                  <button onClick={handleSalvarEIrParaSalas} className="btn btn-success">
                    <FiSave />
                    Salvar e Ir para Salas
                  </button>
                  <button 
                    onClick={() => {
                      setEditandoDescricao(false);
                      setNovaDescricao(perfil.descricao);
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
                <small>{novaDescricao.length}/500 caracteres</small>
              </div>
            ) : (
              <div className="descricao-view">
                <p>{perfil.descricao || 'Clique em editar para adicionar uma descrição sobre você.'}</p>
                <button 
                  onClick={() => {
                    setEditandoDescricao(true);
                    setNovaDescricao(perfil.descricao);
                  }} 
                  className="btn btn-secondary"
                >
                  <FiEdit3 />
                  Editar Descrição
                </button>
              </div>
            )}
          </div>

          {/* Preview do Perfil */}
          <div className="preview-section">
            <h2>Preview do seu perfil</h2>
            <div className="perfil-preview card">
              <div className="preview-header">
                {perfil.fotos[perfil.fotoPrincipal] && (
                  <img 
                    src={perfil.fotos[perfil.fotoPrincipal]} 
                    alt="Foto principal" 
                    className="foto-principal-preview"
                  />
                )}
                <div className="preview-info">
                  <h3>{perfil.nome} <FiStar className="premium-icon" /></h3>
                  <p className="preview-descricao">
                    {perfil.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuPerfilPremiumPage; 