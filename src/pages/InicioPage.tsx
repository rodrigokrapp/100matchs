import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './InicioPage.css';

const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');
  const [nomePremium, setNomePremium] = useState('');
  const [emailPremium, setEmailPremium] = useState('');
  const [senhaPremium, setSenhaPremium] = useState('');
  const [fotoPremium, setFotoPremium] = useState('');
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [aceitarTermosPremium, setAceitarTermosPremium] = useState(false);

  const handleEntrarChat = () => {
    if (!nome.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    if (!aceitarTermos) {
      alert('Por favor, aceite os termos de políticas e privacidade');
      return;
    }

    // Verificar se o nome está bloqueado por 24 horas
    const nomeKey = `bloqueio_${nome.trim().toLowerCase()}`;
    const bloqueioData = localStorage.getItem(nomeKey);
    
    if (bloqueioData) {
      const { timestamp } = JSON.parse(bloqueioData);
      const agora = new Date().getTime();
      const tempoDecorrido = agora - timestamp;
      const vinteQuatroHoras = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
      
      if (tempoDecorrido < vinteQuatroHoras) {
        const tempoRestante = vinteQuatroHoras - tempoDecorrido;
        const horasRestantes = Math.floor(tempoRestante / (60 * 60 * 1000));
        const minutosRestantes = Math.floor((tempoRestante % (60 * 60 * 1000)) / (60 * 1000));
        
        alert(`Este nome está temporariamente bloqueado. Tente novamente em ${horasRestantes}h ${minutosRestantes}min.`);
        return;
      } else {
        // Bloqueio expirou, remover
        localStorage.removeItem(nomeKey);
      }
    }

    // Salvar usuário de chat gratuito com foto opcional
    const usuarioChat = {
      nome: nome.trim(),
      email: email.trim() || `${nome.trim().toLowerCase().replace(/\s+/g, '')}@chat.com`,
      premium: false,
      tipo: 'chat',
      foto: foto.trim() || null,
      limiteTempo: 15 * 60 * 1000, // 15 minutos em milissegundos
      inicioSessao: new Date().getTime(),
      usuariosBloqueados: [] // Lista de usuários que este usuário bloqueou
    };

    localStorage.setItem('usuarioChat', JSON.stringify(usuarioChat));
    localStorage.setItem(`acesso_${usuarioChat.email}`, 'true');

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

    if (!aceitarTermosPremium) {
      alert('Por favor, aceite os termos de políticas e privacidade');
      return;
    }

    // Login bem-sucedido com foto opcional
    const usuarioLogado = {
      ...usuarioPremium,
      premium: true,
      tipo: 'premium',
      foto: fotoPremium.trim() || usuarioPremium.foto || null,
      usuariosBloqueados: usuarioPremium.usuariosBloqueados || [] // Lista de usuários bloqueados
    };

    localStorage.setItem('usuarioPremium', JSON.stringify(usuarioLogado));

    navigate('/salas');
  };

  const handleSejaPremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  const handleSupporte = () => {
    navigate('/suporte6828');
  };

  return (
    <div className="inicio-page">
      <Header />
      
      <div className="inicio-container">
        <div className="main-content">
          
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
                <input
                  type="url"
                  placeholder="URL da sua foto (opcional)"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  className="input"
                  style={{ fontSize: '12px' }}
                />
                
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
                <input
                  type="url"
                  placeholder="URL da sua foto (opcional)"
                  value={fotoPremium}
                  onChange={(e) => setFotoPremium(e.target.value)}
                  className="input"
                  style={{ fontSize: '12px' }}
                />
                
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
              <div className="feature-icon">🖼️</div>
              <h3>Galeria</h3>
              <p>Acesse galeria completa de fotos e perfis (Premium)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioPage; 