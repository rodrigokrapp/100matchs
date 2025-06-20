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

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📱 Upload iniciado no mobile/desktop');
    const files = Array.from(e.target.files || []);
    console.log('📁 Arquivos selecionados:', files.length);
    
    if (fotos.length + files.length > 5) {
      alert('Máximo 5 fotos permitidas!');
      return;
    }

    // Converter para base64 com melhor tratamento para mobile
    files.forEach((file, index) => {
      console.log(`📸 Processando foto ${index + 1}:`, file.name, file.size);
      
      // Verificar se é imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens.');
        return;
      }

      // Verificar tamanho (máximo 10MB para mobile)
      if (file.size > 10 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 10MB.');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        console.log('✅ Foto convertida para base64');
        const base64 = event.target?.result as string;
        
        setFotos(prev => {
          const novasFotos = [...prev, base64];
          console.log('📷 Total de fotos agora:', novasFotos.length);
          return novasFotos;
        });
      };

      reader.onerror = (error) => {
        console.error('❌ Erro ao processar imagem:', error);
        alert('Erro ao processar imagem. Tente novamente.');
      };

      reader.readAsDataURL(file);
    });

    // Limpar input para permitir selecionar a mesma foto novamente
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
      // Dados para salvar
      const perfilData = {
        nome: nome,
        descricao: descricao.trim(),
        fotos: fotos,
        idade: idade,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Dados preparados para salvar:', perfilData);

      // Salvar no localStorage com múltiplas chaves para compatibilidade
      try {
        localStorage.setItem(`perfil_${nome}`, JSON.stringify(perfilData));
        console.log('✅ Salvo em perfil_' + nome);
        
        localStorage.setItem(`usuario_${nome}`, JSON.stringify(perfilData));
        console.log('✅ Salvo em usuario_' + nome);
        
        localStorage.setItem(`user_${nome}`, JSON.stringify(perfilData));
        console.log('✅ Salvo em user_' + nome);
        
        localStorage.setItem(`profile_${nome}`, JSON.stringify(perfilData));
        console.log('✅ Salvo em profile_' + nome);
        
      } catch (storageError) {
        console.error('❌ ERRO no localStorage:', storageError);
        throw storageError;
      }

      console.log('📡 Enviando broadcasts...');

      // Broadcast para outros usuários
      window.dispatchEvent(new CustomEvent('profile_updated', {
        detail: {
          nome: nome,
          fotos: fotos,
          descricao: descricao,
          idade: idade
        }
      }));
      console.log('✅ Broadcast profile_updated enviado');

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
      alert('❌ Erro ao salvar perfil: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
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