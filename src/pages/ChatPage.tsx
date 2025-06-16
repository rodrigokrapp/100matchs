import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiVideo, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck 
} from 'react-icons/fi';
import { chatService, ChatMessage } from '../lib/chatService';
import './ChatPage.css';

const ChatPage: React.FC = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [usuariosOnline, setUsuariosOnline] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
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

    // Inicializar chat em tempo real
    initializeChat();

    // Listener para mensagens locais (fallback)
    const handleLocalMessage = (event: any) => {
      const newMessage: ChatMessage = {
        ...event.detail,
        id: Date.now().toString(),
      };
      setMensagens(prev => [...prev, newMessage]);
    };

    window.addEventListener('local-message', handleLocalMessage);

    // Cleanup ao sair da página
    return () => {
      chatService.leaveRoom();
      window.removeEventListener('local-message', handleLocalMessage);
    };
  }, [navigate, salaId]);

  const initializeChat = async () => {
    if (!salaId) return;

    try {
      console.log('🚀 Inicializando chat para sala:', salaId);
      
      // Inicializar tabelas se necessário
      await chatService.initializeTables();
      
      // Buscar mensagens existentes
      const mensagensExistentes = await chatService.getMessages(salaId);
      setMensagens(mensagensExistentes);
      
      // Conectar ao chat em tempo real
      const connected = await chatService.joinRoom(salaId, (novaMsg) => {
        setMensagens(prev => {
          // Evitar mensagens duplicadas
          const exists = prev.some(msg => msg.id === novaMsg.id);
          if (!exists) {
            return [...prev, novaMsg];
          }
          return prev;
        });
      });
      
      setIsConnected(connected);
      
      // Simular usuários online
      const randomUsers = Math.floor(Math.random() * 500) + 100;
      setUsuariosOnline(randomUsers);
      await chatService.updateOnlineUsers(salaId, randomUsers);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim() || !usuario || !salaId) return;

    const success = await chatService.sendMessage(
      salaId,
      usuario.nome,
      mensagem,
      'texto',
      usuario.tipo === 'premium'
    );

    if (success) {
      setMensagem('');
    }
  };

  const handleEnviarEmoji = async (emoji: string) => {
    if (!usuario || !salaId) return;

    const success = await chatService.sendMessage(
      salaId,
      usuario.nome,
      emoji,
      'emoji',
      usuario.tipo === 'premium'
    );

    if (success) {
      setShowEmojis(false);
    }
  };

  const handleFileUpload = async (tipo: 'imagem' | 'video') => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar fotos e vídeos.');
      return;
    }

    if (!salaId) return;

    const conteudo = tipo === 'imagem' ? '📷 Foto enviada' : '🎥 Vídeo enviado';
    await chatService.sendMessage(salaId, usuario.nome, conteudo, tipo, true);
  };

  const handleAudioRecord = async () => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar áudios.');
      return;
    }

    if (!salaId) return;

    await chatService.sendMessage(salaId, usuario.nome, '🎤 Áudio enviado', 'audio', true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
              {isConnected && <span className="status-connected">🟢</span>}
              {!isConnected && <span className="status-disconnected">🔴</span>}
            </span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-badge">
            <span className="user-name">{usuario.nome}</span>
            {usuario.tipo === 'premium' ? (
              <span className="badge premium">⭐ Premium</span>
            ) : (
              <button onClick={handleUpgradePremium} className="badge upgrade">
                Ser Premium
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Lista de Mensagens */}
      <div className="chat-messages">
        {mensagens.map((msg) => (
          <div key={msg.id} className={`message ${msg.user_name === usuario.nome ? 'own-message' : ''}`}>
            <div className="message-header">
              <span className={`user-name ${msg.is_premium ? 'premium' : ''}`}>
                {msg.user_name}
                {msg.is_premium && <FiStar className="premium-icon" />}
              </span>
              <span className="timestamp">
                <FiClock /> {formatTime(msg.created_at)}
              </span>
            </div>
            <div className="message-content">
              {msg.message_type === 'emoji' ? (
                <span className="emoji-message">{msg.content}</span>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
            {msg.user_name === usuario.nome && (
              <div className="message-status">
                <FiCheck className="sent-icon" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Area de envio de mensagem */}
      <div className="chat-input-area">
        {usuario.tipo !== 'premium' && (
          <div className="premium-banner">
            <span>💎 Com Premium você pode enviar fotos, vídeos e áudios!</span>
            <button onClick={handleUpgradePremium} className="btn-premium">
              Seja Premium
            </button>
          </div>
        )}

        {/* Painel de Emojis */}
        {showEmojis && (
          <div className="emoji-panel">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEnviarEmoji(emoji)}
                className="emoji-btn"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="input-container">
          <div className="media-buttons">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={() => handleFileUpload('imagem')}
              style={{ display: 'none' }}
            />
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={() => handleFileUpload('video')}
              style={{ display: 'none' }}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="media-btn"
              title="Enviar foto"
            >
              <FiImage />
            </button>
            
            <button 
              onClick={() => videoInputRef.current?.click()}
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
            className="send-btn"
            disabled={!mensagem.trim()}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;