import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/Types';
import { apiClient } from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  userType: 'PF' | 'PJ' | null; // Novo campo
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

// Função para determinar tipo de usuário baseado no idFiscal
const getUserType = (idFiscal: string): 'PF' | 'PJ' => {
  // Remove caracteres não numéricos para verificar o tamanho
  const cleanIdFiscal = idFiscal.replace(/\D/g, '');
  
  // CPF tem 11 dígitos, CNPJ tem 14 dígitos
  return cleanIdFiscal.length === 11 ? 'PF' : 'PJ';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [userType, setUserType] = useState<'PF' | 'PJ' | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Sempre começar com loading true
      setLoading(true);
      
      const userData = localStorage.getItem('id');
      const storedUserType = localStorage.getItem('userType') as 'PF' | 'PJ' | null;
      
      try {
        const response = await apiClient.get('/auth/verify', { withCredentials: true });

        if (response.success && userData) {
          setIsAuthenticated(true);
          
          // Se temos o tipo armazenado, usar ele
          if (storedUserType) {
            setUserType(storedUserType);
          }
          
          // Buscar dados do usuário para determinar/confirmar o tipo
          try {
            const userResponse = await apiClient.get(`/usuarios/${JSON.parse(userData)}`);
            if (userResponse.success && userResponse.data.idFiscal) {
              const detectedType = getUserType(userResponse.data.idFiscal);
              setUserType(detectedType);
              localStorage.setItem('userType', detectedType);
              setUser(userResponse.data);
            }
          } catch (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
          }
        } else {
          // Limpar estado se não autenticado
          setIsAuthenticated(false);
          setUser(null);
          setUserType(null);
          if (userData) {
            localStorage.removeItem('id');
            localStorage.removeItem('userType');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
        setUserType(null);
        localStorage.removeItem('id');
        localStorage.removeItem('userType');
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
    
    // Determinar e armazenar o tipo de usuário
    if (userData.idFiscal) {
      const type = getUserType(userData.idFiscal);
      setUserType(type);
      localStorage.setItem('userType', type);
    }
    
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
      localStorage.removeItem('userType'); // Remove o tipo de usuário
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    userType, // Novo campo no contexto
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};