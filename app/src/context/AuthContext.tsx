import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken } from '../api';
import { Usuario } from '../types';

const TOKEN_KEY = '@mandadero_token';
const REFRESH_KEY = '@mandadero_refresh';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, refresh: string, usuario: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    refreshToken: null,
    usuario: null,
    loading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const [token, refresh] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_KEY),
      ]);
      if (token && refresh) {
        setToken(token);
        setState((s) => ({ ...s, token, refreshToken: refresh, loading: false }));
        try {
          const { token: newToken, refresh_token: newRefresh } = await api.auth.refresh(refresh);
          await Promise.all([
            AsyncStorage.setItem(TOKEN_KEY, newToken),
            AsyncStorage.setItem(REFRESH_KEY, newRefresh),
          ]);
          setToken(newToken);
          setState((s) => ({ ...s, token: newToken, refreshToken: newRefresh }));
        } catch {
          await clearAuth();
        }
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }

  const clearAuth = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_KEY),
    ]);
    setToken(null);
    setState({ token: null, refreshToken: null, usuario: null, loading: false });
  }, []);

  const login = useCallback(async (token: string, refresh: string, usuario: Usuario) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(REFRESH_KEY, refresh),
    ]);
    setToken(token);
    setState({ token, refreshToken: refresh, usuario, loading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.refreshToken) await api.auth.logout(state.refreshToken);
    } catch {}
    await clearAuth();
  }, [state.refreshToken, clearAuth]);

  const refreshAuth = useCallback(async () => {
    if (!state.refreshToken) return;
    try {
      const { token, refresh_token } = await api.auth.refresh(state.refreshToken);
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(REFRESH_KEY, refresh_token),
      ]);
      setToken(token);
      setState((s) => ({ ...s, token, refreshToken: refresh_token }));
    } catch {
      await clearAuth();
    }
  }, [state.refreshToken, clearAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
