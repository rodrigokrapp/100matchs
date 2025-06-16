import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MeuPerfilPage: React.FC = () => {
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [fotoPrincipal, setFotoPrincipal] = useState(0);
  const [descricao, setDescricao] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    if (!usuario.email) {
      navigate('/inicio');
      return;
    }
    
    // Carregar dados do perfil
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const { data } = await supabase
        .from('perfis')
        .select('*')
        .eq('email', usuario.email)
        .single();

      if (data) {
        setDescricao(data.descricao || '');
        setNome(data.nome || usuario.nome);
        setFotosUrls(data.fotos || []);
        setFotoPrincipal(data.foto_principal || 0);
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

    const newFotos = [...fotos, ...files];
    setFotos(newFotos);

    // Criar URLs de preview
    const newUrls = files.map(file => URL.createObjectURL(file));
    setFotosUrls([...fotosUrls, ...newUrls]);
  };

  const removerFoto = (index: number) => {
    const newFotos = fotos.filter((_, i) => i !== index);
    const newUrls = fotosUrls.filter((_, i) => i !== index);
    
    setFotos(newFotos);
    setFotosUrls(newUrls);
    
    if (fotoPrincipal === index) {
      setFotoPrincipal(0);
    } else if (fotoPrincipal > index) {
      setFotoPrincipal(fotoPrincipal - 1);
    }
  };

  const salvarPerfil = async () => {
    if (!descricao.trim()) {
      alert('Adicione uma descrição!');
      return;
    }

    setLoading(true);

    try {
      // Upload das fotos se houver
      const fotosUploadadas = [];
      
      for (const foto of fotos) {
        const fileName = `${usuario.email}_${Date.now()}_${foto.name}`;
        const { error } = await supabase.storage
          .from('fotos-perfil')
          .upload(fileName, foto);

        if (error) {
          console.error('Erro no upload:', error);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('fotos-perfil')
            .getPublicUrl(fileName);
          fotosUploadadas.push(publicUrl);
        }
      }

      // Salvar perfil no banco
      const perfilData = {
        email: usuario.email,
        nome: nome || usuario.nome,
        descricao: descricao.trim(),
        fotos: fotosUploadadas.length > 0 ? fotosUploadadas : fotosUrls,
        foto_principal: fotoPrincipal,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('perfis')
        .upsert([perfilData]);

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        alert('Erro ao salvar perfil. Tente novamente.');
      } else {
        alert('Perfil salvo com sucesso!');
        // Voltar para salas se usuário estava logado
        if (usuario.tipo) {
          navigate('/salas');
        }
      }
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
    fotoPrincipal: {
      border: '3px solid #ff69b4',
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
          🌹 Resenha sem Matchs
        </div>
        <button 
          style={styles.backButton}
          onClick={() => navigate(usuario.tipo ? '/salas' : '/inicio')}
        >
          ← Voltar
        </button>
      </header>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Meu Perfil</h1>

          {/* Nome */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={styles.input}
              placeholder="Seu nome"
            />
          </div>

          {/* Fotos */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>Fotos (máximo 5):</label>
            <div style={styles.fotosGrid}>
              {fotosUrls.map((url, index) => (
                <div 
                  key={index}
                  style={{
                    ...styles.fotoItem,
                    ...(fotoPrincipal === index ? styles.fotoPrincipal : {})
                  }}
                  onClick={() => setFotoPrincipal(index)}
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
                  {fotoPrincipal === index && (
                    <div style={{
                      position: 'absolute',
                      bottom: '5px',
                      left: '5px',
                      background: '#ff69b4',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      Principal
                    </div>
                  )}
                </div>
              ))}
              
              {fotosUrls.length < 5 && (
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
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Clique na foto para defini-la como principal
            </p>
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