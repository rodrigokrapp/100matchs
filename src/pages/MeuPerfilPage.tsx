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
    const files = Array.from(e.target.files || []);
    if (fotos.length + files.length > 5) {
      alert('Máximo 5 fotos permitidas!');
      return;
    }

    // Converter para base64
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFotos(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removerFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const salvarPerfil = async () => {
    if (!nome) {
      alert('Nome é obrigatório!');
      return;
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

      // Salvar no localStorage com múltiplas chaves para compatibilidade
      localStorage.setItem(`perfil_${nome}`, JSON.stringify(perfilData));
      localStorage.setItem(`usuario_${nome}`, JSON.stringify(perfilData));
      localStorage.setItem(`user_${nome}`, JSON.stringify(perfilData));
      localStorage.setItem(`profile_${nome}`, JSON.stringify(perfilData));

      // Broadcast para outros usuários
      window.dispatchEvent(new CustomEvent('profile_updated', {
        detail: {
          nome: nome,
          fotos: fotos,
          descricao: descricao,
          idade: idade
        }
      }));

      // Broadcast específico para atualizar mini fotos no chat
      window.dispatchEvent(new CustomEvent('mini_photo_updated', {
        detail: {
          userName: nome,
          photo: fotos.length > 0 ? fotos[0] : null
        }
      }));

      // Forçar atualização global
      window.dispatchEvent(new CustomEvent('force_chat_update', {
        detail: { timestamp: Date.now() }
      }));

      // Broadcast específico para atualizar mini fotos no chat
      window.dispatchEvent(new CustomEvent('mini_photo_updated', {
        detail: {
          userName: nome,
          photo: fotos.length > 0 ? fotos[0] : null
        }
      }));

      // Forçar atualização global
      window.dispatchEvent(new CustomEvent('force_chat_update', {
        detail: { timestamp: Date.now() }
      }));

      alert('Perfil salvo com sucesso!');
      navigate('/salas');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar perfil.');
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
                    onChange={handleFotoUpload}
                    style={{ display: 'none' }}
                  />
                  + Adicionar Foto
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