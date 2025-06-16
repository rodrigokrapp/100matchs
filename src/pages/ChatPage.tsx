import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiVideo, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck, FiPlay, FiPause, FiEye
} from 'react-icons/fi';
import { chatService, ChatMessage } from '../lib/chatService';
import { mediaService, EMOJI_CATEGORIES } from '../lib/mediaService';
import Header from '../components/Header';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'video' | 'audio' | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('smileys');
  const [tempMediaUrls, setTempMediaUrls] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nomeSala = location.state?.nomeSala || 'Chat';

  // Cleanup ao sair da página
  useEffect(() => {
    return () => {
      chatService.leaveRoom();
      mediaService.stopRecording();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Limpar URLs temporárias
      tempMediaUrls.forEach(url => mediaService.revokeTempUrl(url));
    };
  }, [tempMediaUrls]);

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
      const mensagensValidas = chatService.filterValidMessages(mensagensExistentes);
      setMensagens(mensagensValidas);
      
      // Conectar ao chat em tempo real
      const connected = await chatService.joinRoom(salaId, (novaMsg) => {
        setMensagens(prev => {
          // Evitar mensagens duplicadas
          const exists = prev.some(msg => msg.id === novaMsg.id);
          if (!exists) {
            const allMessages = [...prev, novaMsg];
            return chatService.filterValidMessages(allMessages);
          }
          return prev;
        });
      });
      
      setIsConnected(connected);
      
      // Simular usuários online
      const randomUsers = Math.floor(Math.random() * 500) + 100;
      setUsuariosOnline(randomUsers);
      await chatService.updateOnlineUsers(salaId, randomUsers);
      
      // Limpar mensagens expiradas periodicamente
      setInterval(async () => {
        if (salaId) {
          await chatService.cleanExpiredMessages(salaId);
          setMensagens(prev => chatService.filterValidMessages(prev));
        }
      }, 30000); // A cada 30 segundos
      
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

  // Iniciar gravação de vídeo
  const handleStartVideoRecording = async () => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar vídeos.');
      return;
    }

    if (isRecording) {
      handleStopRecording();
      return;
    }

    try {
      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);

      // Iniciar contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            handleStopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

      const videoBlob = await mediaService.captureVideo(10);
      if (videoBlob && salaId) {
        const base64 = await mediaService.blobToBase64(videoBlob);
        
        await chatService.sendMessage(
          salaId,
          usuario.nome,
          base64,
          'video',
          true,
          true, // temporária
          10 // 10 segundos
        );
      }
    } catch (error) {
      console.error('Erro ao gravar vídeo:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    } finally {
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
    }
  };

  // Iniciar gravação de áudio
  const handleStartAudioRecording = async () => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar áudios.');
      return;
    }

    if (isRecording) {
      handleStopRecording();
      return;
    }

    try {
      setIsRecording(true);
      setRecordingType('audio');
      setRecordingTime(0);

      // Iniciar contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            handleStopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

      const audioBlob = await mediaService.recordAudio(10);
      if (audioBlob && salaId) {
        const base64 = await mediaService.blobToBase64(audioBlob);
        
        await chatService.sendMessage(
          salaId,
          usuario.nome,
          base64,
          'audio',
          true,
          true, // temporária
          10 // 10 segundos
        );
      }
    } catch (error) {
      console.error('Erro ao gravar áudio:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    } finally {
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
    }
  };

  // Parar gravação
  const handleStopRecording = () => {
    mediaService.stopRecording();
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingType(null);
    setRecordingTime(0);
  };

  // Selecionar imagem
  const handleSelectImage = async () => {
    if (usuario?.tipo !== 'premium') {
      alert('Funcionalidade exclusiva para usuários Premium! Faça upgrade para enviar fotos.');
      return;
    }

    try {
      const imageFile = await mediaService.selectImage();
      if (imageFile && salaId) {
        const base64 = await mediaService.blobToBase64(imageFile);
        
        await chatService.sendMessage(
          salaId,
          usuario.nome,
          base64,
          'imagem',
          true,
          true, // temporária
          10 // 10 segundos
        );
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  };

  // Marcar mensagem temporária como visualizada
  const handleViewTemporaryMessage = async (messageId: string) => {
    if (usuario) {
      await chatService.markTemporaryMessageViewed(messageId, usuario.nome);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMessageExpired = (msg: ChatMessage): boolean => {
    if (!msg.is_temporary || !msg.expires_at) return false;
    return new Date() > new Date(msg.expires_at);
  };

  const formatRecordingTime = (seconds: number): string => {
    return `${seconds}/10s`;
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
      <Header showSupport={false} />
      
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
        {mensagens.map((msg) => {
          if (isMessageExpired(msg)) return null;
          
          return (
            <div key={msg.id} className={`message ${msg.user_name === usuario.nome ? 'own-message' : ''}`}>
              <div className="message-header">
                <span className={`user-name ${msg.is_premium ? 'premium' : ''}`}>
                  {msg.user_name}
                  {msg.is_premium && <FiStar className="premium-icon" />}
                </span>
                <span className="timestamp">
                  <FiClock /> {formatTime(msg.created_at)}
                  {msg.is_temporary && <FiEye className="temporary-icon" title="Mensagem temporária" />}
                </span>
              </div>
              <div className="message-content" onClick={() => msg.is_temporary && handleViewTemporaryMessage(msg.id)}>
                {msg.message_type === 'emoji' ? (
                  <span className="emoji-message">{msg.content}</span>
                ) : msg.message_type === 'video' ? (
                  <div className="media-message">
                    <video controls className="temp-video">
                      <source src={msg.content} type="video/webm" />
                    </video>
                    {msg.is_temporary && <small>⏰ Mensagem temporária</small>}
                  </div>
                ) : msg.message_type === 'audio' ? (
                  <div className="media-message">
                    <audio controls className="temp-audio">
                      <source src={msg.content} type="audio/webm" />
                    </audio>
                    {msg.is_temporary && <small>⏰ Mensagem temporária</small>}
                  </div>
                ) : msg.message_type === 'imagem' ? (
                  <div className="media-message">
                    <img src={msg.content} alt="Imagem" className="temp-image" />
                    {msg.is_temporary && <small>⏰ Mensagem temporária</small>}
                  </div>
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
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-info">
            <span className="recording-icon">
              {recordingType === 'video' ? '🎥' : '🎤'}
            </span>
            <span>Gravando {recordingType}...</span>
            <span className="recording-time">{formatRecordingTime(recordingTime)}</span>
          </div>
          <button onClick={handleStopRecording} className="stop-recording-btn">
            Parar
          </button>
        </div>
      )}

      {/* Area de envio de mensagem */}
      <div className="chat-input-area">
        {usuario.tipo !== 'premium' && (
          <div className="premium-banner">
            <span>💎 Com Premium você pode enviar fotos, vídeos e áudios temporários!</span>
            <button onClick={handleUpgradePremium} className="btn-premium">
              Seja Premium
            </button>
          </div>
        )}

        {/* Painel de Emojis Expandido */}
        {showEmojis && (
          <div className="emoji-panel-expanded">
            <div className="emoji-categories">
              {Object.keys(EMOJI_CATEGORIES).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedEmojiCategory(category)}
                  className={`emoji-category-btn ${selectedEmojiCategory === category ? 'active' : ''}`}
                >
                  {category === 'smileys' && '😊'}
                  {category === 'hearts' && '❤️'}
                  {category === 'gestures' && '👍'}
                  {category === 'activities' && '🎉'}
                  {category === 'nature' && '🌈'}
                </button>
              ))}
            </div>
            <div className="emoji-grid">
              {EMOJI_CATEGORIES[selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEnviarEmoji(emoji)}
                  className="emoji-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="input-container">
          <div className="media-buttons">
            <button 
              onClick={handleSelectImage}
              className="media-btn"
              title="Enviar foto temporária"
            >
              <FiImage />
            </button>
            
            <button 
              onClick={handleStartVideoRecording}
              className={`media-btn ${isRecording && recordingType === 'video' ? 'recording' : ''}`}
              title="Gravar vídeo temporário (0-10s)"
            >
              <FiVideo />
            </button>
            
            <button 
              onClick={handleStartAudioRecording}
              className={`media-btn ${isRecording && recordingType === 'audio' ? 'recording' : ''}`}
              title="Gravar áudio temporário (0-10s)"
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
            disabled={isRecording}
          />
          
          <button 
            onClick={handleEnviarMensagem}
            className="send-btn"
            disabled={!mensagem.trim() || isRecording}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;