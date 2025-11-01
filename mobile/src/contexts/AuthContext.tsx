import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromToken, getToken, TokenPayload } from '../services/auth';

interface AuthContextType {
  user: TokenPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await getToken();
      const userData = await getUserFromToken();
      
      if (storedToken && userData) {
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { login: loginService } = await import('../services/auth');
    const newToken = await loginService(email, password);
    const userData = await getUserFromToken();
    if (userData) {
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    const { logout: logoutService } = await import('../services/auth');
    await logoutService();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

