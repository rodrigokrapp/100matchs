import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  room_id: string;
  user_name: string;
  content: string;
  message_type: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji';
  is_premium: boolean;
  is_temporary?: boolean;
  expires_at?: string;
  viewed_by?: string[];
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  users_online: number;
}

class ChatService {
  private channel: RealtimeChannel | null = null;
  private currentRoom: string | null = null;
  private messageCallback: ((message: ChatMessage) => void) | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  // Inicializar tabelas no Supabase (executar uma única vez)
  async initializeTables() {
    try {
      console.log('🔧 Inicializando tabelas do chat...');
      
      // Tentar acessar as tabelas para verificar se existem
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1);
      
      if (messagesError) {
        console.log('📝 Tabelas não encontradas, usando sistema local temporário');
      } else {
        console.log('✅ Tabelas do chat encontradas e funcionando');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar tabelas:', error);
      return false;
    }
  }

  // Conectar a uma sala de chat com melhor gerenciamento
  async joinRoom(roomId: string, onMessageReceived: (message: ChatMessage) => void) {
    try {
      console.log(`🚀 Conectando à sala ${roomId}...`);
      
      // Desconectar canal anterior se existir
      if (this.channel) {
        await this.leaveRoom();
      }

      this.currentRoom = roomId;
      this.messageCallback = onMessageReceived;

      // Conectar ao canal da sala específica com configurações otimizadas
      this.channel = supabase
        .channel(`room-${roomId}`, {
          config: {
            presence: {
              key: `user-${Date.now()}`
            },
            broadcast: {
              self: true,
              ack: true
            }
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            console.log('💬 Nova mensagem via PostgreSQL:', payload.new);
            const message = payload.new as ChatMessage;
            if (message && this.messageCallback) {
              this.messageCallback(message);
            }
          }
        )
        .on('broadcast', { event: 'message' }, (payload) => {
          console.log('📡 Nova mensagem via broadcast:', payload);
          if (payload.payload && this.messageCallback) {
            this.messageCallback(payload.payload as ChatMessage);
          }
        })
        .subscribe((status, err) => {
          console.log(`📡 Status da conexão sala ${roomId}:`, status);
          
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            console.log(`✅ Conectado com sucesso à sala ${roomId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Erro no canal:', err);
            this.handleReconnect();
          } else if (status === 'TIMED_OUT') {
            console.warn('⏰ Timeout na conexão, tentando reconectar...');
            this.handleReconnect();
          }
        });

      // Simular presença na sala
      await this.updateUserPresence(roomId, true);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar à sala:', error);
      return false;
    }
  }

  // Lidar com reconexão automática
  private handleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      if (this.currentRoom && this.messageCallback) {
        console.log('🔄 Tentando reconectar...');
        await this.joinRoom(this.currentRoom, this.messageCallback);
      }
    }, 3000);
  }

  // Atualizar presença do usuário na sala
  private async updateUserPresence(roomId: string, isOnline: boolean) {
    try {
      if (this.channel) {
        const status = isOnline ? 'online' : 'offline';
        await this.channel.track({
          status,
          room_id: roomId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar presença:', error);
    }
  }

  // Desconectar da sala
  async leaveRoom() {
    try {
      if (this.currentRoom) {
        await this.updateUserPresence(this.currentRoom, false);
      }

      if (this.channel) {
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.currentRoom = null;
      this.messageCallback = null;
      this.isConnected = false;
      
      console.log('📴 Desconectado da sala com sucesso');
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }

  // Buscar mensagens existentes da sala
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100); // Aumentado para mostrar mais mensagens

      if (error) {
        console.warn('⚠️ Erro ao buscar mensagens do Supabase, usando mock:', error);
        return this.getMockMessages(roomId);
      }

      const messages = data || [];
      console.log(`📚 Carregadas ${messages.length} mensagens da sala ${roomId}`);
      return messages;
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return this.getMockMessages(roomId);
    }
  }

  // Enviar mensagem com múltiplos canais para garantir entrega
  async sendMessage(
    roomId: string,
    userName: string,
    content: string,
    messageType: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji' = 'texto',
    isPremium: boolean = false,
    isTemporary: boolean = false,
    duration: number = 10
  ): Promise<boolean> {
    try {
      const expiresAt = isTemporary ? new Date(Date.now() + duration * 1000).toISOString() : undefined;
      
      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        room_id: roomId,
        user_name: userName,
        content,
        message_type: messageType,
        is_premium: isPremium,
        is_temporary: isTemporary,
        expires_at: expiresAt,
        viewed_by: [],
        created_at: new Date().toISOString(),
      };

      console.log('📤 Enviando mensagem:', message);

      // Tentar múltiplos métodos de envio para garantir entrega
      let success = false;

      // Método 1: Inserir no Supabase (PostgreSQL)
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert([message]);

        if (!error) {
          success = true;
          console.log('✅ Mensagem enviada via PostgreSQL');
        }
      } catch (dbError) {
        console.warn('⚠️ Falha no envio via PostgreSQL:', dbError);
      }

      // Método 2: Broadcast direto para usuários conectados
      if (this.channel && this.isConnected) {
        try {
          await this.channel.send({
            type: 'broadcast',
            event: 'message',
            payload: message
          });
          success = true;
          console.log('✅ Mensagem enviada via broadcast');
        } catch (broadcastError) {
          console.warn('⚠️ Falha no broadcast:', broadcastError);
        }
      }

      // Método 3: Fallback local
      if (!success) {
        console.log('🔄 Usando fallback local para mensagem');
        this.simulateMessage(message);
        success = true;
      }

      return success;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  // Simular mensagem local (para funcionar offline ou como fallback)
  private simulateMessage(message: ChatMessage) {
    // Broadcast local da mensagem para o próprio usuário
    if (this.messageCallback) {
      setTimeout(() => {
        this.messageCallback!(message);
      }, 100);
    }

    // Event para outros listeners
    const event = new CustomEvent('local-message', { detail: message });
    window.dispatchEvent(event);
  }

  // Mensagens mock para funcionar offline
  private getMockMessages(roomId: string): ChatMessage[] {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        room_id: roomId,
        user_name: 'Ana',
        content: 'Oi pessoal! Alguém aí da região?',
        message_type: 'texto',
        is_premium: false,
        created_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        room_id: roomId,
        user_name: 'Carlos_Premium',
        content: 'Eu moro perto! Vamos tomar um café? ☕',
        message_type: 'texto',
        is_premium: true,
        created_at: new Date(Date.now() - 240000).toISOString(),
      },
      {
        id: '3',
        room_id: roomId,
        user_name: 'Maria',
        content: '🎉',
        message_type: 'emoji',
        is_premium: false,
        created_at: new Date(Date.now() - 180000).toISOString(),
      }
    ];

    return mockMessages;
  }

  // Marcar mensagem temporária como visualizada
  async markTemporaryMessageViewed(messageId: string, userName: string): Promise<boolean> {
    try {
      // Buscar a mensagem atual
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError || !message) {
        console.error('❌ Erro ao buscar mensagem:', fetchError);
        return false;
      }

      // Adicionar usuário à lista de visualizadores
      const viewedBy = message.viewed_by || [];
      if (!viewedBy.includes(userName)) {
        viewedBy.push(userName);
      }

      // Atualizar mensagem
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ viewed_by: viewedBy })
        .eq('id', messageId);

      if (updateError) {
        console.error('❌ Erro ao marcar mensagem como visualizada:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar mensagem como visualizada:', error);
      return false;
    }
  }

  // Limpar mensagens temporárias expiradas
  async cleanExpiredMessages(roomId: string) {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('room_id', roomId)
        .eq('is_temporary', true)
        .lt('expires_at', now);

      if (error) {
        console.error('❌ Erro ao limpar mensagens expiradas:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar mensagens expiradas:', error);
    }
  }

  // Filtrar mensagens não expiradas
  filterValidMessages(messages: ChatMessage[]): ChatMessage[] {
    const now = new Date();
    
    return messages.filter(msg => {
      if (!msg.is_temporary) return true;
      if (!msg.expires_at) return true;
      
      const expiresAt = new Date(msg.expires_at);
      return now < expiresAt;
    });
  }

  // Atualizar número de usuários online
  async updateOnlineUsers(roomId: string, count: number) {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .upsert({ id: roomId, users_online: count }, { onConflict: 'id' });

      if (error) {
        console.error('❌ Erro ao atualizar usuários online:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuários online:', error);
    }
  }
}

export const chatService = new ChatService(); 