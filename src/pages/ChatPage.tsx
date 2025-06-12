import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaSmile, FaPaperclip, FaMicrophone, FaImage, FaVideo, FaCamera } from 'react-icons/fa';
import 'emoji-picker-element';

interface User {
  id: string;
  email: string;
  nome: string;
  isPremium: boolean;
  loginTime: number;
}

interface Sala {
  id: string;
  nome: string;
  cidade: string;
  bairro: string;
  criadorId: string;
  usuariosOnline: number;
  criadaEm: number;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  type: 'text' | 'audio' | 'image' | 'video';
  timestamp: Date;
  isOwn?: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  isOnline: boolean;
  avatar: string;
  photos: string[];
  description: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { salaId } = useParams();
  const location = useLocation();
  const sala = location.state?.sala as Sala;
  
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Verificar usuário logado
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      navigate('/inicio');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Verificar se visitante gratuito ainda tem tempo
    if (!userData.isPremium) {
      const timeElapsed = Date.now() - userData.loginTime;
      const thirtyMinutes = 30 * 60 * 1000;
      if (timeElapsed >= thirtyMinutes) {
        localStorage.setItem(`blocked_${userData.email}`, Date.now().toString());
        localStorage.removeItem('currentUser');
        alert('Seu tempo expirou! Você foi bloqueado por 24 horas.');
        navigate('/inicio');
        return;
      }
    }

    // Carregar dados da sala
    loadChatData();
  }, [navigate, salaId]);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer para gravação de áudio
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            handleStopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  const loadChatData = () => {
    // Simular usuários online na sala
    const mockUsers: ChatUser[] = [
      {
        id: 'user1',
        name: 'Ana Silva',
        email: 'ana@email.com',
        isPremium: true,
        isOnline: true,
        avatar: '👩‍🦰',
        photos: ['https://via.placeholder.com/300x400/ff6b9d/white?text=Ana1', 'https://via.placeholder.com/300x400/4facfe/white?text=Ana2'],
        description: 'Adoro conversar e conhecer pessoas novas! Moro aqui há 5 anos e conheço os melhores lugares da região.'
      },
      {
        id: 'user2',
        name: 'Carlos Santos',
        email: 'carlos@email.com',
        isPremium: false,
        isOnline: true,
        avatar: '👨‍💼',
        photos: ['https://via.placeholder.com/300x400/ff8fab/white?text=Carlos'],
        description: 'Trabalho na área de tecnologia e gosto de esportes. Sempre disposto a ajudar com dicas da região!'
      },
      {
        id: 'user3',
        name: 'Maria Oliveira',
        email: 'maria@email.com',
        isPremium: true,
        isOnline: true,
        avatar: '👩‍🎨',
        photos: ['https://via.placeholder.com/300x400/00f2fe/white?text=Maria1', 'https://via.placeholder.com/300x400/ff6b9d/white?text=Maria2', 'https://via.placeholder.com/300x400/4facfe/white?text=Maria3'],
        description: 'Artista e designer. Amo arte, música e boas conversas. Vamos trocar experiências sobre nossa cidade!'
      }
    ];

    // Adicionar usuário atual
    if (user) {
      mockUsers.unshift({
        id: user.id,
        name: user.nome,
        email: user.email,
        isPremium: user.isPremium,
        isOnline: true,
        avatar: '👤',
        photos: ['https://via.placeholder.com/300x400/667eea/white?text=Você'],
        description: 'Olá! Sou novo por aqui e estou ansioso para conhecer pessoas da região.'
      });
    }

    setChatUsers(mockUsers);

    // Simular mensagens existentes
    const mockMessages: Message[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Ana Silva',
        userEmail: 'ana@email.com',
        content: 'Oi pessoal! Como estão? 😊',
        type: 'text',
        timestamp: new Date(Date.now() - 300000),
        isOwn: false
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Carlos Santos',
        userEmail: 'carlos@email.com',
        content: 'Tudo bem! Alguém conhece um bom restaurante aqui perto?',
        type: 'text',
        timestamp: new Date(Date.now() - 240000),
        isOwn: false
      }
    ];

    setMessages(mockMessages);
  };

  const sendMessage = (content: string, type: 'text' | 'audio' | 'image' | 'video' = 'text') => {
    if (!user || (!content.trim() && type === 'text')) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      userName: user.nome,
      userEmail: user.email,
      content,
      type,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, newMsg]);
    if (type === 'text') setNewMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.isPremium) {
      alert('Apenas usuários Premium podem enviar arquivos! Faça upgrade para desbloquear esta funcionalidade.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      sendMessage(reader.result as string, type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioRecord = () => {
    if (!user?.isPremium) {
      alert('Apenas usuários Premium podem enviar áudios! Faça upgrade para desbloquear esta funcionalidade.');
      return;
    }
    setIsRecordingAudio(!isRecordingAudio);
  };

  const handleStopRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const handleEmojiSelect = (e: any) => {
    setNewMessage(prev => prev + e.detail.unicode);
    setShowEmojiPicker(false);
  };

  const handleUserClick = (chatUser: ChatUser) => {
    setSelectedUser(chatUser);
  };

  const handlePremiumClick = () => {
    alert('Funcionalidade de pagamento será implementada em breve!');
  };

  if (!user || !sala) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/salas')}
              className="text-gray-500 hover:text-pink-500"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">{sala.nome}</h1>
              <p className="text-sm text-gray-600">
                📍 {sala.bairro}, {sala.cidade} • {chatUsers.length} online
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">{user.nome}</p>
            <p className="text-xs text-gray-500">
              {user.isPremium ? '⭐ Premium' : '🆓 Gratuito'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lista de Usuários (Desktop) */}
        <div className="hidden md:block w-80 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FaUsers /> Online ({chatUsers.length})
            </h3>
            <div className="space-y-2">
              {chatUsers.map(chatUser => (
                <div
                  key={chatUser.id}
                  onClick={() => handleUserClick(chatUser)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors"
                >
                  <div className="text-2xl">{chatUser.avatar}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {chatUser.isPremium && '⭐'} {chatUser.name}
                      {chatUser.id === user.id && ' (você)'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chatUser.isPremium ? 'Premium' : 'Gratuito'}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col">
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    message.isOwn
                      ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.userName}
                    </p>
                  )}
                  
                  <div>
                    {message.type === 'image' && (
                      <img
                        src={message.content}
                        alt="Imagem"
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    {message.type === 'video' && (
                      <video
                        src={message.content}
                        controls
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    {message.type === 'audio' && (
                      <audio src={message.content} controls className="mb-2" />
                    )}
                    {message.type === 'text' && (
                      <p>{message.content}</p>
                    )}
                  </div>
                  
                  <p className="text-xs opacity-75 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 bg-white border-t">
            {!user.isPremium && (
              <div className="mb-3 p-2 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg border border-pink-200 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  🚀 Upgrade para Premium e desbloqueie fotos, vídeos e áudios!
                </p>
                <button onClick={handlePremiumClick} className="btn-premium text-sm px-4 py-1">
                  ⭐ SEJA PREMIUM ⭐
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              {/* Emoji */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-pink-500 p-2"
              >
                <FaSmile size={20} />
              </button>

              {/* Anexar Arquivo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 ${user.isPremium ? 'text-gray-500 hover:text-blue-500' : 'text-gray-300'}`}
                disabled={!user.isPremium}
              >
                <FaPaperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />

              {/* Gravar Áudio */}
              <button
                type="button"
                onClick={handleAudioRecord}
                className={`p-2 ${
                  isRecordingAudio
                    ? 'text-red-500 animate-pulse'
                    : user.isPremium
                    ? 'text-gray-500 hover:text-red-500'
                    : 'text-gray-300'
                }`}
                disabled={!user.isPremium}
              >
                <FaMicrophone size={20} />
              </button>
              {isRecordingAudio && (
                <span className="text-red-500 text-sm font-mono">
                  {recordingTime}s/10s
                </span>
              )}

              {/* Input de Texto */}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 input-field"
              />

              {/* Enviar */}
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-secondary px-4 py-2"
              >
                📤
              </button>
            </form>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-4 z-10">
                <emoji-picker onEmojiClick={handleEmojiSelect}></emoji-picker>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedUser.isPremium && '⭐'} {selectedUser.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {selectedUser.isPremium ? 'Usuário Premium' : 'Visitante Gratuito'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-red-500 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Fotos */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">📸 Fotos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedUser.photos.slice(0, user.isPremium ? 5 : 1).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                  {!user.isPremium && selectedUser.photos.length > 1 && (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">+{selectedUser.photos.length - 1} fotos</p>
                        <button onClick={handlePremiumClick} className="btn-premium text-xs px-2 py-1">
                          Premium
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h4 className="font-semibold mb-2">📝 Sobre</h4>
                <p className="text-gray-700 text-sm">
                  {user.isPremium
                    ? selectedUser.description
                    : selectedUser.description.substring(0, selectedUser.description.length / 2) + '...'
                  }
                </p>
                {!user.isPremium && (
                  <div className="mt-2 text-center">
                    <button onClick={handlePremiumClick} className="btn-premium text-sm">
                      ⭐ Ver descrição completa - SEJA PREMIUM
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;