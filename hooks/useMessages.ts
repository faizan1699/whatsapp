import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, Message, TypingIndicator } from '../lib/api';

interface UseMessagesParams {
  conversationId?: string;
  userId?: string;
  autoLoad?: boolean;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'voice' | 'video', replyToId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  typingUsers: TypingIndicator[];
  setTyping: (isTyping: boolean) => Promise<void>;
  hasMore: boolean;
}

export const useMessages = (params: UseMessagesParams = {}): UseMessagesReturn => {
  const { conversationId, userId, autoLoad = true } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const loadMessages = useCallback(async (reset = false) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const currentOffset = reset ? 0 : offset;
      const newMessages = await apiClient.getMessages(conversationId, 50, currentOffset);
      
      if (reset) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMore(newMessages.length === 50);
      setOffset(currentOffset + newMessages.length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId, offset]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' | 'voice' | 'video' = 'text', replyToId?: string) => {
    if (!conversationId) return;
    
    try {
      setError(null);
      const newMessage = await apiClient.sendMessage(conversationId, content, type, replyToId);
      setMessages(prev => [...prev, newMessage]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [conversationId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await apiClient.deleteMessage(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_deleted: true } : msg
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (hasMore && !loading) {
      await loadMessages(false);
    }
  }, [hasMore, loading, loadMessages]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !userId) return;
    
    try {
      await apiClient.setTyping(conversationId, isTyping);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          apiClient.setTyping(conversationId, false);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error setting typing indicator:', err);
    }
  }, [conversationId, userId]);

  // Load initial messages
  useEffect(() => {
    if (conversationId && autoLoad) {
      loadMessages(true);
    }
  }, [conversationId, autoLoad, loadMessages]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to messages
    const messageSubscription = apiClient.subscribeToMessages(conversationId, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setMessages(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
        ));
      }
    });

    // Subscribe to typing indicators
    const typingSubscription = apiClient.subscribeToTyping(conversationId, (payload: any) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.user_id !== payload.new.user_id);
          if (payload.new.is_typing) {
            return [...filtered, payload.new];
          }
          return filtered;
        });
      }
    });

    return () => {
      apiClient.unsubscribe(messageSubscription);
      apiClient.unsubscribe(typingSubscription);
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    typingUsers,
    setTyping,
    hasMore,
  };
};
