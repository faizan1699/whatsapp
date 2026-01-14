import { useState, useEffect, useCallback } from 'react';
import { apiClient, Conversation } from '../lib/api';

interface UseConversationsParams {
  userId?: string;
  autoRefresh?: boolean;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: () => Promise<void>;
  createConversation: (name: string, isGroup: boolean, participantIds: string[]) => Promise<Conversation>;
  getOrCreateDirectConversation: (userId: string, otherUserId: string) => Promise<string>;
}

export const useConversations = (params: UseConversationsParams = {}): UseConversationsReturn => {
  const { userId, autoRefresh = true } = params;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getConversations(userId);
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createConversation = useCallback(async (name: string, isGroup: boolean, participantIds: string[]) => {
    try {
      setError(null);
      const newConversation = await apiClient.createConversation(name, isGroup, participantIds);
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getOrCreateDirectConversation = useCallback(async (userId: string, otherUserId: string) => {
    try {
      setError(null);
      const conversationId = await apiClient.getOrCreateDirectConversation(userId, otherUserId);
      await refreshConversations();
      return conversationId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [refreshConversations]);

  useEffect(() => {
    if (userId && autoRefresh) {
      refreshConversations();

      // Set up real-time subscription
      const subscription = apiClient.subscribeToConversations(userId, (payload) => {
        refreshConversations();
      });

      return () => {
        apiClient.unsubscribe(subscription);
      };
    }
  }, [userId, autoRefresh, refreshConversations]);

  return {
    conversations,
    loading,
    error,
    refreshConversations,
    createConversation,
    getOrCreateDirectConversation,
  };
};
