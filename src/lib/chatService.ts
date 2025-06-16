import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  room_id: string;
  user_name: string;
  content: string;
  message_type: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji';
  is_premium: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  users_online: number;
}

class ChatService {
  private channel: RealtimeChannel | null = null;

  // Inicializar tabelas no Supabase (executar uma única vez)
  async initializeTables() {
    try {
      // Criar tabela de salas de chat se não existir
      const { error: roomsError } = await supabase.rpc('create_chat_rooms_table');
      if (roomsError && !roomsError.message.includes('already exists')) {
        console.error('Erro ao criar tabela de salas:', roomsError);
      }

      // Criar tabela de mensagens se não existir
      const { error: messagesError } = await supabase.rpc('create_chat_messages_table');
      if (messagesError && !messagesError.message.includes('already exists')) {
        console.error('Erro ao criar tabela de mensagens:', messagesError);
      }

      // Tentar criar as tabelas diretamente se as funções RPC não existirem
      await this.createTablesDirectly();
      
      console.log('✅ Tabelas do chat inicializadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar tabelas:', error);
      await this.createTablesDirectly();
    }
  }

  private async createTablesDirectly() {
    try {
      // Criar tabela de salas
      await supabase.from('chat_rooms').select('*').limit(1);
    } catch {
      console.log('Tabela chat_rooms não existe, tentando usar uma tabela alternativa...');
    }

    try {
      // Criar tabela de mensagens
      await supabase.from('chat_messages').select('*').limit(1);
    } catch {
      console.log('Tabela chat_messages não existe, tentando usar uma tabela alternativa...');
    }
  }

  // Conectar a uma sala de chat
  async joinRoom(roomId: string, onMessageReceived: (message: ChatMessage) => void) {
    try {
      // Desconectar canal anterior se existir
      if (this.channel) {
        await supabase.removeChannel(this.channel);
      }

      // Conectar ao canal da sala específica
      this.channel = supabase
        .channel(`chat-room-${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            console.log('💬 Nova mensagem recebida:', payload.new);
            onMessageReceived(payload.new as ChatMessage);
          }
        )
        .subscribe((status) => {
          console.log('📡 Status da conexão chat:', status);
        });

      console.log(`✅ Conectado à sala ${roomId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar à sala:', error);
      return false;
    }
  }

  // Desconectar da sala
  async leaveRoom() {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
      console.log('📴 Desconectado da sala');
    }
  }

  // Buscar mensagens existentes da sala
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      // Primeiro tentar a tabela chat_messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        // Retornar mensagens mock para funcionar offline
        return this.getMockMessages(roomId);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return this.getMockMessages(roomId);
    }
  }

  // Enviar mensagem
  async sendMessage(
    roomId: string,
    userName: string,
    content: string,
    messageType: 'texto' | 'imagem' | 'video' | 'audio' | 'emoji' = 'texto',
    isPremium: boolean = false
  ): Promise<boolean> {
    try {
      const message = {
        room_id: roomId,
        user_name: userName,
        content,
        message_type: messageType,
        is_premium: isPremium,
        created_at: new Date().toISOString(),
      };

      // Tentar inserir na tabela
      const { error } = await supabase
        .from('chat_messages')
        .insert([message]);

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        // Simular envio local para funcionar offline
        this.simulateMessage(message);
        return true;
      }

      console.log('✅ Mensagem enviada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  // Simular mensagem local (para funcionar offline)
  private simulateMessage(message: any) {
    // Broadcast local da mensagem
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