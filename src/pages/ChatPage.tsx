import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck, FiEye, FiPlay, FiPause,
  FiMicOff, FiCamera, FiFolder, FiUser, FiX, FiHeart, FiMapPin
} from 'react-icons/fi';
import { MdGif } from 'react-icons/md';
import { chatService, ChatMessage } from '../lib/chatService';
import MediaService, { EMOJI_CATEGORIES } from '../lib/mediaService';
import { testChatConnection, supabase } from '../lib/supabase';
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
  const [viewedMessages, setViewedMessages] = useState<Map<string, number>>(new Map()); // messageId -> timestamp quando foi visualizado
  const [videosVisualizados, setVideosVisualizados] = useState<Set<string>>(new Set()); // IDs dos vídeos já visualizados
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const [showUserSim, setShowUserSim] = useState(false);
  
  // Estados para lista lateral de usuários
  const [usuariosOnlineList, setUsuariosOnlineList] = useState<string[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
    // Verificar autenticação - incluir usuários gratuitos e visitantes
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    const usuarioChat = localStorage.getItem('usuarioChat');
    const visitante = localStorage.getItem('visitante');
    
    if (usuarioPremium) {
      const user = JSON.parse(usuarioPremium);
      setUsuario({ ...user, tipo: 'premium' });
    } else if (usuarioChat) {
      const userChat = JSON.parse(usuarioChat);
      
      // Verificar se o tempo de 15 minutos ainda é válido
      const agora = new Date().getTime();
      const tempoDecorrido = agora - userChat.inicioSessao;
      
      if (tempoDecorrido > userChat.limiteTempo) {
        // Tempo expirado, fazer logout automático
        localStorage.removeItem('usuarioChat');
        localStorage.removeItem(`acesso_${userChat.email}`);
        alert('Seu tempo de acesso de 15 minutos expirou. Faça login novamente.');
        navigate('/inicio');
        return;
      }
      
      setUsuario({ ...userChat, tipo: 'chat' });
    } else if (visitante) {
      const userVisitante = JSON.parse(visitante);
      
      // Verificar se o tempo de 5 minutos ainda é válido
      const agora = new Date().getTime();
      const tempoDecorrido = agora - userVisitante.inicioSessao;
      
      if (tempoDecorrido > userVisitante.limiteTempo) {
        // Tempo expirado, remover visitante
        localStorage.removeItem('visitante');
        alert('Seu tempo de acesso como visitante expirou.');
        navigate('/inicio');
        return;
      }
      
      setUsuario({ ...userVisitante, tipo: 'visitante' });
    } else {
      console.log('❌ Usuário não autenticado, redirecionando para início');
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

    // SISTEMA AVANÇADO DE RECEPÇÃO DE MENSAGENS
    // Listener para eventos customizados
    const handleChatMessageSent = (event: CustomEvent) => {
      const { message, roomId } = event.detail;
      if (roomId === salaId) {
        console.log('📥 Mensagem recebida via evento customizado:', message);
        setMensagens(prev => {
          const exists = prev.some(msg => msg.id === message.id);
          if (!exists) {
            return [...prev, message].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          }
          return prev;
        });
      }
    };

    // Listener para mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'lastChatMessage' && event.newValue) {
        try {
          const { message, roomId } = JSON.parse(event.newValue);
          if (roomId === salaId) {
            console.log('📥 Mensagem recebida via localStorage:', message);
            setMensagens(prev => {
              const exists = prev.some(msg => msg.id === message.id);
              if (!exists) {
                return [...prev, message].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('❌ Erro ao processar mensagem do storage:', error);
        }
      }
    };

    // POLLING de segurança - verifica mensagens a cada 3 segundos
    const messagePolling = setInterval(() => {
      if (salaId) {
        const chatKey = `chat_${salaId}`;
        const storedMessages = localStorage.getItem(chatKey);
        if (storedMessages) {
          try {
            const messages = JSON.parse(storedMessages) as ChatMessage[];
            setMensagens(prev => {
              // Verificar se há mensagens novas
              const newMessages = messages.filter(msg => 
                !prev.some(existingMsg => existingMsg.id === msg.id)
              );
              
              if (newMessages.length > 0) {
                console.log('🔄 Mensagens encontradas via polling:', newMessages.length);
                return [...prev, ...newMessages].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              }
              return prev;
            });
          } catch (error) {
            console.error('❌ Erro no polling de mensagens:', error);
          }
        }
      }
    }, 3000); // A cada 3 segundos

    window.addEventListener('local-message', handleLocalMessage);
    window.addEventListener('chatMessageSent' as any, handleChatMessageSent);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup ao sair da página
    return () => {
      chatService.leaveRoom();
      clearInterval(messagePolling);
      window.removeEventListener('local-message', handleLocalMessage);
      window.removeEventListener('chatMessageSent' as any, handleChatMessageSent);
      window.removeEventListener('storage', handleStorageChange);
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
      
      // SISTEMA REAL DE USUÁRIOS - sem números robóticos
      await setupRealUserCount(salaId);
      
      // Limpar mensagens expiradas periodicamente
      const cleanupInterval = setInterval(async () => {
        if (salaId) {
          await chatService.cleanExpiredMessages(salaId);
          setMensagens(prev => chatService.filterValidMessages(prev));
        }
      }, 30000); // A cada 30 segundos
      
      // Cleanup ao desmontar
      return () => {
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
    if (!checkPremiumAccess('Emoticons e Figurinhas')) return;
    
    if (!salaId || !usuario) return;

    try {
      console.log('😊 Enviando emoji:', emoji);
      const sucesso = await chatService.sendMessage(
        salaId,
        usuario.nome,
        emoji,
        'texto',
        usuario.premium || false
      );

      if (sucesso) {
        console.log('✅ Emoji enviado!');
        setShowEmojis(false); // Fechar painel após enviar
      }
    } catch (error) {
      console.error('❌ Erro ao enviar emoji:', error);
      alert('Erro ao enviar emoji. Tente novamente.');
    }
  };

  // NOVA FUNCIONALIDADE: Capturar vídeo com preview
  const handleStartVideoRecording = async () => {
    try {
      console.log('🎥 Iniciando gravação de vídeo...');
      
      // Verificar permissões primeiro
      if (!mediaPermissions.camera) {
        const permission = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        if (permission) {
          setMediaPermissions(prev => ({ ...prev, camera: true }));
        }
      }

      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);
      setShowMediaOptions(false);
      setShowEmojis(false);

      // Iniciar contador de tempo (sem limitação)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Começar gravação com prévia ao vivo
      await startActualVideoRecording();
      
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

  const startActualVideoRecording = async () => {
    try {
      console.log('🎥 Iniciando gravação real com prévia...');
      
      // Obter stream da câmera para prévia
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Mostrar prévia no elemento de vídeo
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      // Iniciar gravação
      MediaService.startVideoRecording(stream);
      
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      throw error;
    }
  };

  // NOVA FUNCIONALIDADE: Gravar áudio com preview otimizado
  const handleStartAudioRecording = async () => {
    if (!checkPremiumAccess('Gravação de Áudio')) return;
    
    try {
      console.log('🎤 Iniciando gravação de áudio...');
      
      // Verificar permissões primeiro
      if (!mediaPermissions.microphone) {
        const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (permission) {
          setMediaPermissions(prev => ({ ...prev, microphone: true }));
        }
      }

      setIsRecording(true);
      setRecordingType('audio');
      setRecordingTime(0);
      setShowMediaOptions(false);
      setShowEmojis(false);

      // Iniciar contador de tempo (sem limitação)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Começar gravação imediatamente
      MediaService.startAudioRecording();

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
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    try {
      // Parar gravação e obter blob imediatamente
      const blob = await MediaService.stopAndGetBlob();
      
      setIsRecording(false);
      const currentRecordingType = recordingType;
      setRecordingType(null);
      setRecordingTime(0);
      
      if (blob && blob.size > 0) {
        const url = MediaService.createTempUrl(blob);
        setPreviewMedia({type: currentRecordingType || 'audio', url, blob});
        setIsPreviewMode(true);
        console.log('✅ Preview criado:', blob.size, 'bytes');
      } else {
        console.error('❌ Erro ao obter blob da gravação');
        alert('Erro ao processar gravação. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
      alert('Erro ao finalizar gravação. Tente novamente.');
    }
  };

  // Verificar se usuário é premium
  const isPremiumUser = () => {
    // Se veio do localStorage 'usuarioPremium', é premium
    const usuarioPremium = localStorage.getItem('usuarioPremium');
    if (usuarioPremium) {
      return true;
    }
    
    // Se veio do localStorage 'usuarioChat' (entrar chat), é gratuito
    const usuarioChat = localStorage.getItem('usuarioChat');
    if (usuarioChat) {
      return false; // Usuários do "Entrar Chat" são SEMPRE gratuitos
    }
    
    // Verificar propriedade premium do objeto usuario
    return usuario?.premium === true;
  };

  // Função para verificar premium e bloquear se necessário
  const checkPremiumAccess = (feature: string) => {
    if (!isPremiumUser()) {
      alert(`🔒 Funcionalidade ${feature} disponível apenas para usuários Premium!\n\nFaça upgrade para acessar todas as funcionalidades.`);
      return false;
    }
    return true;
  };

  // NOVA FUNCIONALIDADE: Tirar foto com câmera (APENAS PREMIUM)
  const handleTakePhoto = async () => {
    if (!checkPremiumAccess('Câmera')) return;
    
    try {
      console.log('📸 Abrindo câmera para tirar foto...');
      setShowMediaOptions(false);
      
      // Tentar usar câmera diretamente
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, // Câmera frontal (selfie)
        audio: false 
      });
      
      // Criar preview da câmera
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.style.position = 'fixed';
      video.style.top = '50%';
      video.style.left = '50%';
      video.style.transform = 'translate(-50%, -50%)';
      video.style.zIndex = '9999';
      video.style.border = '3px solid #be185d';
      video.style.borderRadius = '10px';
      video.style.width = '300px';
      video.style.height = '225px';
      
      // Criar botão para capturar
      const captureBtn = document.createElement('button');
      captureBtn.textContent = '📸 CAPTURAR FOTO';
      captureBtn.style.position = 'fixed';
      captureBtn.style.top = '70%';
      captureBtn.style.left = '50%';
      captureBtn.style.transform = 'translateX(-50%)';
      captureBtn.style.zIndex = '10000';
      captureBtn.style.padding = '10px 20px';
      captureBtn.style.fontSize = '16px';
      captureBtn.style.backgroundColor = '#be185d';
      captureBtn.style.color = 'white';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '5px';
      captureBtn.style.cursor = 'pointer';
      
      // Criar botão para fechar
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '❌ FECHAR';
      closeBtn.style.position = 'fixed';
      closeBtn.style.top = '75%';
      closeBtn.style.left = '50%';
      closeBtn.style.transform = 'translateX(-50%)';
      closeBtn.style.zIndex = '10000';
      closeBtn.style.padding = '10px 20px';
      closeBtn.style.fontSize = '14px';
      closeBtn.style.backgroundColor = '#666';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '5px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.marginTop = '10px';
      
      document.body.appendChild(video);
      document.body.appendChild(captureBtn);
      document.body.appendChild(closeBtn);
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        try {
          document.body.removeChild(video);
          document.body.removeChild(captureBtn);
          document.body.removeChild(closeBtn);
        } catch (e) {
          console.log('Elementos já removidos');
        }
      };
      
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setPreviewMedia({type: 'image', url, blob});
              setIsPreviewMode(true);
              console.log('✅ Foto capturada com câmera');
            }
          }, 'image/jpeg', 0.9);
        }
        
        cleanup();
      };
      
      closeBtn.onclick = cleanup;
      
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera. Verifique as permissões do navegador.');
    }
  };

  // NOVA FUNCIONALIDADE: Selecionar da galeria (APENAS PREMIUM)
  const handleSelectFromGallery = async () => {
    if (!checkPremiumAccess('Galeria')) return;
    
    try {
      console.log('📁 Abrindo galeria para selecionar foto...');
      setShowMediaOptions(false);
      
      const file = await MediaService.selectImage();
      if (file) {
        console.log('✅ Imagem selecionada da galeria:', file.name);
        const url = MediaService.createTempUrl(file);
        setPreviewMedia({type: 'image', url, blob: file});
        setIsPreviewMode(true);
      } else {
        console.log('❌ Nenhuma imagem selecionada');
      }
      
    } catch (error) {
      console.error('❌ Erro ao selecionar da galeria:', error);
      alert('Erro ao acessar galeria. Tente novamente.');
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
        300 // 5 minutos de visualização temporária
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
    // Simplesmente pausa outros elementos para não sobrecarregar
    const otherMediaElements = document.querySelectorAll('video, audio');
    otherMediaElements.forEach((el) => {
      const mediaElement = el as HTMLMediaElement;
      if (mediaElement !== element && !mediaElement.paused) {
        mediaElement.pause();
      }
    });
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

  // Sistema real de contagem de usuários - sem robôs
  const setupRealUserCount = async (salaId: string) => {
    try {
      // Registrar presença do usuário atual
      const userSession = {
        sala_id: salaId,
        user_name: usuario?.nome || 'Anônimo',
        last_seen: new Date().toISOString()
      };
      
      // Salvar no localStorage para comunicação entre abas
      localStorage.setItem(`user_presence_${salaId}`, JSON.stringify(userSession));
      
      // Contar usuários reais ativos (últimos 5 minutos)
      const countRealUsers = () => {
        const now = new Date().getTime();
        let activeUsers = 0;
        
        // Verificar localStorage para usuários na mesma aba/máquina
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`user_presence_${salaId}`)) {
            try {
              const session = JSON.parse(localStorage.getItem(key) || '{}');
              const lastSeen = new Date(session.last_seen).getTime();
              
              // Se visto nos últimos 5 minutos, contar como ativo
              if (now - lastSeen < 300000) { // 5 minutos
                activeUsers++;
              }
            } catch (e) {
              // Ignorar sessões inválidas
            }
          }
        }
        
        // Minimum 1 usuário (você)
        activeUsers = Math.max(1, activeUsers);
        
        console.log('👥 Usuários reais detectados:', activeUsers);
        setUsuariosOnline(activeUsers);
        
        return activeUsers;
      };
      
      // Contagem inicial
      countRealUsers();
      
      // Atualizar presença a cada minuto
      const presenceInterval = setInterval(() => {
        // Atualizar sua presença
        const updatedSession = {
          ...userSession,
          last_seen: new Date().toISOString()
        };
        localStorage.setItem(`user_presence_${salaId}`, JSON.stringify(updatedSession));
        
        // Recontar usuários
        countRealUsers();
      }, 60000); // A cada 1 minuto
      
      // Limpar presença antiga a cada 5 minutos
      const cleanupInterval = setInterval(() => {
        const now = new Date().getTime();
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('user_presence_')) {
            try {
              const session = JSON.parse(localStorage.getItem(key) || '{}');
              const lastSeen = new Date(session.last_seen).getTime();
              
              // Remover sessões antigas (mais de 10 minutos)
              if (now - lastSeen > 600000) {
                keysToRemove.push(key);
              }
            } catch (e) {
              keysToRemove.push(key);
            }
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        countRealUsers();
      }, 300000); // A cada 5 minutos
      
      // Cleanup
      return () => {
        clearInterval(presenceInterval);
        clearInterval(cleanupInterval);
      };
      
    } catch (error) {
      console.error('❌ Erro ao configurar contagem real de usuários:', error);
      setUsuariosOnline(1); // Fallback para 1 usuário
    }
  };

  // Funções auxiliares para dados dos usuários
  const getUserAge = (userName: string): number => {
    const userAgesData: { [key: string]: number } = {
      'rodrigo': 28,
      'joana': 25,
      'carlos': 30
    };
    
    return userAgesData[userName.toLowerCase()] || 25;
  };

  const getUserLocation = (userName: string): string => {
    const userLocationsData: { [key: string]: string } = {
      'rodrigo': 'São Paulo, SP',
      'joana': 'Rio de Janeiro, RJ',
      'carlos': 'Belo Horizonte, MG'
    };
    
    return userLocationsData[userName.toLowerCase()] || 'Brasil';
  };

  const getUserProfession = (userName: string): string => {
    const userProfessionsData: { [key: string]: string } = {
      'rodrigo': 'Desenvolvedor Full Stack',
      'joana': 'UX/UI Designer',
      'carlos': 'Engenheiro Ambiental'
    };
    
    return userProfessionsData[userName.toLowerCase()] || 'Profissional';
  };

  const getUserInterests = (userName: string): string[] => {
    const interests = ['Conversas', 'Amizades', 'Música', 'Filmes', 'Viagens', 'Esportes', 'Arte', 'Culinária'];
    return interests.slice(0, Math.floor(Math.random() * 4) + 2);
  };

  const handleStartGifRecording = async () => {
    if (!isPremiumUser()) {
      alert('🔒 Recurso Premium! Faça upgrade para gravar vídeos.');
      return;
    }
    
    try {
      // Obter stream primeiro
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 24 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      
      // Iniciar gravação com o stream
      MediaService.startVideoRecording(stream);
      setIsRecording(true);
      setRecordingType('video');
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('🎬 Gravação iniciada');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar câmera');
    }
  };

  const handleStopGifRecording = async () => {
    try {
      // Parar gravação
      MediaService.stopRecording();
      
      // Aguardar um pouco para garantir que a gravação parou
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obter o blob gravado
      const videoBlob = await MediaService.getLastRecordedBlob();
      
      setIsRecording(false);
      setRecordingType(null);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      if (videoBlob) {
        const videoUrl = URL.createObjectURL(videoBlob);
        setPreviewMedia({
          type: 'video',
          url: videoUrl,
          blob: videoBlob
        });
        setIsPreviewMode(true);
        console.log('✅ Vídeo gravado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      alert('Erro ao finalizar gravação');
    }
  };

  // Função para atualizar lista de usuários online
  const atualizarUsuariosOnline = () => {
    const usuariosUnicos = Array.from(new Set(mensagens.map(msg => msg.user_name)));
    setUsuariosOnlineList(usuariosUnicos.filter(nome => nome !== usuario?.nome));
  };

  // Atualizar lista quando mensagens mudarem
  useEffect(() => {
    atualizarUsuariosOnline();
  }, [mensagens, usuario]);

  // Função para carregar dados do usuário selecionado
  const carregarDadosUsuario = async (nomeUsuario: string) => {
    try {
      console.log('🔍 Carregando dados do usuário:', nomeUsuario);
      
      let { data: perfilData } = await supabase
        .from('perfis')
        .select('*')
        .eq('nome', nomeUsuario)
        .maybeSingle();

      const dadosUsuario = {
        nome: nomeUsuario,
        isPremium: Math.random() > 0.5, // Simulação
        fotos: perfilData?.fotos?.filter((foto: string) => foto !== '') || [],
        descricao: perfilData?.descricao || 'Usuário da plataforma 100matchs.',
        idade: perfilData?.idade || Math.floor(Math.random() * 20) + 20,
        localizacao: perfilData?.localizacao || 'Brasil',
        profissao: perfilData?.profissao || 'Usuário',
        interesses: perfilData?.interesses || ['Conversas', 'Amizades'],
        fotoPrincipal: perfilData?.foto_principal || 0
      };

      return dadosUsuario;
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      return {
        nome: nomeUsuario,
        isPremium: false,
        fotos: [],
        descricao: 'Usuário da plataforma 100matchs.',
        idade: 25,
        localizacao: 'Brasil',
        profissao: 'Usuário',
        interesses: ['Conversas', 'Amizades'],
        fotoPrincipal: 0
      };
    }
  };

  // Função para abrir modal de perfil
  const handleUsuarioClick = async (nomeUsuario: string) => {
    console.log('🖱️ Clique no usuário:', nomeUsuario);
    const dadosUsuario = await carregarDadosUsuario(nomeUsuario);
    setUsuarioSelecionado(dadosUsuario);
    setCurrentPhotoIndex(dadosUsuario.fotoPrincipal || 0);
    setShowPerfilModal(true);
  };

  // Função para fechar modal
  const handleClosePerfilModal = () => {
    setShowPerfilModal(false);
    setUsuarioSelecionado(null);
    setCurrentPhotoIndex(0);
  };

  // Navegação de fotos no modal
  const nextPhoto = () => {
    if (usuarioSelecionado && usuarioSelecionado.fotos && usuarioSelecionado.fotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % usuarioSelecionado.fotos.length);
    }
  };

  const prevPhoto = () => {
    if (usuarioSelecionado && usuarioSelecionado.fotos && usuarioSelecionado.fotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + usuarioSelecionado.fotos.length) % usuarioSelecionado.fotos.length);
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
                      <span className="sender">
                        {msg.user_name}
                        {msg.is_premium && <FiStar className="premium-icon" />}
                      </span>
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
                          {isExpired || videosVisualizados.has(msg.id) ? (
                            <div className="expired-media">
                              <FiEye />
                              <span>{videosVisualizados.has(msg.id) ? 'Vídeo já visualizado' : 'Vídeo expirado'}</span>
                            </div>
                          ) : (
                            <div className="video-container">
                              <div className="simple-media-player">
                                <video 
                                  key={msg.id}
                                  preload="auto"
                                  playsInline
                                  controls
                                  style={{
                                    width: '100%',
                                    maxWidth: '300px',
                                    borderRadius: '12px',
                                    backgroundColor: '#000',
                                    display: 'block'
                                  }}
                                  src={msg.content}
                                  onEnded={() => {
                                    console.log('✅ Vídeo finalizado, marcando como visualizado:', msg.id);
                                    setVideosVisualizados(prev => new Set([...prev, msg.id]));
                                  }}
                                >
                                  <source src={msg.content} type="video/webm" />
                                  <source src={msg.content} type="video/mp4" />
                                  <source src={msg.content} type="video/mov" />
                                  <source src={msg.content} type="video/quicktime" />
                                  Seu navegador não suporta reprodução de vídeo.
                                </video>
                              </div>
                              {msg.is_temporary && (
                                <div className="video-temp-indicator">
                                  <span>📹 Vídeo temporário (visualização única)</span>
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
                              <div className="simple-media-player">
                              <audio 
                                  ref={(el) => {
                                    if (el) {
                                      el.setAttribute('data-message-id', msg.id);
                                    }
                                  }}
                                  preload="metadata"
                                  style={{ display: 'none' }}
                                src={msg.content}
                                  controls
                              >
                                <source src={msg.content} type="audio/webm" />
                                <source src={msg.content} type="audio/mp4" />
                                <source src={msg.content} type="audio/wav" />
                                <source src={msg.content} type="audio/ogg" />
                              </audio>
                                <button 
                                  className="big-play-button audio-button"
                                  onClick={() => {
                                    const audio = document.querySelector(`audio[data-message-id="${msg.id}"]`) as HTMLAudioElement;
                                    if (audio) {
                                      // Parar outros áudios
                                      document.querySelectorAll('audio').forEach(a => {
                                        if (a !== audio) a.pause();
                                      });
                                      
                                      // Mostrar controles e reproduzir
                                      audio.style.display = 'block';
                                      audio.controls = true;
                                      audio.play();
                                      
                                      // Esconder o botão após clicar
                                      const button = document.querySelector(`button[data-audio-id="${msg.id}"]`) as HTMLButtonElement;
                                      if (button) {
                                        button.style.display = 'none';
                                      }
                                    }
                                  }}
                                  data-audio-id={msg.id}
                                >
                                  <FiPlay size={30} />
                                  <span>REPRODUZIR ÁUDIO</span>
                                </button>
                              </div>
                              {msg.is_temporary && (
                                <div className="audio-temp-indicator">
                                  <span>🔊 Áudio temporário (5min)</span>
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
                    <div className="audio-preview-info">
                      <span>🎤 Áudio gravado - {recordingTime}s</span>
                    </div>
                    <audio 
                      controls 
                      preload="metadata"
                      autoPlay={false}
                      style={{
                        width: '100%',
                        height: '45px',
                        borderRadius: '8px'
                      }}
                      src={previewMedia.url}
                      onLoadedMetadata={(e) => {
                        const audio = e.target as HTMLAudioElement;
                        audio.playbackRate = 1.0;
                        audio.volume = 0.7;
                        audio.currentTime = 0;
                      }}
                      onCanPlay={() => {
                        console.log('🎵 Preview carregado');
                      }}
                      onError={(e) => {
                        console.error('Erro no preview:', e);
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
                  Parar Gravação
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
                Parar Gravação
              </button>
            </div>
          </div>
        )}

        {/* Emoji Panel */}
        {showEmojis && (
          <div className="emoji-panel">
            {!isPremiumUser() && (
              <div className="premium-warning">
                <p>🔒 <strong>Emojis Premium</strong></p>
                <p>Faça upgrade para enviar emojis!</p>
                <button onClick={handleUpgradePremium} className="upgrade-btn">
                  ⭐ Virar Premium
                </button>
              </div>
            )}
            
            {isPremiumUser() && (
              <>
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
              </>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <div className="media-buttons">
            <button 
              className={`media-toggle ${!isPremiumUser() ? 'premium-blocked' : ''}`}
              onClick={handleTakePhoto}
              title={isPremiumUser() ? "Tirar foto com câmera" : "🔒 Câmera - Premium"}
            >
              <FiCamera />
              {!isPremiumUser() && <span className="premium-lock">🔒</span>}
            </button>

            <button 
              className={`media-toggle ${!isPremiumUser() ? 'premium-blocked' : ''}`}
              onClick={handleSelectFromGallery}
              title={isPremiumUser() ? "Selecionar da galeria" : "🔒 Galeria - Premium"}
            >
              <FiFolder />
              {!isPremiumUser() && <span className="premium-lock">🔒</span>}
            </button>

            <button 
              className={`media-toggle ${!isPremiumUser() ? 'premium-blocked' : ''}`}
              onClick={handleStartAudioRecording}
              title={isPremiumUser() ? "Gravar áudio" : "🔒 Áudio - Premium"}
            >
              <FiMic />
              {!isPremiumUser() && <span className="premium-lock">🔒</span>}
            </button>
            
            <button 
              className={`emoji-toggle ${showEmojis ? 'active' : ''}`}
              onClick={() => {
                console.log('🔥 Emoji button clicked! Current showEmojis:', showEmojis);
                setShowEmojis(!showEmojis);
                console.log('🔥 Setting showEmojis to:', !showEmojis);
              }}
              title="Emojis e Figurinhas"
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
      
      {/* Lista Lateral de Usuários */}
      <div className="lista-usuarios-lateral">
        <div className="lista-header">
          <FiUsers />
          <span>Usuários Online ({usuariosOnlineList.length})</span>
        </div>
        
        <div className="lista-usuarios">
          {usuariosOnlineList.map((nomeUsuario) => (
            <div 
              key={nomeUsuario}
              className="usuario-item"
              onClick={() => handleUsuarioClick(nomeUsuario)}
              title={`Ver perfil de ${nomeUsuario}`}
            >
              <div className="usuario-foto">
                <FiUser className="icone-usuario-default" />
                <div className="status-online"></div>
              </div>
              
              <div className="usuario-info">
                <span className="nome-usuario">{nomeUsuario}</span>
                <span className="idade-usuario">Online</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal do Perfil */}
      {showPerfilModal && usuarioSelecionado && (
        <div className="modal-perfil-overlay" onClick={handleClosePerfilModal}>
          <div className="modal-perfil" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiUser />
                <span>Perfil de {usuarioSelecionado.nome}</span>
                {usuarioSelecionado.isPremium && <FiStar className="premium-badge" />}
              </div>
              <button className="close-button" onClick={handleClosePerfilModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              {usuarioSelecionado.fotos && usuarioSelecionado.fotos.length > 0 ? (
                <div className="photos-section">
                  <div className="photo-container">
                    <img 
                      src={usuarioSelecionado.fotos[currentPhotoIndex]} 
                      alt={`Foto ${currentPhotoIndex + 1} de ${usuarioSelecionado.nome}`}
                      className="main-photo"
                    />
                    
                    {usuarioSelecionado.fotos.length > 1 && (
                      <>
                        <button className="photo-nav prev" onClick={prevPhoto}>‹</button>
                        <button className="photo-nav next" onClick={nextPhoto}>›</button>
                      </>
                    )}
                    
                    <div className="photo-counter">
                      {currentPhotoIndex + 1} de {usuarioSelecionado.fotos.length}
                    </div>
                  </div>

                  {usuarioSelecionado.fotos.length > 1 && (
                    <div className="photo-thumbnails">
                      {usuarioSelecionado.fotos.map((foto: string, index: number) => (
                        <img
                          key={index}
                          src={foto}
                          alt={`Miniatura ${index + 1}`}
                          className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                          onClick={() => setCurrentPhotoIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-photos-section">
                  <FiUser size={80} />
                  <p>👤 Usuário sem fotos</p>
                </div>
              )}

              <div className="profile-info">
                <div className="basic-info">
                  <h3>{usuarioSelecionado.nome}, {usuarioSelecionado.idade}</h3>
                  <div className="location">
                    <FiMapPin />
                    <span>{usuarioSelecionado.localizacao}</span>
                  </div>
                  <div className="profession">
                    <FiUser />
                    <span>{usuarioSelecionado.profissao}</span>
                  </div>
                </div>

                <div className="bio-section">
                  <h4>Sobre mim</h4>
                  <p>{usuarioSelecionado.descricao}</p>
                </div>

                <div className="interests-section">
                  <h4>Interesses</h4>
                  <div className="interests-tags">
                    {usuarioSelecionado.interesses?.map((interesse: string, index: number) => (
                      <span key={index} className="interest-tag">
                        {interesse}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="action-button like">
                  <FiHeart />
                  <span>Curtir</span>
                </button>
                <button className="action-button chat">
                  <FiUser />
                  <span>Conversar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface VideoWithThumbnailProps {
  videoUrl: string;
  messageId: string;
}

const VideoWithThumbnail: React.FC<VideoWithThumbnailProps> = ({ videoUrl, messageId }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Gera a thumbnail do vídeo ao montar
  React.useEffect(() => {
    if (!showVideo && !thumbnail) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.muted = true;
      video.currentTime = 0.1;
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL('image/png'));
        }
      });
    }
  }, [videoUrl, showVideo, thumbnail]);

  return (
    <div className="video-container">
      {!showVideo ? (
        <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={() => setShowVideo(true)}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Prévia do vídeo"
              style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }}
            />
          ) : (
            <div style={{ width: 200, height: 120, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>Ver vídeo</span>
            </div>
          )}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          preload="metadata"
          playsInline
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
          src={videoUrl}
          autoPlay={false}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            video.currentTime = 0;
            video.playbackRate = 1.0;
            video.volume = 0.7;
          }}
          onCanPlay={() => {
            console.log('🎥 Vídeo carregado');
          }}
          onSuspend={() => {
            console.log('⏸️ Download de vídeo pausado');
          }}
          onError={(e) => {
            console.error('Erro ao carregar vídeo:', e);
          }}
        >
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      )}
    </div>
  );
};

export default ChatPage;