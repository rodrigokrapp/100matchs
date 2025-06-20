import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './InicioPage.css';

const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [fotoChat, setFotoChat] = useState<string>('');
  const [nomePremium, setNomePremium] = useState('');
  const [emailPremium, setEmailPremium] = useState('');
  const [senhaPremium, setSenhaPremium] = useState('');
  const [fotoPremium, setFotoPremium] = useState<string>('');
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [aceitarTermosPremium, setAceitarTermosPremium] = useState(false);
  const [mostrarTrocarFoto, setMostrarTrocarFoto] = useState(false);

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

  // Upload de foto para chat gratuito
  const handleFotoChatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file, 250, 0.15);
      setFotoChat(compressedBase64);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar imagem. Tente novamente.');
    }
  };

  // Upload de foto para premium
  const handleFotoPremiumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file, 250, 0.15);
      setFotoPremium(compressedBase64);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar imagem. Tente novamente.');
    }
  };

  const handleEntrarChat = () => {
    if (!nome.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    if (!fotoChat) {
      alert('Por favor, adicione uma foto para seu perfil');
      return;
    }

    if (!aceitarTermos) {
      alert('Por favor, aceite os termos de políticas e privacidade');
      return;
    }

    // Salvar usuário de chat gratuito com tempo de sessão e foto
    const usuarioChat = {
      nome: nome.trim(),
      email: email.trim() || `${nome.trim().toLowerCase().replace(/\s+/g, '')}@chat.com`,
      premium: false,
      tipo: 'chat',
      foto: fotoChat,
      limiteTempo: 15 * 60 * 1000, // 15 minutos em milissegundos
      inicioSessao: new Date().getTime()
    };

    localStorage.setItem('usuarioChat', JSON.stringify(usuarioChat));
    localStorage.setItem(`acesso_${usuarioChat.email}`, 'true');
    
    // Salvar foto no perfil também
    const perfilData = {
      nome: usuarioChat.nome,
      fotos: [fotoChat],
      descricao: '',
      idade: 25,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(`perfil_${usuarioChat.nome}`, JSON.stringify(perfilData));
    localStorage.setItem(`usuario_${usuarioChat.nome}`, JSON.stringify(perfilData));

    navigate('/salas');
  };

  const handleEntrarPremium = () => {
    if (!nomePremium.trim() || !emailPremium.trim() || !senhaPremium.trim()) {
      alert('Por favor, preencha nome, email e senha');
      return;
    }

    // Verificar se usuário premium existe
    const usuariosPremium = JSON.parse(localStorage.getItem('usuarios-premium') || '[]');
    const usuarioPremium = usuariosPremium.find((u: any) => 
      u.email === emailPremium.trim() && u.senha === senhaPremium.trim()
    );

    if (!usuarioPremium) {
      alert('Email ou senha incorretos');
      return;
    }

    // Se não tem foto atual e também não tem foto salva, exigir foto
    if (!fotoPremium && !usuarioPremium.foto) {
      alert('Por favor, adicione uma foto para seu perfil');
      return;
    }

    if (!aceitarTermosPremium) {
      alert('Por favor, aceite os termos de políticas e privacidade');
      return;
    }

    // Usar foto atual ou foto salva
    const fotoFinal = fotoPremium || usuarioPremium.foto;

    // Login bem-sucedido com foto
    const usuarioLogado = {
      ...usuarioPremium,
      premium: true,
      tipo: 'premium',
      foto: fotoFinal
    };

    // Atualizar foto no registro de usuários premium se foi alterada
    if (fotoPremium && fotoPremium !== usuarioPremium.foto) {
      const usuariosAtualizados = usuariosPremium.map((u: any) => 
        u.email === emailPremium.trim() && u.senha === senhaPremium.trim() 
          ? { ...u, foto: fotoPremium }
          : u
      );
      localStorage.setItem('usuarios-premium', JSON.stringify(usuariosAtualizados));
      console.log('✅ Foto premium atualizada no registro');
    }

    localStorage.setItem('usuarioPremium', JSON.stringify(usuarioLogado));
    
    // Salvar/atualizar foto no perfil
    const perfilData = {
      nome: usuarioLogado.nome,
      fotos: [fotoFinal],
      descricao: usuarioLogado.descricao || '',
      idade: usuarioLogado.idade || 25,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(`perfil_${usuarioLogado.nome}`, JSON.stringify(perfilData));
    localStorage.setItem(`usuario_${usuarioLogado.nome}`, JSON.stringify(perfilData));

    navigate('/salas');
  };

  const handleSejaPremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  const handleSupporte = () => {
    navigate('/suporte6828');
  };

  // Função para carregar foto salva do usuário premium
  const carregarFotoSalva = () => {
    if (!emailPremium.trim() || !senhaPremium.trim()) {
      setMostrarTrocarFoto(false);
      setFotoPremium('');
      return;
    }
    
    const usuariosPremium = JSON.parse(localStorage.getItem('usuarios-premium') || '[]');
    const usuarioEncontrado = usuariosPremium.find((u: any) => 
      u.email === emailPremium.trim() && u.senha === senhaPremium.trim()
    );
    
    if (usuarioEncontrado) {
      setNomePremium(usuarioEncontrado.nome || '');
      
      // Carregar foto salva se existir
      if (usuarioEncontrado.foto) {
        setFotoPremium(usuarioEncontrado.foto);
        setMostrarTrocarFoto(true);
        console.log('✅ Foto premium carregada automaticamente');
      } else {
        // Tentar carregar do perfil
        const perfilSalvo = localStorage.getItem(`perfil_${usuarioEncontrado.nome}`);
        if (perfilSalvo) {
          try {
            const perfil = JSON.parse(perfilSalvo);
            if (perfil.fotos && perfil.fotos.length > 0) {
              setFotoPremium(perfil.fotos[0]);
              setMostrarTrocarFoto(true);
              console.log('✅ Foto carregada do perfil salvo');
            }
          } catch (error) {
            console.warn('⚠️ Erro ao carregar foto do perfil');
          }
        }
      }
    } else {
      setMostrarTrocarFoto(false);
      setFotoPremium('');
    }
  };

  // Monitorar mudanças no email/senha para carregar foto automaticamente
  useEffect(() => {
    carregarFotoSalva();
  }, [emailPremium, senhaPremium]);

  return (
    <div className="inicio-page">
      <Header />
      
      <div className="inicio-container">
        <div className="main-content">
          {/* Logo da empresa - removido conforme solicitação */}
          
          {/* Container dos formulários lado a lado */}
          <div className="entrada-forms-container">
            {/* Formulário Entrar Chat */}
            <div className="entrada-card card">
              <h2>Entrar no Chat</h2>
              <p>Acesso gratuito (apenas texto)</p>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                />
                
                {/* Campo de upload de foto para chat */}
                <div className="foto-upload-section">
                  <label className="foto-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChatUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="foto-upload-button">
                      {fotoChat ? (
                        <div className="foto-preview">
                          <img src={fotoChat} alt="Sua foto" />
                          <span>📷 Trocar foto</span>
                        </div>
                      ) : (
                        <div className="foto-placeholder">
                          <span>📷 Adicionar sua foto</span>
                          <small>Obrigatório para entrar no chat</small>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="terms-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={aceitarTermos}
                      onChange={(e) => setAceitarTermos(e.target.checked)}
                    />
                    <span>Aceito os termos de políticas e privacidade de imagem, dados básicos e respeito aos usuários do chat</span>
                  </label>
                </div>
                <button onClick={handleEntrarChat} className="btn btn-primary">
                  Entrar Chat
                </button>
              </div>
            </div>

            {/* Formulário Entrar Usuário Premium */}
            <div className="entrada-card card premium-login-card">
              <h2>Entrar Usuário Premium</h2>
              <p>Acesso completo e ilimitado (áudio, imagem, texto e emoticons)</p>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nomePremium}
                  onChange={(e) => setNomePremium(e.target.value)}
                  className="input"
                />
                <input
                  type="email"
                  placeholder="Digite seu email"
                  value={emailPremium}
                  onChange={(e) => setEmailPremium(e.target.value)}
                  className="input"
                />
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senhaPremium}
                  onChange={(e) => setSenhaPremium(e.target.value)}
                  className="input"
                />
                
                {/* Campo de upload de foto para premium */}
                <div className="foto-upload-section">
                  <label className="foto-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoPremiumUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="foto-upload-button premium">
                      {fotoPremium ? (
                        <div className="foto-preview">
                          <img src={fotoPremium} alt="Sua foto" />
                          <span>{mostrarTrocarFoto ? '📷 Trocar foto (opcional)' : '📷 Trocar foto'}</span>
                        </div>
                      ) : (
                        <div className="foto-placeholder">
                          <span>📷 Adicionar sua foto</span>
                          <small>{mostrarTrocarFoto ? 'Foto já salva - opcional trocar' : 'Obrigatório para login premium'}</small>
                        </div>
                      )}
                    </div>
                  </label>
                  {mostrarTrocarFoto && (
                    <small style={{ color: '#ffd700', textAlign: 'center', display: 'block', marginTop: '5px' }}>
                      ✅ Foto já salva! Você pode entrar sem alterar ou trocar se quiser.
                    </small>
                  )}
                </div>
                
                <div className="terms-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={aceitarTermosPremium}
                      onChange={(e) => setAceitarTermosPremium(e.target.checked)}
                    />
                    <span>Aceito os termos de políticas e privacidade de imagem, dados básicos e respeito aos usuários do chat</span>
                  </label>
                </div>
                <button onClick={handleEntrarPremium} className="btn btn-premium">
                  Entrar Premium
                </button>
              </div>
            </div>
          </div>

          <div className="actions-grid">
            <button onClick={handleSejaPremium} className="btn btn-premium premium-card">
              <div className="premium-icon">⭐</div>
              <div>
                <h3>SEJA PREMIUM</h3>
                <p>Acesso completo a todas as funcionalidades</p>
              </div>
            </button>

            <button onClick={handleSupporte} className="btn btn-secondary">
              <div className="support-icon">💬</div>
              <div>
                <h3>Suporte</h3>
                <p>Precisa de ajuda? Clique aqui</p>
              </div>
            </button>
          </div>
        </div>

        <div className="features-section">
          <h2>Vantagens Premium</h2>
          <div className="features-grid grid grid-3">

            <div className="feature-card card">
              <div className="feature-icon">🎤</div>
              <h3>Áudio</h3>
              <p>Envie mensagens de voz (Premium)</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📷</div>
              <h3>Fotos no Chat</h3>
              <p>Compartilhe imagens (Premium)</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">😀</div>
              <h3>Emoticons</h3>
              <p>Expresse-se com emojis (Premium)</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">👀</div>
              <h3>Ver Todas as Fotos</h3>
              <p>Veja o perfil completo dos outros usuários (Premium)</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📝</div>
              <h3>Ver Toda Descrição</h3>
              <p>Leia a descrição completa dos perfis (Premium)</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🖼️</div>
              <h3>Ter Fotos no Perfil</h3>
              <p>Adicione suas fotos ao seu perfil (Premium)</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">✍️</div>
              <h3>Ter Descrição</h3>
              <p>Escreva sua descrição personalizada (Premium)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioPage; 