import React, { useState } from 'react';
import type {FormEvent }from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button"

interface LoginCredentials {
  email: string;
  senha: string;
}


const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ 
    email: '', 
    senha: '' 
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSenha, setShowSenha] = useState<boolean>(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.success) {
        login(response.data.usuario || response.data);
        navigate("/");
      } else {
        throw new Error(response.data.message || 'Erro ao fazer login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials({ ...credentials, [field]: e.target.value });
      if (error) setError('');
    };

  const toggleSenhaVisibility = (): void => {
    setShowSenha(!showSenha);
  };

  const isFormValid = (): boolean => {
    return credentials.email.trim() !== '' && credentials.senha.trim() !== '';
  };

  return (
    <div className='w-full flex justify-center'>
    <div className='min-h-screen bg-white flex items-center justify-center px-4 md:w-md sm:px-6 lg:px-8 '>
      <div className="w-full max-w-md space-y-4 sm:space-y-6 ">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <p className=" text-4xl font-bold text-gray-900">
              Fazer Login
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base text-red-700">{error}</span>
          </div>
        )}

        {/* Card de Login */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg text-center">
              Entre com suas credenciais
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-center">
              Insira seu email e senha para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  value={credentials.email}
                  onChange={handleInputChange('email')}
                  className="border-gray-300 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showSenha ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={credentials.senha}
                    onChange={handleInputChange('senha')}
                    className="border-gray-300 text-sm sm:text-base pr-10"
                    required
                  />
                  <Button
                    type="button"
                    onClick={toggleSenhaVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center bg-neutral text-gray-500 hover:bg-neutral-200"
                  >
                    {showSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Botão de Login */}
                <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full text-sm sm:text-base py-2.5 !bg-green-500 !hover:bg-green-700 !hover:border-green !text-white"
                 
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </>
                  )}
                </Button>
              </div>
              {/* Link para Cadastro */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    to="/cadastro"
                    className="font-medium text-blue-900 hover:text-blue-700"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Login;