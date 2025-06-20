import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSend, FiImage, FiMic, FiSmile, FiArrowLeft, 
  FiUsers, FiStar, FiClock, FiCheck, FiEye, FiPlay, FiPause,
  FiMicOff, FiCamera, FiFolder, FiUser, FiX, FiHeart, FiMapPin, FiUserX, FiEdit, FiSave
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
  const [usuariosReaisOnline, setUsuariosReaisOnline] = useState<{[key: string]: number}>({});

  // Estados para edição do próprio perfil
  const [showEditPerfilModal, setShowEditPerfilModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    fotos: [] as string[],
    descricao: '',
    idade: 25,
    localizacao: 'Brasil',
    profissao: 'Usuário'
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estados para sistema de bloqueio
  const [usuariosBloqueados, setUsuariosBloqueados] = useState<string[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<string>('');

  // Estados para mini janela de perfil
  const [showMiniPerfil, setShowMiniPerfil] = useState(false);
  const [miniPerfilUsuario, setMiniPerfilUsuario] = useState<any>(null);

  // Estado para forçar re-render da lista de usuários
  const [forceUpdate, setForceUpdate] = useState(0);

  const nomeSala = location.state?.nomeSala || 'Chat';

  // ✅ CACHE ESPECÍFICO DE FOTOS POR USUÁRIO
  const [userPhotosCache, setUserPhotosCache] = useState<{[key: string]: string | null}>({});

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
    // REMOVIDO: Não simular usuários falsos
    /*
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
    */
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

    // Listener para atualização de mini fotos
    const handleMiniPhotoUpdate = (event: CustomEvent) => {
      console.log('📸 Mini foto atualizada:', event.detail);
      setForceUpdate(prev => prev + 1);
    };

    // Listener para forçar atualização do chat
    const handleForceChatUpdate = (event: CustomEvent) => {
      console.log('🔄 Forçando atualização do chat');
      setForceUpdate(prev => prev + 1);
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
    window.addEventListener('mini_photo_updated' as any, handleMiniPhotoUpdate);
    window.addEventListener('force_chat_update' as any, handleForceChatUpdate);

    // Cleanup ao sair da página
    return () => {
      chatService.leaveRoom();
      clearInterval(messagePolling);
      window.removeEventListener('local-message', handleLocalMessage);
      window.removeEventListener('chatMessageSent' as any, handleChatMessageSent);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mini_photo_updated' as any, handleMiniPhotoUpdate);
      window.removeEventListener('force_chat_update' as any, handleForceChatUpdate);
    };
  }, [navigate, salaId]);

  const initializeChat = async () => {
    if (!salaId) return;

    try {
      console.log('🚀 Inicializando chat para sala:', salaId);
      
      // CARREGAR PERFIL DO USUÁRIO ATUAL PRIMEIRO
      if (usuario?.nome) {
        console.log('👤 Carregando perfil do usuário atual:', usuario.nome);
        const possiveisChaves = [
          `perfil_${usuario.nome}`,
          `usuario_${usuario.nome}`,
          `user_${usuario.nome}`,
          `profile_${usuario.nome}`
        ];
        
        for (const chave of possiveisChaves) {
          const dadosSalvos = localStorage.getItem(chave);
          if (dadosSalvos) {
            try {
              const dados = JSON.parse(dadosSalvos);
              if (dados.fotos && dados.fotos.length > 0) {
                setEditingProfile(prev => ({
                  ...prev,
                  fotos: dados.fotos,
                  descricao: dados.descricao || prev.descricao,
                  idade: dados.idade || prev.idade
                }));
                
                // ✅ DEFINIR FOTO DO USUÁRIO ATUAL NO SERVIÇO DE CHAT
                chatService.setUserPhoto(usuario.nome, dados.fotos[0]);
                console.log('✅ Perfil do usuário carregado e foto definida:', dados);
                break;
              }
            } catch (error) {
              console.warn('⚠️ Erro ao carregar perfil de', chave);
            }
          }
        }
        
        // ✅ VERIFICAR TAMBÉM NOS DADOS DE LOGIN
        const usuarioPremium = localStorage.getItem('usuarioPremium');
        const usuarioChat = localStorage.getItem('usuarioChat');
        
        if (usuarioPremium) {
          try {
            const dadosPremium = JSON.parse(usuarioPremium);
            if (dadosPremium.foto && dadosPremium.nome === usuario.nome) {
              chatService.setUserPhoto(usuario.nome, dadosPremium.foto);
              console.log('✅ Foto do usuário premium definida:', dadosPremium.foto);
            }
          } catch (error) {
            console.warn('⚠️ Erro ao verificar dados premium');
          }
        }
        
        if (usuarioChat) {
          try {
            const dadosChat = JSON.parse(usuarioChat);
            if (dadosChat.foto && dadosChat.nome === usuario.nome) {
              chatService.setUserPhoto(usuario.nome, dadosChat.foto);
              console.log('✅ Foto do usuário chat definida:', dadosChat.foto);
            }
          } catch (error) {
            console.warn('⚠️ Erro ao verificar dados chat');
          }
        }
      }
      
      // Testar conexão específica do chat
      const connectionTest = await testChatConnection(salaId);
      console.log('🧪 Resultado do teste de conexão:', connectionTest);
      
      // Inicializar tabelas se necessário
      await chatService.initializeTables();
      
      // Buscar mensagens existentes
      const mensagensExistentes = await chatService.getMessages(salaId);
      const mensagensValidas = chatService.filterValidMessages(mensagensExistentes);
      setMensagens(mensagensValidas);
      
      // Conectar ao chat em tempo real com callback ULTRA OTIMIZADO
      const connected = await chatService.joinRoom(salaId, (novaMsg) => {
        console.log('📨 MENSAGEM RECEBIDA INSTANTANEAMENTE:', novaMsg);
        
        // 🚀 VELOCIDADE MÁXIMA - sem verificações demoradas
        setMensagens(prev => {
          // Verificação ultra rápida apenas por ID
          const exists = prev.some(msg => msg.id === novaMsg.id);
          
          if (!exists) {
            // Remover mensagem otimista se existe (mesmo conteúdo)
            const filteredPrev = prev.filter(msg => 
              !(msg.isOptimistic && 
                msg.user_name === novaMsg.user_name && 
                msg.content === novaMsg.content)
            );
            
            // Adicionar nova mensagem no final
            const newMessages = [...filteredPrev, novaMsg];
            
            // Scroll ultra rápido sem delay
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            });
            
            return newMessages;
          }
          return prev;
        });
      });
      
      setIsConnected(connected);
      
      // SISTEMA REAL DE USUÁRIOS - sem números robóticos
      atualizarUsuariosOnline();
      
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
    // 🚀 SCROLL ULTRA RÁPIDO após mudança nas mensagens
    requestAnimationFrame(() => {
      scrollToBottom();
    });
    atualizarUsuariosOnline();
  }, [mensagens]);

  const scrollToBottom = () => {
    // 🚀 SCROLL INSTANTÂNEO - máxima performance
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const handleEnviarMensagem = async () => {
    // ⚡ ULTRA VELOCIDADE - Zero delays
    if (!mensagem.trim() || !usuario || !salaId) return;

    // ⚡ INSTANTÂNEO: Capturar e limpar
    const msg = mensagem.trim();
    setMensagem('');

    // ⚡ INSTANTÂNEO: Criar mensagem otimista
    const optimisticMsg: ChatMessage = {
      id: `ultra_${Date.now()}${Math.random()}`,
      room_id: salaId,
      user_name: usuario.nome,
      content: msg,
      message_type: 'texto',
      is_premium: usuario.premium || false,
      is_temporary: false,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // ⚡ INSTANTÂNEO: Mostrar na tela (método mais rápido)
    setMensagens(prev => [...prev, optimisticMsg]);

    // ⚡ INSTANTÂNEO: Scroll automático ultra rápido
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    });

    // 📤 Background fire-and-forget (sem await, sem catch)
    chatService.sendMessage(salaId, usuario.nome, msg, 'texto', usuario.premium || false);
  };

  const handleEnviarEmoji = async (emoji: string) => {
    if (!checkPremiumAccess('Emoticons e Figurinhas')) return;
    if (!salaId || !usuario) return;

    // ⚡ EMOJI ULTRA RÁPIDO
    const emojiMsg: ChatMessage = {
      id: `emoji_ultra_${Date.now()}${Math.random()}`,
      room_id: salaId,
      user_name: usuario.nome,
      content: emoji,
      message_type: 'emoji',
      is_premium: usuario.premium || false,
      is_temporary: false,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // ⚡ INSTANTÂNEO: Mostrar emoji
    setMensagens(prev => [...prev, emojiMsg]);
    
    // ⚡ INSTANTÂNEO: Scroll e fechar painel
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    });
    setShowEmojis(false);

    // 📤 Background fire-and-forget
    chatService.sendMessage(salaId, usuario.nome, emoji, 'texto', usuario.premium || false);
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

  // Função para atualizar lista de usuários realmente online
  const atualizarUsuariosOnline = () => {
    const agora = Date.now();
    const TEMPO_ONLINE = 5 * 60 * 1000; // 5 minutos

    // Filtrar usuários que estiveram ativos nos últimos 5 minutos (SEM o usuário atual)
    const usuariosAtivos = Object.entries(usuariosReaisOnline)
      .filter(([nome, ultimaAtividade]) => {
        const tempoInativo = agora - ultimaAtividade;
        return tempoInativo <= TEMPO_ONLINE && nome !== usuario?.nome;
      })
      .map(([nome]) => nome);

    // Incluir o usuário atual na lista horizontal
    const listaCompleta = usuario?.nome ? [usuario.nome, ...usuariosAtivos] : usuariosAtivos;
    setUsuariosOnlineList(listaCompleta);
    
    // Atualizar contador de usuários online (incluindo o usuário atual)
    const totalOnline = usuariosAtivos.length + 1; // +1 para o usuário atual
    setUsuariosOnline(totalOnline);
  };

  // Registrar atividade do usuário atual
  const registrarAtividade = (nomeUsuario: string) => {
    setUsuariosReaisOnline(prev => ({
      ...prev,
      [nomeUsuario]: Date.now()
    }));
  };

  // Atualizar lista quando usuários online mudarem
  useEffect(() => {
    atualizarUsuariosOnline();
    
    // Atualizar a cada 30 segundos para remover usuários inativos
    const interval = setInterval(atualizarUsuariosOnline, 30000);
    
    return () => clearInterval(interval);
  }, [usuariosReaisOnline, usuario]);

  // Registrar atividade quando mensagens chegarem
  useEffect(() => {
    mensagens.forEach(msg => {
      if (msg.user_name && msg.user_name !== usuario?.nome) {
        registrarAtividade(msg.user_name);
      }
    });
  }, [mensagens, usuario]);

  // Registrar atividade do usuário atual quando entra no chat
  useEffect(() => {
    if (usuario?.nome) {
      registrarAtividade(usuario.nome);
      console.log('👤 Usuário registrado como ativo:', usuario.nome);
    }
  }, [usuario]);

  // Carregar dados salvos do perfil e lista de bloqueados
  useEffect(() => {
    if (usuario?.nome) {
      
      // Carregar dados do perfil
      const perfilSalvo = localStorage.getItem(`perfil_${usuario.nome}`);
      if (perfilSalvo) {
        const dados = JSON.parse(perfilSalvo);
        setEditingProfile(dados);
      }

      // Carregar lista de usuários bloqueados
      const bloqueadosSalvos = localStorage.getItem(`bloqueados_${usuario.nome}`);
      if (bloqueadosSalvos) {
        setUsuariosBloqueados(JSON.parse(bloqueadosSalvos));
      }

      // Listener para atualizações de perfil de outros usuários
      const handleProfileUpdate = (event: CustomEvent) => {
        console.log('📸 Perfil atualizado:', event.detail);
        // Forçar re-render da lista de usuários
        setUsuariosOnlineList(prev => [...prev]);
        setForceUpdate(prev => prev + 1);
      };

      window.addEventListener('profile_updated', handleProfileUpdate as EventListener);

      // Cleanup function
      const cleanup = () => {
        window.removeEventListener('profile_updated', handleProfileUpdate as EventListener);
      };

      return cleanup;
    }
  }, [usuario]);

  // Função para carregar dados do usuário selecionado
  const carregarDadosUsuario = async (nomeUsuario: string) => {
    console.log('🔍 Carregando dados do usuário:', nomeUsuario);
    
    try {
      // Primeiro tentar carregar do localStorage (dados mais recentes)
      const dadosSalvos = localStorage.getItem(`usuario_${nomeUsuario}`) || localStorage.getItem(`perfil_${nomeUsuario}`);
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        console.log('📁 Dados encontrados no localStorage:', dados);
        return {
          nome: nomeUsuario,
          fotos: dados.fotos || [],
          descricao: dados.descricao || `Olá! Eu sou ${nomeUsuario}. Seja bem-vindo ao meu perfil! 😊`,
          idade: dados.idade || getUserAge(nomeUsuario),
          localizacao: dados.localizacao || getUserLocation(nomeUsuario),
          profissao: dados.profissao || getUserProfession(nomeUsuario),
          interesses: getUserInterests(nomeUsuario),
          isPremium: Math.random() > 0.7,
          fotoPrincipal: 0
        };
      }

      // Se não encontrar no localStorage, tentar no Supabase
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('nome', nomeUsuario)
        .single();

      if (data && !error) {
        console.log('☁️ Dados encontrados no Supabase:', data);
        return {
          nome: nomeUsuario,
          fotos: data.fotos || [],
          descricao: data.descricao || `Olá! Eu sou ${nomeUsuario}. Seja bem-vindo ao meu perfil! 😊`,
          idade: data.idade || getUserAge(nomeUsuario),
          localizacao: data.localizacao || getUserLocation(nomeUsuario),
          profissao: data.profissao || getUserProfession(nomeUsuario),
          interesses: getUserInterests(nomeUsuario),
          isPremium: Math.random() > 0.7,
          fotoPrincipal: 0
        };
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }

    // Fallback para dados padrão
    console.log('🎭 Usando dados padrão para:', nomeUsuario);
    return {
      nome: nomeUsuario,
      fotos: [],
      descricao: `Olá! Eu sou ${nomeUsuario}. Seja bem-vindo ao meu perfil! 😊`,
      idade: getUserAge(nomeUsuario),
      localizacao: getUserLocation(nomeUsuario),
      profissao: getUserProfession(nomeUsuario),
      interesses: getUserInterests(nomeUsuario),
      isPremium: Math.random() > 0.7,
      fotoPrincipal: 0
    };
  };

  // Função para abrir modal de perfil
  const handleUsuarioClick = async (nomeUsuario: string) => {
    console.log('👤 Clique no usuário:', nomeUsuario);
    
    // Se for o próprio usuário, abrir modal de edição
    if (nomeUsuario === usuario?.nome) {
      handleEditProfile();
      return;
    }

    // Verificar se é usuário premium
    const usuariosPremium = JSON.parse(localStorage.getItem('usuarios-premium') || '[]');
    const usuarioPremium = usuariosPremium.find((u: any) => u.nome === nomeUsuario);
    
    if (usuarioPremium) {
      // É usuário premium - abrir mini janela
      console.log('⭐ Usuário premium detectado, abrindo mini perfil');
      
      // Carregar dados do perfil
      const dadosPerfil = await carregarDadosUsuario(nomeUsuario);
      
      setMiniPerfilUsuario({
        nome: nomeUsuario,
        fotos: dadosPerfil.fotos || [],
        descricao: dadosPerfil.descricao || 'Usuário premium',
        idade: dadosPerfil.idade || 25,
        premium: true
      });
      
      setShowMiniPerfil(true);
    } else {
      // Usuário gratuito - abrir modal completo como antes
      console.log('💬 Usuário gratuito, abrindo perfil completo');
      
      const dadosUsuario = await carregarDadosUsuario(nomeUsuario);
      setUsuarioSelecionado(dadosUsuario);
      setCurrentPhotoIndex(dadosUsuario.fotoPrincipal || 0);
      setShowPerfilModal(true);
    }
  };

  // Função para fechar modal
  const handleClosePerfilModal = () => {
    setShowPerfilModal(false);
    setUsuarioSelecionado(null);
    setCurrentPhotoIndex(0);
  };

  // Função para fechar mini janela de perfil
  const handleCloseMiniPerfil = () => {
    setShowMiniPerfil(false);
    setMiniPerfilUsuario(null);
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

  // Funções para edição do próprio perfil
  const handleEditProfile = () => {
    // Carregar dados atuais do usuário
    if (usuario?.nome) {
      const dadosSalvos = localStorage.getItem(`perfil_${usuario.nome}`) || 
                         localStorage.getItem(`usuario_${usuario.nome}`) ||
                         localStorage.getItem(`user_${usuario.nome}`) ||
                         localStorage.getItem(`profile_${usuario.nome}`);
      
      if (dadosSalvos) {
        try {
          const dados = JSON.parse(dadosSalvos);
          setEditingProfile({
            fotos: dados.fotos || [],
            descricao: dados.descricao || '',
            idade: dados.idade || 25,
            localizacao: dados.localizacao || 'Brasil',
            profissao: dados.profissao || 'Usuário'
          });
        } catch (error) {
          console.error('Erro ao carregar dados do perfil:', error);
        }
      }
    }
    setShowEditPerfilModal(true);
  };

  const handleSaveProfile = async () => {
    console.log('🔥 INICIANDO SALVAMENTO - Dados atuais:', editingProfile);
    console.log('🔥 Usuário atual:', usuario);
    
    if (!usuario || !usuario.nome) {
      console.error('❌ ERRO: Usuário não encontrado');
      alert('❌ Erro: Usuário não identificado');
      return;
    }

    try {
      // Dados simples para salvar
      const dadosParaSalvar = {
        nome: usuario.nome,
        fotos: editingProfile.fotos || [],
        descricao: editingProfile.descricao || '',
        idade: editingProfile.idade || 25,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Salvando dados:', dadosParaSalvar);

      // Salvar no localStorage com múltiplas chaves para compatibilidade
      localStorage.setItem(`perfil_${usuario.nome}`, JSON.stringify(dadosParaSalvar));
      localStorage.setItem(`usuario_${usuario.nome}`, JSON.stringify(dadosParaSalvar));
      localStorage.setItem(`user_${usuario.nome}`, JSON.stringify(dadosParaSalvar));
      localStorage.setItem(`profile_${usuario.nome}`, JSON.stringify(dadosParaSalvar));
      
      console.log('✅ DADOS SALVOS NO LOCALSTORAGE COM MÚLTIPLAS CHAVES');

      // Broadcast para outros usuários
      window.dispatchEvent(new CustomEvent('profile_updated', {
        detail: {
          nome: usuario.nome,
          fotos: dadosParaSalvar.fotos,
          descricao: dadosParaSalvar.descricao,
          idade: dadosParaSalvar.idade
        }
      }));

      // ✅ DISPARO DO EVENTO DE ATUALIZAÇÃO DE MINI FOTO
      window.dispatchEvent(new CustomEvent('mini_photo_updated', {
        detail: {
          nomeUsuario: usuario.nome,
          fotos: dadosParaSalvar.fotos
        }
      }));

      // Atualizar foto no serviço de chat também
      if (dadosParaSalvar.fotos.length > 0) {
        chatService.setUserPhoto(usuario.nome, dadosParaSalvar.fotos[0]);
      }

      // Fechar modal
      setShowEditPerfilModal(false);
      
      // Forçar atualização da interface
      setForceUpdate(prev => prev + 1);
      
      // Mostrar sucesso
      alert('✅ Perfil salvo com sucesso!');
      
      console.log('🎉 SALVAMENTO CONCLUÍDO COM SUCESSO');
      
    } catch (error) {
      console.error('💥 ERRO CRÍTICO:', error);
      alert('❌ Erro ao salvar: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      return;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 5MB.');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Converter para base64 para armazenamento local
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setEditingProfile(prev => ({
          ...prev,
          fotos: [...prev.fotos, base64]
        }));
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da foto.');
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setEditingProfile(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  // Funções para sistema de bloqueio
  const handleBlockUser = (nomeUsuario: string) => {
    setUserToBlock(nomeUsuario);
    setShowBlockModal(true);
  };

  const confirmBlockUser = () => {
    const novosBloqueados = [...usuariosBloqueados, userToBlock];
    setUsuariosBloqueados(novosBloqueados);
    localStorage.setItem(`bloqueados_${usuario.nome}`, JSON.stringify(novosBloqueados));
    
    setShowBlockModal(false);
    setShowPerfilModal(false);
    alert(`Usuário ${userToBlock} foi bloqueado.`);
  };

  const handleUnblockUser = (nomeUsuario: string) => {
    const novosBloqueados = usuariosBloqueados.filter(nome => nome !== nomeUsuario);
    setUsuariosBloqueados(novosBloqueados);
    localStorage.setItem(`bloqueados_${usuario.nome}`, JSON.stringify(novosBloqueados));
    alert(`Usuário ${nomeUsuario} foi desbloqueado.`);
  };

  // ✅ FUNÇÃO ULTRA OTIMIZADA DE FOTOS POR USUÁRIO
  const getUserPhoto = (nomeUsuario: string): string | null => {
    if (!nomeUsuario) return null;
    
    console.log('🔍 Buscando foto específica para:', nomeUsuario);
    
    // ⚡ ESTRATÉGIA 1: Buscar APENAS por dados específicos do usuário solicitado
    // NUNCA misturar com dados do usuário logado atual
    const chavesPossiveisUsuario = [
      `perfil_${nomeUsuario}`,
      `usuario_${nomeUsuario}`, 
      `user_${nomeUsuario}`,
      `profile_${nomeUsuario}`,
      `user_photo_${nomeUsuario}`
    ];
    
    // Buscar apenas pelos dados salvos específicos do usuário
    for (const chave of chavesPossiveisUsuario) {
      try {
        const dadosSalvos = localStorage.getItem(chave);
        if (dadosSalvos) {
          const dados = JSON.parse(dadosSalvos);
          
          // ✅ VERIFICAÇÃO RIGOROSA: nome deve corresponder EXATAMENTE
          if (dados && dados.nome === nomeUsuario) {
            console.log(`📁 Dados específicos encontrados em ${chave} para ${nomeUsuario}`);
            
            // Priorizar array de fotos
            if (dados.fotos && Array.isArray(dados.fotos) && dados.fotos.length > 0) {
              const fotoValida = dados.fotos.find((foto: string) => foto && foto.startsWith('data:image/'));
              if (fotoValida) {
                console.log('✅ Foto do array encontrada para:', nomeUsuario);
                return fotoValida;
              }
            }
            
            // Foto única
            if (dados.foto && dados.foto.startsWith('data:image/')) {
              console.log('✅ Foto única encontrada para:', nomeUsuario);
              return dados.foto;
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao parsear ${chave}:`, error);
      }
    }
    
    // ⚡ ESTRATÉGIA 2: Se for o próprio usuário logado, verificar também dados de sessão
    if (nomeUsuario === usuario?.nome) {
      console.log('👤 Buscando foto do próprio usuário logado:', nomeUsuario);
      
      // Estado de edição atual
      if (editingProfile.fotos && editingProfile.fotos.length > 0) {
        console.log('✅ Foto no estado de edição para usuário atual');
        return editingProfile.fotos[0];
      }
      
      // Dados de sessão do usuário
      const sessaoUsuarios = ['usuarioPremium', 'usuarioChat', 'visitante'];
      for (const tipoSessao of sessaoUsuarios) {
        try {
          const dadosSessao = localStorage.getItem(tipoSessao);
          if (dadosSessao) {
            const dados = JSON.parse(dadosSessao);
            if (dados.nome === nomeUsuario && dados.foto && dados.foto.startsWith('data:image/')) {
              console.log(`✅ Foto de sessão ${tipoSessao} para usuário atual`);
              return dados.foto;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao verificar sessão ${tipoSessao}`);
        }
      }
    }
    
    // ⚡ ESTRATÉGIA 3: Buscar nas mensagens de imagem específicas do usuário
    const imagensDoUsuario = mensagens.filter((msg: ChatMessage) => 
      msg.user_name === nomeUsuario && 
      msg.message_type === 'imagem' && 
      msg.content && 
      msg.content.startsWith('data:image/')
    );
    
    if (imagensDoUsuario.length > 0) {
      const ultimaFoto = imagensDoUsuario[imagensDoUsuario.length - 1].content;
      console.log('💬 Foto encontrada nas mensagens de:', nomeUsuario);
      return ultimaFoto;
    }
    
    console.log('❌ Nenhuma foto específica encontrada para:', nomeUsuario);
    return null;
  };

  // Filtrar mensagens de usuários bloqueados
  const mensagensFiltradas = mensagens.filter(msg => 
    !usuariosBloqueados.includes(msg.user_name)
  );

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
              {mensagensFiltradas.map((msg) => {
                const isExpired = isMessageExpired(msg);
                const isOwn = msg.user_name === usuario?.nome;
                
                if (isExpired && !isOwn) {
                  return null;
                }

                return (
                  <div 
                    key={`${msg.id}_${forceUpdate}`}
                    className={`message ${isOwn ? 'own-message' : 'other-message'} ${msg.is_temporary ? 'temporary-message' : ''}`}
                  >
                    <div className="message-header">
                      <div className="user-info" onClick={() => handleUsuarioClick(msg.user_name)}>
                            <FiUser className="default-user-icon" />
                      <span className="sender">
                        {msg.user_name}
                        {msg.is_premium && <FiStar className="premium-icon" />}
                      </span>
                      </div>
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

        {/* Seção de usuários horizontais removida */}

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
                <button 
                  className="action-button block" 
                  onClick={() => handleBlockUser(usuarioSelecionado.nome)}
                >
                  <FiUserX />
                  <span>Bloquear</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Janela de Perfil Premium */}
      {showMiniPerfil && miniPerfilUsuario && (
        <div className="mini-perfil-overlay" onClick={handleCloseMiniPerfil}>
          <div className="mini-perfil-content" onClick={(e) => e.stopPropagation()}>
            <div className="mini-perfil-header">
              <div className="mini-perfil-title">
                <FiStar className="premium-star" />
                <span>Perfil Premium</span>
              </div>
              <button className="mini-close-button" onClick={handleCloseMiniPerfil}>
                <FiX />
              </button>
            </div>

            <div className="mini-perfil-body">
              {/* Fotos do usuário premium */}
              <div className="mini-fotos-section">
                {miniPerfilUsuario.fotos && miniPerfilUsuario.fotos.length > 0 ? (
                  <div className="mini-fotos-grid">
                    {miniPerfilUsuario.fotos.slice(0, 5).map((foto: string, index: number) => (
                      <div key={index} className="mini-foto-item">
                        <img src={foto} alt={`Foto ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mini-no-photos">
                    <FiUser size={40} />
                    <span>Sem fotos</span>
                  </div>
                )}
              </div>

              {/* Informações do usuário */}
              <div className="mini-info-section">
                <h3>{miniPerfilUsuario.nome}</h3>
                <div className="mini-idade">
                  <span>📅 {miniPerfilUsuario.idade} anos</span>
                </div>
                <div className="mini-descricao">
                  <p>{miniPerfilUsuario.descricao || 'Usuário premium'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição do Próprio Perfil */}
      {showEditPerfilModal && (
        <div className="modal-overlay" onClick={() => setShowEditPerfilModal(false)}>
          <div className="modal-content-edit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiEdit />
                <span>Editar Meu Perfil</span>
              </div>
              <button className="close-button" onClick={() => setShowEditPerfilModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              <div className="edit-section">
                <h4>📸 Minhas Fotos</h4>
                <div className="photos-grid">
                  {editingProfile.fotos.map((foto, index) => (
                    <div key={index} className="photo-item">
                      <img src={foto} alt={`Foto ${index + 1}`} />
                      <button 
                        className="remove-photo"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  
                  <div className="add-photo">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      style={{ display: 'none' }}
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="upload-button">
                      {uploadingPhoto ? (
                        <div className="loading-spinner">⏳</div>
                      ) : (
                        <>
                          <FiCamera />
                          <span>Adicionar Foto</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="edit-section">
                <h4>✍️ Descrição</h4>
                <textarea
                  value={editingProfile.descricao}
                  onChange={(e) => {
                    console.log('🔥 DESCRIÇÃO ALTERADA:', e.target.value);
                    setEditingProfile(prev => ({ ...prev, descricao: e.target.value }));
                  }}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                  rows={4}
                />
                <small>{editingProfile.descricao.length}/500 caracteres</small>
              </div>

              <div className="edit-section">
                <h4>📋 Informações</h4>
                <div className="info-fields">
                  <div className="field">
                    <label>Idade:</label>
                    <input
                      type="number"
                      value={editingProfile.idade}
                      onChange={(e) => {
                        console.log('🔥 IDADE ALTERADA:', e.target.value);
                        setEditingProfile(prev => ({ ...prev, idade: parseInt(e.target.value) || 25 }));
                      }}
                      min="18"
                      max="99"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-button" onClick={() => setShowEditPerfilModal(false)}>
                  Cancelar
                </button>
                <button 
                  className="save-button" 
                  onClick={() => {
                    console.log('🔥 BOTÃO SALVAR CLICADO!');
                    handleSaveProfile();
                  }}
                >
                  <FiSave />
                  Salvar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Bloqueio */}
      {showBlockModal && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FiUserX />
                <span>Bloquear Usuário</span>
              </div>
            </div>

            <div className="modal-content">
              <p>Tem certeza que deseja bloquear <strong>{userToBlock}</strong>?</p>
              <p><small>Você não verá mais as mensagens deste usuário no chat.</small></p>

              <div className="modal-actions">
                <button className="cancel-button" onClick={() => setShowBlockModal(false)}>
                  Cancelar
                </button>
                <button className="block-button" onClick={confirmBlockUser}>
                  <FiUserX />
                  Bloquear
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