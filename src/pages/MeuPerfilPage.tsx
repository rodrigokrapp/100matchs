import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiX, FiSave } from 'react-icons/fi';

const MeuPerfilPage: React.FC = () => {
  const [fotos, setFotos] = useState<string[]>([]);
  const [descricao, setDescricao] = useState('');
  const [idade, setIdade] = useState(25);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar qual tipo de usuário está logado
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    const usuarioChat = localStorage.getItem('usuarioChat');
    const visitante = localStorage.getItem('visitante');
    
    let currentUser = null;
    
    if (usuarioPremium) {
      currentUser = JSON.parse(usuarioPremium);
    } else if (usuarioChat) {
      currentUser = JSON.parse(usuarioChat);
    } else if (visitante) {
      currentUser = JSON.parse(visitante);
    }
    
    if (!currentUser) {
      navigate('/inicio');
      return;
    }
    
    setNome(currentUser.nome || '');
    
    // Carregar dados do perfil do localStorage
    carregarPerfil(currentUser.nome);
  }, [navigate]);

  const carregarPerfil = (nomeUsuario: string) => {
    try {
      // Buscar dados em múltiplas chaves
      const possiveisChaves = [
        `perfil_${nomeUsuario}`,
        `usuario_${nomeUsuario}`,
        `user_${nomeUsuario}`,
        `profile_${nomeUsuario}`
      ];
      
      for (const chave of possiveisChaves) {
        const dados = localStorage.getItem(chave);
        if (dados) {
          const perfil = JSON.parse(dados);
          setDescricao(perfil.descricao || '');
          setIdade(perfil.idade || 25);
          setFotos(perfil.fotos || []);
          break;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  // Função para comprimir imagem
  const compressImage = (file: File, maxWidth: number = 300, quality: number = 0.2): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com qualidade reduzida
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para limpar dados antigos do localStorage
  const cleanOldData = () => {
    try {
      const keys = Object.keys(localStorage);
      const currentUser = nome;
      
      // Remover dados de outros usuários antigos
      const userKeys = keys.filter(key => 
        (key.startsWith('perfil_') || 
         key.startsWith('usuario_') || 
         key.startsWith('user_') || 
         key.startsWith('profile_')) && 
        !key.includes(currentUser)
      );
      
      // Se há muitos usuários, remover os mais antigos
      if (userKeys.length > 10) {
        const keysToRemove = userKeys.slice(0, userKeys.length - 5);
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ Removido:', key);
        });
      }

      // Limpar mensagens antigas também
      const chatKeys = keys.filter(key => key.startsWith('chat_'));
      if (chatKeys.length > 5) {
        const oldChatKeys = chatKeys.slice(0, chatKeys.length - 3);
        oldChatKeys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('❌ Erro ao limpar dados antigos:', error);
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📱 Upload iniciado no mobile/desktop');
    const files = Array.from(e.target.files || []);
    console.log('📁 Arquivos selecionados:', files.length);
    
    if (fotos.length + files.length > 5) {
      alert('Máximo 5 fotos permitidas!');
      return;
    }

    // Processar cada arquivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📸 Processando foto ${i + 1}:`, file.name, file.size);
      
      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens.');
        continue;
      }

      try {
        // Comprimir imagem com qualidade muito baixa para evitar quota
        console.log('🔄 Comprimindo imagem...');
        const compressedBase64 = await compressImage(file, 250, 0.15);
        
        // Verificar tamanho após compressão
        const sizeAfterCompression = compressedBase64.length * 0.75;
        console.log('📏 Tamanho após compressão:', Math.round(sizeAfterCompression / 1024), 'KB');
        
        setFotos(prev => {
          const novasFotos = [...prev, compressedBase64];
          console.log('📷 Total de fotos agora:', novasFotos.length);
          return novasFotos;
        });
        
        console.log('✅ Foto comprimida e adicionada com sucesso');
        
      } catch (error) {
        console.error('❌ Erro ao processar imagem:', error);
        alert('Erro ao processar imagem. Tente novamente.');
      }
    }

    // Limpar input
    e.target.value = '';
  };

  const removerFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const salvarPerfil = async () => {
    console.log('💾 INICIANDO SALVAMENTO DO PERFIL');
    console.log('📝 Nome:', nome);
    console.log('📸 Fotos:', fotos.length);
    console.log('📄 Descrição:', descricao.length, 'caracteres');
    console.log('🎂 Idade:', idade);
    
    if (!nome) {
      alert('Nome é obrigatório!');
      return;
    }

    if (fotos.length === 0) {
      const confirmar = confirm('Você não adicionou nenhuma foto. Deseja continuar mesmo assim?');
      if (!confirmar) return;
    }

    setLoading(true);

    try {
      // LIMPAR DADOS ANTIGOS PRIMEIRO para evitar quota exceeded
      console.log('🧹 Limpando dados antigos...');
      cleanOldData();

      // Dados para salvar
      const perfilData = {
        nome: nome,
        descricao: descricao.trim(),
        fotos: fotos,
        idade: idade,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Dados preparados para salvar:', perfilData);
      
      // Verificar tamanho dos dados
      const dataSize = JSON.stringify(perfilData).length;
      console.log('📏 Tamanho dos dados:', Math.round(dataSize / 1024), 'KB');

      // Salvar no localStorage com tratamento de erro de quota
      try {
        // Remover dados antigos do usuário atual primeiro
        localStorage.removeItem(`perfil_${nome}`);
        localStorage.removeItem(`usuario_${nome}`);
        localStorage.removeItem(`user_${nome}`);
        localStorage.removeItem(`profile_${nome}`);
        
        // Salvar novos dados
        localStorage.setItem(`perfil_${nome}`, JSON.stringify(perfilData));
        console.log('✅ Salvo em perfil_' + nome);
        
        localStorage.setItem(`usuario_${nome}`, JSON.stringify(perfilData));
        console.log('✅ Salvo em usuario_' + nome);
        
      } catch (storageError: any) {
        console.error('❌ ERRO no localStorage:', storageError);
        
        if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
          // Limpar mais dados e tentar novamente
          console.log('🧹 Quota excedida, limpando TUDO...');
          
          // Limpar todos os dados desnecessários
          const keys = Object.keys(localStorage);
          const essentialKeys = ['usuarioPremium', 'usuarioChat', 'visitante'];
          
          keys.forEach(key => {
            if (!essentialKeys.includes(key) && !key.includes(nome)) {
              localStorage.removeItem(key);
            }
          });
          
          // Tentar salvar apenas o essencial
          localStorage.setItem(`perfil_${nome}`, JSON.stringify(perfilData));
          
          console.log('✅ Salvo após limpeza total');
        } else {
          throw storageError;
        }
      }

      console.log('📡 Enviando broadcasts...');

      // Broadcast específico para atualizar mini fotos no chat
      const fotoParaChat = fotos.length > 0 ? fotos[0] : null;
      window.dispatchEvent(new CustomEvent('mini_photo_updated', {
        detail: {
          userName: nome,
          photo: fotoParaChat
        }
      }));
      console.log('✅ Broadcast mini_photo_updated enviado com foto:', fotoParaChat ? 'SIM' : 'NÃO');

      // Forçar atualização global
      window.dispatchEvent(new CustomEvent('force_chat_update', {
        detail: { timestamp: Date.now() }
      }));
      console.log('✅ Broadcast force_chat_update enviado');

      // Aguardar um pouco para garantir que os eventos foram processados
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🎉 PERFIL SALVO COM SUCESSO!');
      alert('✅ Perfil salvo com sucesso! Sua foto já aparece no chat!');
      
      // Voltar para o chat em vez de salas
      navigate('/salas');
    } catch (error) {
      console.error('💥 ERRO CRÍTICO ao salvar:', error);
      alert('❌ Erro ao salvar perfil. Tente com uma foto menor.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff69b4 0%, #1e3a8a 100%)',
      fontFamily: 'Inter, sans-serif',
    },
    header: {
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    content: {
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '30px',
      textAlign: 'center' as const,
      background: 'linear-gradient(135deg, #ff69b4, #1e3a8a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    section: {
      marginBottom: '30px',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#333',
    },
    fotosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '15px',
      marginBottom: '20px',
    },
    fotoItem: {
      position: 'relative' as const,
      aspectRatio: '1',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '3px solid transparent',
      cursor: 'pointer',
    },
    foto: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    removeButton: {
      position: 'absolute' as const,
      top: '5px',
      right: '5px',
      background: '#ff4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '25px',
      height: '25px',
      fontSize: '12px',
      cursor: 'pointer',
    },
    uploadButton: {
      border: '2px dashed #ddd',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'border-color 0.3s ease',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      color: '#666',
    },
    input: {
      width: '100%',
      padding: '15px',
      border: '2px solid #ddd',
      borderRadius: '12px',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
      marginBottom: '15px',
    },
    textarea: {
      width: '100%',
      padding: '15px',
      border: '2px solid #ddd',
      borderRadius: '12px',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical' as const,
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    },
    saveButton: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '20px',
      opacity: loading ? 0.7 : 1,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/inicio')}>
          🌹 100 Matchs
        </div>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/salas')}
        >
          ← Voltar
        </button>
      </header>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Meu Perfil</h1>

          {/* Fotos */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>Fotos (máximo 5):</label>
            <div style={styles.fotosGrid}>
              {fotos.map((url, index) => (
                <div 
                  key={index}
                  style={styles.fotoItem}
                >
                  <img src={url} alt={`Foto ${index + 1}`} style={styles.foto} />
                  <button
                    style={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      removerFoto(index);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {fotos.length < 5 && (
                <label style={styles.uploadButton}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handleFotoUpload}
                    style={{ display: 'none' }}
                  />
                  📷 Adicionar Foto
                </label>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>Descrição:</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={styles.textarea}
              placeholder="Conte um pouco sobre você..."
              maxLength={500}
            />
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'right' }}>
              {descricao.length}/500 caracteres
            </p>
          </div>

          {/* Idade */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>Idade:</label>
            <input
              type="number"
              value={idade}
              onChange={(e) => setIdade(parseInt(e.target.value) || 25)}
              style={styles.input}
              min="18"
              max="99"
            />
          </div>

          {/* Botão Salvar */}
          <button 
            style={styles.saveButton} 
            onClick={salvarPerfil}
            disabled={loading}
          >
            {loading ? '⏳ Salvando...' : '💾 Salvar Perfil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeuPerfilPage; 