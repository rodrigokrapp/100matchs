import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiVideo, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck, FiEye, FiPlay, FiPause,
  FiCamera, FiMicOff
} from 'react-icons/fi';
import { chatService, ChatMessage } from '../lib/chatService';
import MediaService, { EMOJI_CATEGORIES } from '../lib/mediaService';
import { testChatConnection } from '../lib/supabase';
import Header from '../components/Header';
import MiniPerfilUsuario from '../components/MiniPerfilUsuario';
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
  const [viewedMessages, setViewedMessages] = useState<Map<string, number>>(new Map()); // messageId -> timestamp quando foi visualizado
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
      const cameraPermission = await MediaService.checkCameraPermission();
      const micPermission = await MediaService.checkMicrophonePermission();
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
      MediaService.stopRecording();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Limpar URLs temporárias
      tempMediaUrls.forEach(url => MediaService.revokeTempUrl(url));
    };
  }, [tempMediaUrls]);

  useEffect(() => {
    // Verificar se usuário está logado
    const usuarioChat = localStorage.getItem('usuarioChat');
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    
    if (usuarioChat) {
      setUsuario(JSON.parse(usuarioChat));
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
    console.log('🔄 handleEnviarMensagem chamado');
    console.log('📝 Mensagem atual:', mensagem);
    console.log('👤 Usuário atual:', usuario);
    console.log('🏠 Sala atual:', salaId);
    
    if (!mensagem.trim()) {
      console.log('❌ Mensagem vazia');
      return;
    }
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    if (!salaId) {
      console.log('❌ ID da sala não encontrado');
      return;
    }

    // Limpar mensagem imediatamente para melhor UX
    const mensagemParaEnviar = mensagem.trim();
    setMensagem('');

    try {
      console.log('📤 Enviando mensagem:', mensagemParaEnviar);
      
      const sucesso = await chatService.sendMessage(
        salaId,
        usuario.nome,
        mensagemParaEnviar,
        'texto',
        usuario.premium || false
      );

      if (sucesso) {
        console.log('✅ Mensagem enviada com sucesso');
      } else {
        console.log('⚠️ Mensagem processada via fallback');
      }
      
      // Scroll para o final após enviar
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      // Restaurar mensagem em caso de erro
      setMensagem(mensagemParaEnviar);
    }
  };

  const handleEnviarEmoji = async (emoji: string) => {
    if (!usuario || !salaId) return;

    try {
      console.log('😀 Enviando emoji:', emoji);
      await chatService.sendMessage(
        salaId,
        usuario.nome,
        emoji,
        'emoji',
        usuario.premium || false
      );
      setShowEmojis(false);
      console.log('✅ Emoji enviado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao enviar emoji:', error);
      alert('Erro ao enviar emoji. Tente novamente.');
    }
  };

  // NOVA FUNCIONALIDADE: Capturar vídeo com preview
  const handleStartVideoRecording = async () => {
    try {
      console.log('📹 Iniciando gravação de vídeo...');
      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);
      setShowMediaOptions(false);

      // Obter stream da câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      // Mostrar preview da câmera durante gravação
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      // Iniciar contador de tempo
      let timeCount = 0;
      recordingIntervalRef.current = setInterval(() => {
        timeCount++;
        setRecordingTime(timeCount);
        
        // Parar automaticamente aos 10 segundos
        if (timeCount >= 10) {
          clearInterval(recordingIntervalRef.current!);
          finalizarGravacao();
        }
      }, 1000);

      // Função para finalizar gravação
      const finalizarGravacao = async () => {
        try {
          MediaService.stopRecording();
          
          // Aguardar um pouco para garantir que o blob seja criado
          setTimeout(async () => {
            const videoBlob = await MediaService.getLastRecordedBlob();
            
            // Parar stream
            stream.getTracks().forEach(track => track.stop());
            
            // Reset states
            setIsRecording(false);
            setRecordingType(null);
            setRecordingTime(0);
            
            if (videoBlob && videoBlob.size > 0) {
              const url = MediaService.createTempUrl(videoBlob);
              setPreviewMedia({type: 'video', url, blob: videoBlob});
              setIsPreviewMode(true);
              console.log('✅ Vídeo capturado:', videoBlob.size, 'bytes');
            } else {
              console.error('❌ Blob inválido');
              alert('Erro ao processar vídeo. Tente novamente.');
            }
          }, 500);
          
        } catch (error) {
          console.error('❌ Erro ao finalizar:', error);
          alert('Erro ao processar vídeo. Tente novamente.');
        }
      };

      // Iniciar gravação no MediaService
      MediaService.startVideoRecording(stream);
      
    } catch (error) {
      console.error('❌ Erro ao capturar vídeo:', error);
      alert('Erro ao acessar câmera. Verifique as permissões do navegador.');
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // NOVA FUNCIONALIDADE: Gravar áudio com preview
  const handleStartAudioRecording = async () => {
    try {
      console.log('🎤 Iniciando gravação de áudio...');
      setIsRecording(true);
      setRecordingType('audio');
      setRecordingTime(0);
      setShowMediaOptions(false);

      // Iniciar contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Parar automaticamente aos 10 segundos
          if (newTime >= 10) {
            handleStopRecording();
          }
          return newTime;
        });
      }, 1000);

      // Gravar áudio
      const audioBlob = await MediaService.recordAudio(10);
      
      if (audioBlob) {
        const url = MediaService.createTempUrl(audioBlob);
        setPreviewMedia({type: 'audio', url, blob: audioBlob});
        setIsPreviewMode(true);
        console.log('✅ Áudio gravado com sucesso');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gravar áudio:', error);
      alert('Erro ao acessar microfone. Verifique as permissões do navegador.');
      setIsRecording(false);
      setRecordingType(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleStopRecording = async () => {
    console.log('⏹️ Parando gravação...');
    MediaService.stopRecording();
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    // Aguardar blob e criar preview
    setTimeout(async () => {
      const blob = await MediaService.getLastRecordedBlob();
      
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
      
      if (blob && blob.size > 0) {
        const url = MediaService.createTempUrl(blob);
        setPreviewMedia({type: recordingType || 'video', url, blob});
        setIsPreviewMode(true);
        console.log('✅ Preview criado:', blob.size, 'bytes');
      } else {
        console.error('❌ Erro ao obter blob');
        alert('Erro ao processar mídia. Tente novamente.');
      }
    }, 1000);
  };

  // NOVA FUNCIONALIDADE: Selecionar imagem com preview
  const handleSelectImage = async () => {
    try {
      console.log('📷 Selecionando imagem...');
      setShowMediaOptions(false);
      
      const file = await MediaService.selectImage();
      if (file) {
        console.log('✅ Imagem selecionada:', file.name);
        const url = MediaService.createTempUrl(file);
        setPreviewMedia({type: 'image', url, blob: file});
        setIsPreviewMode(true);
      } else {
        console.log('❌ Nenhuma imagem selecionada');
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar imagem:', error);
      alert('Erro ao selecionar imagem. Tente novamente.');
    }
  };

  // NOVA FUNCIONALIDADE: Enviar mídia após preview
  const handleSendMedia = async () => {
    if (!previewMedia || !usuario || !salaId) {
      console.error('❌ Dados faltando para envio:', { previewMedia, usuario, salaId });
      return;
    }

    if (!previewMedia.blob) {
      console.error('❌ Blob da mídia não encontrado');
      alert('Erro: mídia corrompida. Grave novamente.');
      return;
    }

    try {
      console.log('📤 Enviando mídia:', previewMedia.type, 'Tamanho:', previewMedia.blob.size);
      const base64 = await MediaService.blobToBase64(previewMedia.blob);
      
      const sucesso = await chatService.sendMessage(
        salaId,
        usuario.nome,
        base64,
        previewMedia.type === 'image' ? 'imagem' : previewMedia.type,
        usuario.premium || false,
        true, // Mensagem temporária
        10 // 10 segundos para todas as mídias
      );

      if (sucesso) {
        console.log('✅ Mídia enviada com sucesso!');
        // Limpar preview apenas se enviado com sucesso
        setIsPreviewMode(false);
        setPreviewMedia(null);
        setShowMediaOptions(false);
      } else {
        console.error('❌ Falha no envio da mídia');
        alert('Erro ao enviar mídia. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mídia:', error);
      alert(`Erro ao enviar mídia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // NOVA FUNCIONALIDADE: Cancelar preview
  const handleCancelPreview = () => {
    if (previewMedia?.url) {
      MediaService.revokeTempUrl(previewMedia.url);
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
      // Marcar que este usuário específico visualizou a mensagem
      const currentTime = Date.now();
      setViewedMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, currentTime);
        return newMap;
      });
      
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
    
    // Verificar se este usuário específico já visualizou a mensagem
    const viewedTime = viewedMessages.get(msg.id);
    
    if (viewedTime) {
      // Se o usuário já visualizou, verificar se passaram 10 segundos desde a visualização
      const currentTime = Date.now();
      const elapsedSeconds = (currentTime - viewedTime) / 1000;
      return elapsedSeconds > 10; // Expira após 10 segundos da visualização individual
    }
    
    // Se o usuário ainda não visualizou, a mensagem está disponível
    return false;
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

        {/* Hero Banner Section */}
        <div className="hero-banner-section">
          <img 
            src="/hero-banner.jpg" 
            alt="Banner 100 Matchs"
            onError={(e) => {
              // Se a imagem não carregar, mostra um fundo com as cores da foto original
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>
                CONECTE-SE AGORA!
              </h1>
              <p>
                Converse grátis com pessoas incríveis
              </p>
            </div>
          </div>
        </div>

        <div className="messages-container">
          {mensagens.length === 0 ? (
            <div className="empty-chat">
              <div className="welcome-message">
                <h3>Bem-vindo ao {nomeSala}!</h3>
                <p>Seja o primeiro a enviar uma mensagem 💬</p>
                <p>Use os botões abaixo para enviar fotos, vídeos, áudios e emojis!</p>
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
                      <MiniPerfilUsuario 
                        nomeUsuario={msg.user_name}
                        isPremium={msg.is_premium || false}
                      />
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
                                preload="metadata"
                                playsInline
                                muted={false}
                                style={{
                                  willChange: 'transform',
                                  backfaceVisibility: 'hidden',
                                  transform: 'translateZ(0)',
                                  WebkitTransform: 'translateZ(0)'
                                }}
                                onClick={() => {
                                  handleViewTemporaryMessage(msg.id);
                                }}
                                onLoadStart={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.playbackRate = 1.0;
                                }}
                                onLoadedMetadata={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.playbackRate = 1.0;
                                  video.defaultPlaybackRate = 1.0;
                                }}
                                onLoadedData={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.playbackRate = 1.0;
                                }}
                                onCanPlay={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.playbackRate = 1.0;
                                }}
                                onTimeUpdate={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  if (video.playbackRate !== 1.0) {
                                    video.playbackRate = 1.0;
                                  }
                                }}
                                onPlay={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.playbackRate = 1.0;
                                  handlePlayPause(msg.id, video);
                                }}
                                onPause={(e) => handlePlayPause(msg.id, e.target as HTMLVideoElement)}
                                onEnded={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  const container = video.closest('.video-container') as HTMLElement;
                                  if (container && msg.is_temporary) {
                                    container.style.opacity = '0.5';
                                    container.style.transition = 'opacity 0.5s ease';
                                    setTimeout(() => {
                                      container.style.display = 'none';
                                    }, 500);
                                  }
                                }}
                              >
                                <source src={msg.content} type="video/mp4" />
                                <source src={msg.content} type="video/webm" />
                                Seu navegador não suporta vídeo.
                              </video>
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
                              <audio 
                                controls 
                                preload="metadata"
                                style={{
                                  willChange: 'transform',
                                  backfaceVisibility: 'hidden'
                                }}
                                onClick={() => handleViewTemporaryMessage(msg.id)}
                                onLoadedMetadata={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  audio.playbackRate = 1.0;
                                  audio.defaultPlaybackRate = 1.0;
                                }}
                                onLoadedData={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  audio.playbackRate = 1.0;
                                }}
                                onCanPlay={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  audio.playbackRate = 1.0;
                                }}
                                onTimeUpdate={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  if (audio.playbackRate !== 1.0) {
                                    audio.playbackRate = 1.0;
                                  }
                                }}
                                onPlay={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  audio.playbackRate = 1.0;
                                  handlePlayPause(msg.id, audio);
                                }}
                                onPause={(e) => handlePlayPause(msg.id, e.target as HTMLAudioElement)}
                              >
                                <source src={msg.content} type="audio/mp4" />
                                <source src={msg.content} type="audio/webm" />
                                <source src={msg.content} type="audio/wav" />
                                Seu navegador não suporta áudio.
                              </audio>
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

        {/* Preview Modal */}
        {isPreviewMode && previewMedia && (
          <div className="media-preview-overlay">
            <div className="media-preview-container">
              <div className="preview-header">
                <h3>Prévia da {previewMedia.type === 'video' ? 'Gravação' : previewMedia.type === 'audio' ? 'Gravação de Áudio' : 'Imagem'}</h3>
                <button onClick={handleCancelPreview}>✕</button>
              </div>
              
              <div className="preview-content">
                {previewMedia.type === 'video' && (
                  <video 
                    controls 
                    autoPlay 
                    muted 
                    preload="auto"
                    playsInline
                    style={{
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)'
                    }}
                    src={previewMedia.url}
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.playbackRate = 1.0;
                      video.defaultPlaybackRate = 1.0;
                    }}
                    onLoadedData={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.playbackRate = 1.0;
                    }}
                    onCanPlay={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.playbackRate = 1.0;
                    }}
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      if (video.playbackRate !== 1.0) {
                        video.playbackRate = 1.0;
                      }
                    }}
                  />
                )}
                {previewMedia.type === 'audio' && (
                  <div className="audio-preview">
                    <audio 
                      controls 
                      autoPlay 
                      preload="auto"
                      style={{
                        willChange: 'transform',
                        backfaceVisibility: 'hidden'
                      }}
                      src={previewMedia.url}
                      onLoadedMetadata={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        audio.playbackRate = 1.0;
                        audio.defaultPlaybackRate = 1.0;
                      }}
                      onLoadedData={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        audio.playbackRate = 1.0;
                      }}
                      onCanPlay={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        audio.playbackRate = 1.0;
                      }}
                      onTimeUpdate={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        if (audio.playbackRate !== 1.0) {
                          audio.playbackRate = 1.0;
                        }
                      }}
                    />
                  </div>
                )}
                {previewMedia.type === 'image' && (
                  <img src={previewMedia.url} alt="Preview" />
                )}
              </div>
              
              <div className="preview-actions">
                <button className="cancel-button" onClick={handleCancelPreview}>
                  Cancelar
                </button>
                <button className="send-button" onClick={handleSendMedia}>
                  <FiSend />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recording Preview */}
        {isRecording && recordingType === 'video' && (
          <div className="video-recording-preview">
            <div className="recording-preview-container">
              <video 
                ref={videoPreviewRef} 
                className="camera-preview" 
                autoPlay 
                muted 
                playsInline
                style={{
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)'
                }}
              />
              <div className="recording-overlay">
                <div className="recording-info">
                  <div className="recording-dot"></div>
                  <span>Gravando... {formatRecordingTime(recordingTime)}</span>
                </div>
                <button 
                  className="stop-recording-btn"
                  onClick={handleStopRecording}
                >
                  <FiPause />
                  Parar ({10 - recordingTime}s)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio Recording Indicator */}
        {isRecording && recordingType === 'audio' && (
          <div className="recording-indicator">
            <div className="recording-content">
              <div className="recording-dot"></div>
              <span className="recording-time">
                Gravando áudio... {formatRecordingTime(recordingTime)}
              </span>
              <button className="stop-button" onClick={handleStopRecording}>
                <FiMicOff />
                Parar ({10 - recordingTime}s)
              </button>
            </div>
          </div>
        )}

        {/* Emoji Panel */}
        {showEmojis && (
          <div className="emoji-panel">
            <div className="emoji-categories">
              {Object.keys(EMOJI_CATEGORIES).map(category => (
                <button
                  key={category}
                  className={selectedEmojiCategory === category ? 'active' : ''}
                  onClick={() => setSelectedEmojiCategory(category)}
                >
                  {EMOJI_CATEGORIES[category as keyof typeof EMOJI_CATEGORIES][0]}
                </button>
              ))}
            </div>
            <div className="emoji-grid">
              {EMOJI_CATEGORIES[selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES]?.map((emoji: string, index: number) => (
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

        {/* Media Options Panel */}
        {showMediaOptions && (
          <div className="media-options-panel">
            <div className="media-options-grid">
              <button 
                className="media-option" 
                onClick={handleSelectImage}
                disabled={!mediaPermissions.camera}
              >
                <FiImage />
                <span>Foto</span>
              </button>
              <button 
                className="media-option" 
                onClick={handleStartVideoRecording}
                disabled={!mediaPermissions.camera}
              >
                <FiVideo />
                <span>Vídeo</span>
              </button>
              <button 
                className="media-option" 
                onClick={handleStartAudioRecording}
                disabled={!mediaPermissions.microphone}
              >
                <FiMic />
                <span>Áudio</span>
              </button>
            </div>
            {(!mediaPermissions.camera || !mediaPermissions.microphone) && (
              <div className="media-not-supported">
                <p>Algumas funcionalidades podem não estar disponíveis.</p>
                <p>Verifique as permissões do navegador.</p>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <div className="media-buttons">
            <button 
              className={`media-toggle ${showMediaOptions ? 'active' : ''}`}
              onClick={() => setShowMediaOptions(!showMediaOptions)}
            >
              <FiCamera />
            </button>
            <button 
              className={`emoji-toggle ${showEmojis ? 'active' : ''}`}
              onClick={() => setShowEmojis(!showEmojis)}
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
            className="send-button"
            onClick={handleEnviarMensagem}
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