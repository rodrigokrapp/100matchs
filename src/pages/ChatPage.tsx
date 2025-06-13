import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiVideo, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck 
} from 'react-icons/fi';
import './ChatPage.css';

interface Mensagem {
  id: string;
  usuario: string;
  conteudo: string;
  tipo: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji';
  timestamp: Date;
  premium: boolean;
}

const ChatPage: React.FC = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [usuariosOnline] = useState<number>(Math.floor(Math.random() * 500) + 100);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const nomeSala = location.state?.nomeSala || 'Chat';

  const emojis = [
    '😀', '😍', '🥰', '😘', '😜', '🤔', '😎', '🥺', '😭', '😂',
    '❤️', '💕', '🔥', '⭐', '👍', '👎', '🙌', '💪', '✌️', '🤝',
    '🎉', '🎊', '🌟', '💖', '💝', '🌹', '🌺', '🌈', '☀️', '🌙'
  ];

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

    // Simular mensagens existentes
    const mensagensIniciais: Mensagem[] = [
      {
        id: '1',
        usuario: 'Ana',
        conteudo: 'Oi pessoal! Alguém aí da região da Paulista?',
        tipo: 'texto',
        timestamp: new Date(Date.now() - 300000),
        premium: false
      },
      {
        id: '2',
        usuario: 'Carlos_Premium',
        conteudo: 'Eu moro perto! Vamos tomar um café? ☕',
        tipo: 'texto',
        timestamp: new Date(Date.now() - 240000),
        premium: true
      },
      {
        id: '3',
        usuario: 'Maria',
        conteudo: '🎉',
        tipo: 'emoji',
        timestamp: new Date(Date.now() - 180000),
        premium: false
      }
    ];
    
    setMensagens(mensagensIniciais);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensagem = () => {
    if (!mensagem.trim() || !usuario) return;

    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      usuario: usuario.nome,
      conteudo: mensagem,
      tipo: 'texto',
      timestamp: new Date(),
      premium: usuario.tipo === 'premium'
    };

    setMensagens(prev => [...prev, novaMensagem]);
    setMensagem('');
  };

  const handleEnviarEmoji = (emoji: string) => {
    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      usuario: usuario.nome,
      conteudo: emoji,
      tipo: 'emoji',
      timestamp: new Date(),
      premium: usuario.tipo === 'premium'
    };

    setMensagens(prev => [...prev, novaMensagem]);
    setShowEmojis(false);
  };

  const handleFileUpload = (tipo: 'imagem' | 'video') => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar fotos e vídeos.');
      return;
    }

    // Simular upload de arquivo
    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      usuario: usuario.nome,
      conteudo: tipo === 'imagem' ? '📷 Foto enviada' : '🎥 Vídeo enviado',
      tipo,
      timestamp: new Date(),
      premium: true
    };

    setMensagens(prev => [...prev, novaMensagem]);
  };

  const handleAudioRecord = () => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar áudios.');
      return;
    }

    // Simular gravação de áudio
    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      usuario: usuario.nome,
      conteudo: '🎤 Áudio enviado',
      tipo: 'audio',
      timestamp: new Date(),
      premium: true
    };

    setMensagens(prev => [...prev, novaMensagem]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleVoltar = () => {
    navigate('/salas');
  };

  const handleUpgradePremium = () => {
    window.open('https://pay.kiwify.com.br/E2Y9N6m', '_blank');
  };

  if (!usuario) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="chat-page">
      {/* Header do Chat */}
      <header className="chat-header">
        <div className="header-left">
          <button onClick={handleVoltar} className="btn-voltar">
            <FiArrowLeft />
            </button>
          <div className="sala-info">
            <h2>{nomeSala}</h2>
            <span className="usuarios-online">
              <FiUsers /> {usuariosOnline} online
            </span>
        </div>
      </div>

        <div className="header-right">
          <div className="user-badge">
            <span className="user-name">{usuario.nome}</span>
            {usuario.tipo === 'premium' ? (
              <span className="badge premium">⭐ Premium</span>
            ) : (
              <span className="badge gratuito">🆓 Gratuito</span>
            )}
          </div>
          
          {usuario.tipo !== 'premium' && (
            <button onClick={handleUpgradePremium} className="btn-upgrade-small">
              <FiStar /> Upgrade
            </button>
          )}
        </div>
      </header>

      {/* Área de Mensagens */}
      <div className="chat-messages">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.usuario === usuario.nome ? 'own' : 'other'}`}
          >
            <div className="message-header">
              <span className="message-user">
                {msg.usuario}
                {msg.premium && <FiStar className="premium-icon" />}
              </span>
              <span className="message-time">
                <FiClock size={12} />
                {formatTime(msg.timestamp)}
              </span>
            </div>
            
            <div className={`message-content ${msg.tipo}`}>
              {msg.tipo === 'emoji' && (
                <span className="emoji-message">{msg.conteudo}</span>
              )}
              {msg.tipo === 'texto' && (
                <p>{msg.conteudo}</p>
              )}
              {(msg.tipo === 'imagem' || msg.tipo === 'video' || msg.tipo === 'audio') && (
                <div className="media-message">
                  <span>{msg.conteudo}</span>
                  <small>Funcionalidade Premium</small>
                </div>
                    )}
                  </div>
                  
            <div className="message-status">
              <FiCheck size={12} />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

      {/* Picker de Emojis */}
      {showEmojis && (
        <div className="emoji-picker">
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEnviarEmoji(emoji)}
                className="emoji-button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Área de Input */}
      <div className="chat-input-area">
        {usuario.tipo !== 'premium' && (
          <div className="premium-notice">
            <p>💡 Com Premium você pode enviar fotos, vídeos e áudios!</p>
            <button onClick={handleUpgradePremium} className="btn-upgrade-notice">
              Seja Premium
                </button>
              </div>
            )}
            
        <div className="chat-input-container">
          <div className="media-buttons">
              <button
              onClick={() => handleFileUpload('imagem')}
              className="media-btn"
              title="Enviar foto"
            >
              <FiImage />
              </button>

              <button
              onClick={() => handleFileUpload('video')}
              className="media-btn"
              title="Enviar vídeo"
            >
              <FiVideo />
              </button>
            
              <button
                onClick={handleAudioRecord}
              className="media-btn"
              title="Gravar áudio"
            >
              <FiMic />
              </button>
            
            <button
              onClick={() => setShowEmojis(!showEmojis)}
              className="media-btn"
              title="Emojis"
            >
              <FiSmile />
            </button>
          </div>

          <div className="input-container">
              <input
                type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                placeholder="Digite sua mensagem..."
              className="message-input"
              />

              <button
              onClick={handleEnviarMensagem}
              className="send-button"
              disabled={!mensagem.trim()}
            >
              <FiSend />
              </button>
          </div>
        </div>
      </div>

      {/* Inputs ocultos para upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={() => handleFileUpload('imagem')}
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={() => handleFileUpload('video')}
      />
    </div>
  );
};

export default ChatPage;