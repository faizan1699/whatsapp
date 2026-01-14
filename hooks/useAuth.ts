import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

interface UseAuthReturn {
  user: any;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; username?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.signIn(email, password);
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const signUp = useCallback(async (email: string, password: string, metadata?: { full_name?: string; username?: string }) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.signUp(email, password, metadata);
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };
};
