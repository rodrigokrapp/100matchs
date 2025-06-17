import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiVideo, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck, FiEye, FiPlay, FiPause,
  FiCamera, FiMicOff
} from 'react-icons/fi';
import { chatService, ChatMessage } from '../lib/chatService';
import { mediaService, EMOJI_CATEGORIES } from '../lib/mediaService';
import { testChatConnection } from '../lib/supabase';
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{type: 'video' | 'audio' | 'image', url: string, blob?: Blob} | null>(null);
  const [isPlaying, setIsPlaying] = useState<Map<string, boolean>>(new Map());
  const [mediaPermissions, setMediaPermissions] = useState({camera: false, microphone: false});
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const [showUserSim, setShowUserSim] = useState(false);

  const nomeSala = location.state?.nomeSala || 'Chat';

  // Verificar permissões de mídia
  useEffect(() => {
    checkMediaPermissions();
  }, []);

  const checkMediaPermissions = async () => {
    try {
      const cameraPermission = await mediaService.constructor.checkCameraPermission();
      const micPermission = await mediaService.constructor.checkMicrophonePermission();
      setMediaPermissions({
        camera: cameraPermission,
        microphone: micPermission
      });
    } catch (error) {
      console.log('Erro ao verificar permissões:', error);
    }
  };

  // Simular outros usuários para demonstração
  const simulateOtherUsers = () => {
    const otherUsers = ['Ana', 'Carlos', 'Maria', 'João', 'Paula', 'Bruno'];
    const sampleMessages = [
      'Oi pessoal! Como vocês estão?',
      'Alguém da região aqui?',
      'Bom dia! ☀️',
      'Vamos marcar algo?',
      'Que legal esse chat!',
      'Oi! Acabei de entrar 👋',
      'Como está o tempo aí?',
      'Alguém conhece um lugar legal para ir?'
    ];

    const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    if (usuario && usuario.nome !== randomUser) {
      console.log(`🤖 Simulando mensagem de ${randomUser}: ${randomMessage}`);
      chatService.sendMessage(
        salaId || 'default',
        randomUser,
        randomMessage,
        'texto',
        false
      );
    }
  };

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
      
      // Testar conexão específica do chat
      const connectionTest = await testChatConnection(salaId);
      console.log('🧪 Resultado do teste de conexão:', connectionTest);
      
      // Inicializar tabelas se necessário
      await chatService.initializeTables();
      
      // Buscar mensagens existentes
      const mensagensExistentes = await chatService.getMessages(salaId);
      const mensagensValidas = chatService.filterValidMessages(mensagensExistentes);
      setMensagens(mensagensValidas);
      
      // Conectar ao chat em tempo real com callback melhorado
      const connected = await chatService.joinRoom(salaId, (novaMsg) => {
        console.log('📨 Nova mensagem recebida:', novaMsg);
        setMensagens(prev => {
          // Evitar mensagens duplicadas baseado no ID
          const exists = prev.some(msg => 
            msg.id === novaMsg.id || 
            (msg.content === novaMsg.content && 
             msg.user_name === novaMsg.user_name && 
             Math.abs(new Date(msg.created_at).getTime() - new Date(novaMsg.created_at).getTime()) < 2000)
          );
          
          if (!exists) {
            const allMessages = [...prev, novaMsg];
            return chatService.filterValidMessages(allMessages).sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          }
          return prev;
        });
      });
      
      setIsConnected(connected);
      
      // Simular usuários online baseado na sala (mais realista)
      const baseUsers = Math.floor(Math.random() * 100) + 50; // Entre 50-150
      const roomMultiplier = salaId === 'sao-paulo' ? 3 : salaId === 'rio-de-janeiro' ? 2.5 : 1.5;
      const finalCount = Math.floor(baseUsers * roomMultiplier);
      
      setUsuariosOnline(finalCount);
      await chatService.updateOnlineUsers(salaId, finalCount);
      
      // Atualizar contagem de usuários periodicamente
      const userCountInterval = setInterval(async () => {
        const variation = Math.floor(Math.random() * 10) - 5; // Variação de -5 a +5
        const newCount = Math.max(10, finalCount + variation);
        setUsuariosOnline(newCount);
        await chatService.updateOnlineUsers(salaId, newCount);
      }, 15000); // A cada 15 segundos
      
      // Limpar mensagens expiradas periodicamente
      const cleanupInterval = setInterval(async () => {
        if (salaId) {
          await chatService.cleanExpiredMessages(salaId);
          setMensagens(prev => chatService.filterValidMessages(prev));
        }
      }, 30000); // A cada 30 segundos
      
      // Cleanup ao desmontar
      return () => {
        clearInterval(userCountInterval);
        clearInterval(cleanupInterval);
      };
      
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
    if (!mensagem.trim() || !usuario || !salaId) {
      console.log('❌ Condições não atendidas:', { mensagem: mensagem.trim(), usuario, salaId });
      return;
    }

    try {
      console.log('📤 Enviando mensagem:', mensagem);
      
      const sucesso = await chatService.sendMessage(
        salaId,
        usuario.nome,
        mensagem,
        'texto',
        usuario.premium || false
      );

      if (sucesso) {
        setMensagem('');
        console.log('✅ Mensagem enviada com sucesso');
      } else {
        console.log('⚠️ Mensagem processada via fallback');
        setMensagem(''); // Limpar mesmo assim pois pode ter funcionado via fallback
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  };

  const handleEnviarEmoji = async (emoji: string) => {
    if (!usuario || !salaId) return;

    try {
      await chatService.sendMessage(
        salaId,
        usuario.nome,
        emoji,
        'emoji',
        usuario.premium || false
      );
      setShowEmojis(false);
    } catch (error) {
      console.error('❌ Erro ao enviar emoji:', error);
    }
  };

  // NOVA FUNCIONALIDADE: Capturar vídeo com preview
  const handleStartVideoRecording = async () => {
    try {
      console.log('📹 Iniciando gravação de vídeo...');
      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);

      // Iniciar contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) { // Limite de 30 segundos
            handleStopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      // Capturar vídeo por até 30 segundos
      const videoBlob = await mediaService.captureVideo(30);
      
      if (videoBlob) {
        const url = mediaService.createTempUrl(videoBlob);
        setPreviewMedia({type: 'video', url, blob: videoBlob});
        setIsPreviewMode(true);
      }
      
      setIsRecording(false);
      setRecordingType(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    } catch (error) {
      console.error('❌ Erro ao capturar vídeo:', error);
      alert('Erro ao acessar câmera. Verifique as permissões do navegador.');
      setIsRecording(false);
      setRecordingType(null);
    }
  };

  // NOVA FUNCIONALIDADE: Gravar áudio com preview
  const handleStartAudioRecording = async () => {
    try {
      console.log('🎤 Iniciando gravação de áudio...');
      setIsRecording(true);
      setRecordingType('audio');
      setRecordingTime(0);

      // Iniciar contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { // Limite de 60 segundos para áudio
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      // Gravar áudio por até 60 segundos
      const audioBlob = await mediaService.recordAudio(60);
      
      if (audioBlob) {
        const url = mediaService.createTempUrl(audioBlob);
        setPreviewMedia({type: 'audio', url, blob: audioBlob});
        setIsPreviewMode(true);
      }
      
      setIsRecording(false);
      setRecordingType(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    } catch (error) {
      console.error('❌ Erro ao gravar áudio:', error);
      alert('Erro ao acessar microfone. Verifique as permissões do navegador.');
      setIsRecording(false);
      setRecordingType(null);
    }
  };

  const handleStopRecording = () => {
    mediaService.stopRecording();
    setIsRecording(false);
    setRecordingType(null);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  // NOVA FUNCIONALIDADE: Selecionar imagem com preview
  const handleSelectImage = async () => {
    try {
      const file = await mediaService.selectImage();
      if (file) {
        const url = mediaService.createTempUrl(file);
        setPreviewMedia({type: 'image', url, blob: file});
        setIsPreviewMode(true);
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar imagem:', error);
      alert('Erro ao selecionar imagem.');
    }
  };

  // NOVA FUNCIONALIDADE: Enviar mídia após preview
  const handleSendMedia = async () => {
    if (!previewMedia || !usuario || !salaId) return;

    try {
      const base64 = await mediaService.blobToBase64(previewMedia.blob!);
      
      await chatService.sendMessage(
        salaId,
        usuario.nome,
        base64,
        previewMedia.type === 'image' ? 'imagem' : previewMedia.type,
        usuario.premium || false,
        true, // Mensagem temporária
        usuario.premium ? 24 * 60 * 60 : 30 // 24h para premium, 30s para free
      );

      // Limpar preview
      setIsPreviewMode(false);
      setPreviewMedia(null);
      setShowMediaOptions(false);
    } catch (error) {
      console.error('❌ Erro ao enviar mídia:', error);
      alert('Erro ao enviar mídia.');
    }
  };

  // NOVA FUNCIONALIDADE: Cancelar preview
  const handleCancelPreview = () => {
    if (previewMedia?.url) {
      mediaService.revokeTempUrl(previewMedia.url);
    }
    setIsPreviewMode(false);
    setPreviewMedia(null);
  };

  // NOVA FUNCIONALIDADE: Play/pause para áudio e vídeo
  const handlePlayPause = (messageId: string, element: HTMLVideoElement | HTMLAudioElement) => {
    const newPlayingState = new Map(isPlaying);
    
    if (element.paused) {
      element.play();
      newPlayingState.set(messageId, true);
    } else {
      element.pause();
      newPlayingState.set(messageId, false);
    }
    
    setIsPlaying(newPlayingState);
  };

  const handleViewTemporaryMessage = async (messageId: string) => {
    if (usuario?.nome) {
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoltar = () => {
    navigate('/salas');
  };

  const handleUpgradePremium = () => {
    navigate('/premium');
  };

  if (!usuario) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="chat-page">
      <Header />
      
      <div className="chat-container">
        <div className="chat-header">
          <button className="back-button" onClick={handleVoltar}>
            <FiArrowLeft />
          </button>
          <div className="room-info">
            <h2>{nomeSala}</h2>
            <div className="online-users">
              <FiUsers />
              <span>{usuariosOnline} online</span>
              {isConnected && <div className="connection-status connected"></div>}
            </div>
          </div>
          {!usuario?.premium && (
            <button className="upgrade-button" onClick={handleUpgradePremium}>
              <FiStar />
              Premium
            </button>
          )}
        </div>

        <div className="messages-container">
          {mensagens.length === 0 ? (
            <div className="empty-chat">
              <div className="welcome-message">
                <h3>Bem-vindo ao {nomeSala}!</h3>
                <p>Seja o primeiro a enviar uma mensagem 💬</p>
                <div className="chat-features">
                  <div className="feature">
                    <FiImage />
                    <span>Envie fotos</span>
                  </div>
                  <div className="feature">
                    <FiVideo />
                    <span>Grave vídeos</span>
                  </div>
                  <div className="feature">
                    <FiMic />
                    <span>Envie áudios</span>
                  </div>
                  <div className="feature">
                    <FiSmile />
                    <span>Use emojis</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {mensagens.map((msg) => {
                const isExpired = isMessageExpired(msg);
                const isOwn = msg.user_name === usuario?.nome;
                
                if (isExpired && !isOwn) {
                  return null;
                }

                return (
                  <div 
                    key={msg.id} 
                    className={`message ${isOwn ? 'own-message' : 'other-message'} ${msg.is_temporary ? 'temporary-message' : ''}`}
                  >
                    <div className="message-header">
                      <span className="sender">{msg.user_name}</span>
                      {msg.is_premium && <FiStar className="premium-icon" />}
                      <span className="time">{formatTime(msg.created_at)}</span>
                      {msg.is_temporary && (
                        <div className="temporary-indicator">
                          <FiClock />
                          {isExpired ? 'Expirada' : 'Temporária'}
                        </div>
                      )}
                    </div>
                    
                    <div className="message-content">
                      {msg.message_type === 'texto' && (
                        <p>{msg.content}</p>
                      )}
                      
                      {msg.message_type === 'emoji' && (
                        <div className="emoji-message">{msg.content}</div>
                      )}
                      
                      {msg.message_type === 'imagem' && (
                        <div className="media-message image-message">
                          {isExpired ? (
                            <div className="expired-media">
                              <FiEye />
                              <span>Imagem expirada</span>
                            </div>
                          ) : (
                            <img 
                              src={msg.content} 
                              alt="Imagem enviada" 
                              onClick={() => handleViewTemporaryMessage(msg.id)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW0gaW5kaXNwb27DrXZlbDwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                          )}
                        </div>
                      )}
                      
                      {msg.message_type === 'video' && (
                        <div className="media-message video-message">
                          {isExpired ? (
                            <div className="expired-media">
                              <FiEye />
                              <span>Vídeo expirado</span>
                            </div>
                          ) : (
                            <div className="video-container">
                              <video 
                                controls 
                                onClick={() => handleViewTemporaryMessage(msg.id)}
                                onPlay={(e) => handlePlayPause(msg.id, e.target as HTMLVideoElement)}
                                onPause={(e) => handlePlayPause(msg.id, e.target as HTMLVideoElement)}
                              >
                                <source src={msg.content} type="video/webm" />
                                <source src={msg.content} type="video/mp4" />
                                Seu navegador não suporta vídeo.
                              </video>
                              <div className="video-overlay">
                                <button className="play-button">
                                  {isPlaying.get(msg.id) ? <FiPause /> : <FiPlay />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {msg.message_type === 'audio' && (
                        <div className="media-message audio-message">
                          {isExpired ? (
                            <div className="expired-media">
                              <FiEye />
                              <span>Áudio expirado</span>
                            </div>
                          ) : (
                            <div className="audio-container">
                              <button 
                                className="audio-play-button"
                                onClick={(e) => {
                                  const audio = e.currentTarget.nextElementSibling as HTMLAudioElement;
                                  handlePlayPause(msg.id, audio);
                                  handleViewTemporaryMessage(msg.id);
                                }}
                              >
                                {isPlaying.get(msg.id) ? <FiPause /> : <FiPlay />}
                              </button>
                              <audio 
                                ref={(el) => {
                                  if (el) {
                                    el.onended = () => {
                                      const newState = new Map(isPlaying);
                                      newState.set(msg.id, false);
                                      setIsPlaying(newState);
                                    };
                                  }
                                }}
                              >
                                <source src={msg.content} type="audio/webm" />
                                <source src={msg.content} type="audio/mp3" />
                                Seu navegador não suporta áudio.
                              </audio>
                              <div className="audio-waveform">
                                <span>🎵 Mensagem de áudio</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Preview de mídia */}
        {isPreviewMode && previewMedia && (
          <div className="media-preview-overlay">
            <div className="media-preview-container">
              <div className="preview-header">
                <h3>Visualizar antes de enviar</h3>
                <button onClick={handleCancelPreview}>✕</button>
              </div>
              
              <div className="preview-content">
                {previewMedia.type === 'image' && (
                  <img src={previewMedia.url} alt="Preview" />
                )}
                
                {previewMedia.type === 'video' && (
                  <video ref={videoPreviewRef} controls autoPlay muted>
                    <source src={previewMedia.url} type="video/webm" />
                  </video>
                )}
                
                {previewMedia.type === 'audio' && (
                  <div className="audio-preview">
                    <FiMic />
                    <audio ref={audioPreviewRef} controls>
                      <source src={previewMedia.url} type="audio/webm" />
                    </audio>
                  </div>
                )}
              </div>
              
              <div className="preview-actions">
                <button onClick={handleCancelPreview} className="cancel-button">
                  Cancelar
                </button>
                <button onClick={handleSendMedia} className="send-button">
                  <FiSend />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de gravação */}
        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-content">
              <div className="recording-dot"></div>
              <span>
                {recordingType === 'video' ? 'Gravando vídeo' : 'Gravando áudio'}
              </span>
              <span className="recording-time">
                {formatRecordingTime(recordingTime)}
              </span>
              <button onClick={handleStopRecording} className="stop-button">
                Parar
              </button>
            </div>
          </div>
        )}

        <div className="chat-input-area">
          {/* Painel de emojis */}
          {showEmojis && (
            <div className="emoji-panel">
              <div className="emoji-categories">
                {Object.keys(EMOJI_CATEGORIES).map(category => (
                  <button
                    key={category}
                    className={selectedEmojiCategory === category ? 'active' : ''}
                    onClick={() => setSelectedEmojiCategory(category)}
                  >
                    {category === 'smileys' && '😀'}
                    {category === 'people' && '👋'}
                    {category === 'nature' && '🌸'}
                    {category === 'food' && '🍕'}
                    {category === 'activities' && '⚽'}
                    {category === 'travel' && '🚗'}
                    {category === 'objects' && '💡'}
                    {category === 'symbols' && '❤️'}
                    {category === 'flags' && '🇧🇷'}
                  </button>
                ))}
              </div>
              <div className="emoji-grid">
                {EMOJI_CATEGORIES[selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES]?.map((emoji, index) => (
                  <button
                    key={index}
                    className="emoji-button"
                    onClick={() => handleEnviarEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opções de mídia */}
          {showMediaOptions && (
            <div className="media-options-panel">
              <div className="media-options-grid">
                <button 
                  className="media-option camera-option"
                  onClick={handleSelectImage}
                  disabled={!mediaService.constructor.isMediaSupported()}
                >
                  <FiCamera />
                  <span>Foto</span>
                </button>
                
                <button 
                  className="media-option gallery-option"
                  onClick={handleSelectImage}
                >
                  <FiImage />
                  <span>Galeria</span>
                </button>
                
                <button 
                  className="media-option video-option"
                  onClick={handleStartVideoRecording}
                  disabled={!mediaService.constructor.isMediaSupported() || isRecording}
                >
                  <FiVideo />
                  <span>Vídeo</span>
                </button>
                
                <button 
                  className="media-option audio-option"
                  onClick={handleStartAudioRecording}
                  disabled={!mediaService.constructor.isMediaSupported() || isRecording}
                >
                  <FiMic />
                  <span>Áudio</span>
                </button>
              </div>
              
              {!mediaService.constructor.isMediaSupported() && (
                <div className="media-not-supported">
                  <p>⚠️ Seu navegador não suporta captura de mídia</p>
                </div>
              )}
            </div>
          )}

          <div className="input-container">
            <div className="media-buttons">
              <button 
                className={`media-toggle ${showMediaOptions ? 'active' : ''}`}
                onClick={() => setShowMediaOptions(!showMediaOptions)}
                title="Enviar mídia"
              >
                <FiImage />
              </button>
              
              <button 
                className={`emoji-toggle ${showEmojis ? 'active' : ''}`}
                onClick={() => setShowEmojis(!showEmojis)}
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
              className="send-button"
              disabled={!mensagem.trim() || isRecording}
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;