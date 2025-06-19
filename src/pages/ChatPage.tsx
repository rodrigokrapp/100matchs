import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiVideo, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck, FiEye, FiPlay, FiPause,
  FiMicOff
} from 'react-icons/fi';
import { MdGif } from 'react-icons/md';
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
      console.log('🎥 Iniciando gravação de vídeo...');
      
      // Iniciar gravação imediatamente sem contagem regressiva
      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);
      setShowMediaOptions(false);

      // Iniciar gravação real imediatamente
      startActualVideoRecording();
      
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação de vídeo:', error);
      alert('Erro ao acessar câmera. Verifique as permissões do navegador.');
      setIsRecording(false);
      setRecordingType(null);
    }
  };

  const startActualVideoRecording = async () => {
    try {
      console.log('🎥 Iniciando gravação real...');
      
      // Resetar contador para gravação de 10 segundos
      setRecordingTime(0);
      
      // Iniciar contador de tempo da gravação
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

      // Gravar vídeo
      const videoBlob = await MediaService.captureVideo(10);
      
      if (videoBlob) {
        const url = MediaService.createTempUrl(videoBlob);
        setPreviewMedia({type: 'video', url, blob: videoBlob});
        setIsPreviewMode(true);
        console.log('✅ Vídeo gravado com sucesso');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gravar vídeo:', error);
      alert('Erro ao acessar câmera. Verifique as permissões do navegador.');
      setIsRecording(false);
      setRecordingType(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
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

  const handleStartGifRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);
      
      // Obter stream da câmera primeiro
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      
      // Iniciar gravação com o stream
      MediaService.startVideoRecording(stream);
      
      // Timer para 5 segundos
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 4) { // 5 segundos (0-4)
            handleStopGifRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação de GIF:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
      setIsRecording(false);
      setRecordingType(null);
    }
  };

  const handleStopGifRecording = async () => {
    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Parar gravação
      MediaService.stopRecording();
      
      // Aguardar um pouco e obter o blob
      setTimeout(async () => {
        const videoBlob = await MediaService.getLastRecordedBlob();
        
        if (videoBlob && usuario) {
          // Enviar automaticamente o GIF
          const videoUrl = URL.createObjectURL(videoBlob);
          
          await chatService.sendMessage(
            salaId || 'default',
            usuario.nome,
            videoUrl,
            'video',
            true // temporário
          );
          
          // Limpar URL após 30 segundos
          setTimeout(() => {
            URL.revokeObjectURL(videoUrl);
          }, 30000);
        }
        
        setIsRecording(false);
        setRecordingType(null);
        setRecordingTime(0);
        setShowMediaOptions(false);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao parar gravação de GIF:', error);
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
    }
  };

  // MELHORADA: Função para manusear vídeos temporários com auto-exclusão
  const handleTemporaryVideoClick = async (messageId: string, videoElement: HTMLVideoElement) => {
    if (usuario?.nome) {
      // Marcar que este usuário específico visualizou a mensagem
      const currentTime = Date.now();
      setViewedMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, currentTime);
        return newMap;
      });
      
      await chatService.markTemporaryMessageViewed(messageId, usuario.nome);
      
      // Auto play o vídeo
      videoElement.play();
      
      // Configurar exclusão automática após 10 segundos
      setTimeout(() => {
        const container = videoElement.closest('.video-container') as HTMLElement;
        if (container) {
          container.style.transition = 'all 0.5s ease';
          container.style.opacity = '0';
          container.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            container.style.display = 'none';
          }, 500);
        }
      }, 10000); // 10 segundos
    }
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
              <span>{usuariosOnline} pessoas online</span>
              <div className={`connection-status ${isConnected ? 'connected' : ''}`}></div>
            </div>
          </div>
          {!usuario?.premium && (
            <button className="upgrade-button" onClick={handleUpgradePremium}>
              <FiStar />
              Seja Premium
            </button>
          )}
        </div>

        {/* Hero Banner Section */}
        <div className="hero-banner-section">
          <img 
            src="/banner-converse-sem-match.jpg" 
            alt="Converse Sem Match"
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
                                preload="auto"
                                playsInline
                                muted={false}
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                }}
                                onLoadedMetadata={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.playbackRate = 1.0;
                                  video.volume = 0.9;
                                  console.log('🎥 Vídeo carregado:', video.duration);
                                }}
                                onCanPlayThrough={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  console.log('🎥 Vídeo pronto para reprodução');
                                }}
                                onClick={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  
                                  // Melhorar qualidade visual com animação suave
                                  video.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                                  video.style.filter = 'contrast(1.1) saturate(1.08) brightness(1.03)';
                                  video.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                                  video.style.transform = 'scale(1.02) translateZ(0)';
                                  
                                  handleViewTemporaryMessage(msg.id);
                                  
                                  // Se é temporário, iniciar reprodução fluida e exclusão
                                  if (msg.is_temporary) {
                                    // Reprodução mais fluida e otimizada
                                    video.playbackRate = 1.0;
                                    video.volume = 0.8;
                                    video.currentTime = 0; // Começar do início
                                    
                                    const playPromise = video.play();
                                    if (playPromise !== undefined) {
                                      playPromise.catch(error => {
                                        console.log('Erro ao reproduzir vídeo:', error);
                                      });
                                    }
                                    
                                    // Indicador visual de tempo restante
                                    const container = video.closest('.video-container') as HTMLElement;
                                    if (container) {
                                      // Remover barra de progresso anterior se existir
                                      const existingBar = container.querySelector('.countdown-bar');
                                      if (existingBar) existingBar.remove();
                                      
                                      // Adicionar barra de progresso
                                      const progressBar = document.createElement('div');
                                      progressBar.className = 'countdown-bar';
                                      progressBar.style.cssText = `
                                        position: absolute;
                                        bottom: 0;
                                        left: 0;
                                        height: 4px;
                                        background: linear-gradient(90deg, #ff4081, #f44336);
                                        width: 100%;
                                        border-radius: 0 0 10px 10px;
                                        transform-origin: left;
                                        animation: countdown 10s linear forwards;
                                        z-index: 10;
                                      `;
                                      
                                      // Adicionar keyframe para animação
                                      if (!document.querySelector('#countdown-keyframe')) {
                                        const style = document.createElement('style');
                                        style.id = 'countdown-keyframe';
                                        style.textContent = `
                                          @keyframes countdown {
                                            from { transform: scaleX(1); opacity: 0.9; }
                                            to { transform: scaleX(0); opacity: 0.5; }
                                          }
                                        `;
                                        document.head.appendChild(style);
                                      }
                                      
                                      container.style.position = 'relative';
                                      container.appendChild(progressBar);
                                    }
                                    
                                    // Configurar exclusão automática após 10 segundos
                                    setTimeout(() => {
                                      if (container) {
                                        container.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                        container.style.opacity = '0';
                                        container.style.transform = 'scale(0.85) translateY(-20px) rotateX(5deg)';
                                        container.style.filter = 'blur(3px)';
                                        
                                        setTimeout(() => {
                                          container.style.display = 'none';
                                        }, 1000);
                                      }
                                    }, 10000); // 10 segundos
                                  }
                                }}
                                onPlay={(e) => {
                                  handlePlayPause(msg.id, e.target as HTMLVideoElement);
                                }}
                                onPause={(e) => handlePlayPause(msg.id, e.target as HTMLVideoElement)}
                                onLoadStart={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.style.opacity = '0.7';
                                }}
                                onCanPlay={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.style.opacity = '1';
                                }}
                                onEnded={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  if (msg.is_temporary) {
                                    const container = video.closest('.video-container') as HTMLElement;
                                    if (container) {
                                      container.style.opacity = '0.5';
                                      container.style.transition = 'opacity 0.5s ease';
                                      setTimeout(() => {
                                        container.style.display = 'none';
                                      }, 500);
                                    }
                                  }
                                }}
                              >
                                <source src={msg.content} type="video/webm" />
                                <source src={msg.content} type="video/mp4" />
                                Seu navegador não suporta vídeo.
                              </video>
                              {msg.is_temporary && (
                                <div className="video-temp-indicator">
                                  <FiClock />
                                  <span>Clique para assistir - Desaparece em 10s</span>
                                </div>
                              )}
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
                                preload="auto"
                                style={{
                                  width: '100%',
                                  height: '50px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  borderRadius: '8px',
                                  outline: 'none'
                                }}
                                src={msg.content}
                                onClick={() => handleViewTemporaryMessage(msg.id)}
                                onLoadedMetadata={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  audio.volume = 1.0;
                                  console.log('🔊 Áudio carregado:', audio.duration);
                                }}
                                onCanPlayThrough={(e) => {
                                  const audio = e.target as HTMLAudioElement;
                                  console.log('🔊 Áudio pronto para reprodução');
                                }}
                                onPlay={(e) => {
                                  console.log('▶️ Reproduzindo áudio');
                                  handlePlayPause(msg.id, e.target as HTMLAudioElement);
                                }}
                                onPause={(e) => {
                                  console.log('⏸️ Pausando áudio');
                                  handlePlayPause(msg.id, e.target as HTMLAudioElement);
                                }}
                                onError={(e) => {
                                  console.error('❌ Erro no áudio:', e);
                                }}
                              >
                                <source src={msg.content} type="audio/webm" />
                                <source src={msg.content} type="audio/mp4" />
                                <source src={msg.content} type="audio/wav" />
                                <source src={msg.content} type="audio/ogg" />
                                Seu navegador não suporta áudio.
                              </audio>
                              {msg.is_temporary && (
                                <div className="audio-temp-indicator">
                                  <span>🔊 Áudio temporário - Clique para ouvir</span>
                                </div>
                              )}
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
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '10px'
                    }}
                    src={previewMedia.url}
                  />
                )}
                {previewMedia.type === 'audio' && (
                  <div className="audio-preview">
                    <audio 
                      controls 
                      preload="metadata"
                      style={{
                        width: '100%',
                        height: '40px'
                      }}
                      src={previewMedia.url}
                      onLoadedMetadata={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        audio.playbackRate = 1.0;
                        audio.volume = 1.0;
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
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '10px'
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
                  Parar ({Math.max(0, 10 - recordingTime)}s)
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
              {EMOJI_CATEGORIES[selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES]?.slice(1).map((emoji, index) => (
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
                onClick={handleStartGifRecording}
                disabled={!mediaPermissions.camera}
              >
                <MdGif />
                <span>GIF 5s</span>
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
                <p>⚠️ Permissões de mídia necessárias</p>
                <p>Ative câmera e microfone para usar todas as funções</p>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <div className="media-buttons">
            <button 
              className="media-toggle"
              onClick={handleSelectImage}
              title="Selecionar foto"
            >
              <FiImage />
            </button>
            <button 
              className="media-toggle"
              onClick={handleStartVideoRecording}
              title="Gravar vídeo"
            >
              <FiVideo />
            </button>
            <button 
              className="media-toggle"
              onClick={handleStartAudioRecording}
              title="Gravar áudio"
            >
              <FiMic />
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