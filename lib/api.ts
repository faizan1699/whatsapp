import axios from 'axios';
import { supabase } from './supabaseClient';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: Participant[];
  last_message?: Message;
  unread_count?: number;
}

export interface Participant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  user?: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'video';
  reply_to_id?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: User;
  reply_to?: Message;
  status?: MessageStatus[];
}

export interface MessageStatus {
  id: string;
  message_id: string;
  user_id: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
  user?: User;
}

// API Functions
export const apiClient = {
  // Auth
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, metadata?: { full_name?: string; username?: string }) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Profiles
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },

  // Conversations
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(
          id,
          name,
          is_group,
          avatar_url,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .order('conversations(updated_at)', { ascending: false });
    
    if (error) throw error;
    
    const conversations = data?.map((item: any) => ({
      ...item.conversations,
      participants: undefined // Will be fetched separately
    })) || [];
    
    return conversations;
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          *,
          user:profiles(*)
        )
      `)
      .eq('id', conversationId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createConversation(name: string, isGroup: boolean, participantIds: string[]): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        name: isGroup ? name : null,
        is_group: isGroup,
        created_by: user.id
      })
      .select()
      .single();
    
    if (convError) throw convError;
    
    // Add participants
    const participants = [...participantIds, user.id].map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: user.id === userId ? 'admin' : 'member'
    }));
    
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants);
    
    if (partError) throw partError;
    
    return conversation;
  },

  async getOrCreateDirectConversation(user1Id: string, user2Id: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_or_create_direct_conversation', { 
        user1_id: user1Id, 
        user2_id: user2Id 
      });
    
    if (error) throw error;
    return data;
  },

  // Messages
  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(*),
        reply_to:messages(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data?.reverse() || [];
  },

  async sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' | 'voice' | 'video' = 'text', replyToId?: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: type,
        reply_to_id: replyToId
      })
      .select(`
        *,
        sender:profiles(*),
        reply_to:messages(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);
    
    if (error) throw error;
  },

  // Typing indicators
  async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      });
  },

  // Real-time subscriptions
  subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToConversations(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations'
        }, 
        callback
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToTyping(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`typing:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        callback
      )
      .subscribe();
  },

  unsubscribe(subscription: any) {
    supabase.removeChannel(subscription);
  }
};

export default api;
