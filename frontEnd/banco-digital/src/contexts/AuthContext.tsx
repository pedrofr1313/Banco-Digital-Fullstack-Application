import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/Types';
import { apiClient } from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
} 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Sempre começar com loading true
      setLoading(true);
      
      const userData = localStorage.getItem('id');
      
      try {
        const response = await apiClient.get('/auth/verify',{withCredentials: true});

        if (response.success && userData) {
          setIsAuthenticated(true);
        } else {
          // Limpar estado se não autenticado
          setIsAuthenticated(false);
          setUser(null);
          if (userData) {
            localStorage.removeItem('id');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('id');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      checkAuthStatus();
    }
  }, [initialized]);

  const login = (userData: User) => {
    localStorage.setItem('id', JSON.stringify(userData.id));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Opcional: chamar endpoint de logout no servidor
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('id');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};