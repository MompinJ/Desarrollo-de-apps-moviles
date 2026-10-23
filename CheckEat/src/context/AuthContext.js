import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login } from '../services/auth';
import { clearSession, isTokenExpired, loadSession, saveSession } from '../services/sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const saved = await loadSession();
        if (saved?.token && !isTokenExpired(saved.token)) {
          setSession(saved);
        } else if (saved) {
          await clearSession();
        }
      } catch (error) {
        console.warn('No se pudo restaurar la sesion', error);
      } finally {
        setRestoring(false);
      }
    }
    restore();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const next = await login(email, password);
    await saveSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    setSession(null);
    try {
      await clearSession();
    } catch (error) {
      console.warn('No se pudo borrar la sesion guardada', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      usuario: session?.usuario ?? null,
      restoring,
      signIn,
      signOut,
    }),
    [session, restoring, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
