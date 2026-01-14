import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

interface UseProfileParams {
  userId?: string;
  autoUpdate?: boolean;
}

interface UseProfileReturn {
  profile: any;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: any) => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (params: UseProfileParams = {}): UseProfileReturn => {
  const { userId, autoUpdate = true } = params;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProfile(userId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: any) => {
    if (!userId) return;
    
    try {
      setError(null);
      const updatedProfile = await apiClient.updateProfile(userId, updates);
      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const searchUsers = useCallback(async (query: string) => {
    try {
      setError(null);
      const users = await apiClient.searchUsers(query);
      return users;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (userId && autoUpdate) {
      refreshProfile();
    }
  }, [userId, autoUpdate, refreshProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    searchUsers,
    refreshProfile,
  };
};
