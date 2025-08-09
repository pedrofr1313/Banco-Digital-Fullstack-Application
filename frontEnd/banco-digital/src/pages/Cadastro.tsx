import React, { useState } from 'react';
import type {FormEvent }from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  idFiscal: string;
  dataNascimento: string;
  rendaMensal: number;
}

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState<CadastroData>({
    nome: '',
    email: '',
    senha: '',
    idFiscal: '',
    dataNascimento: '',
    rendaMensal: 0
  });
  const [showSenha, setShowSenha] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tipoDocumento, setTipoDocumento] = useState<'cpf' | 'cnpj'>('cpf');

  const navigate = useNavigate();

  const handleInputChange = (field: keyof CadastroData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'rendaMensal' ? Number(e.target.value) : e.target.value;
      setFormData({ ...formData, [field]: value });
      // Limpa os erros quando o usuário começa a digitar
      if (error) setError('');
      if (success) setSuccess('');
    };

  const formatDocument = (value: string, tipo: 'cpf' | 'cnpj'): string => {
    const digits = value.replace(/\D/g, '');
    if (tipo === 'cpf' && digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (tipo === 'cnpj' && digits.length <= 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      idFiscal: digits
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const toggleSenhaVisibility = (): void => {
    setShowSenha(!showSenha);
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    const expectedLength = tipoDocumento === 'cpf' ? 11 : 14;
    if (formData.idFiscal.length !== expectedLength) {
      setError(`${tipoDocumento.toUpperCase()} deve ter ${expectedLength} dígitos`);
      return false;
    }
    
    if (!formData.dataNascimento) {
      setError(`Data de nascimento/fundação é obrigatória`);
      return false;
    }
    if (formData.rendaMensal <= 0) {
      setError('Renda mensal deve ser maior que zero');
      return false;
    }
    return true;
  };

  const isFormValid = (): boolean => {
    const expectedLength = tipoDocumento === 'cpf' ? 11 : 14;
    return formData.nome.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.senha.trim() !== '' &&
           formData.idFiscal.length === expectedLength &&
           formData.dataNascimento !== '' &&
           formData.rendaMensal > 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/usuarios/usuario', formData);
      
      if (response.success) {
        alert('Conta criada com sucesso!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Captura o erro do backend quando response.success é false
        const errorMessage =  response.error?.message || 'Erro ao criar conta';
        console.log("ERRO BACKEND:", errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      // Captura erros de requisição (status 4xx, 5xx, etc.)
      const errorMessage = err.message || 'Erro interno do servidor. Tente novamente.';
      console.log("ERRO CATCH:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className='w-full flex justify-center'>
    <div className='min-h-screen bg-white flex items-center justify-center md:w-lg px-4 sm:px-6 lg:px-8 py-12'>
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <p className=" text-4xl font-bold text-gray-900">
              Criar Conta
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Preencha os dados para criar sua conta
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base text-red-700">{error}</span>
          </div>
        )}

        {/* Card de Cadastro */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg text-center">
              Informações pessoais
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-center">
              Todos os campos são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Tipo de Cadastro */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Tipo de Cadastro
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoDocumento"
                      value="cpf"
                      checked={tipoDocumento === 'cpf'}
                      onChange={(e) => setTipoDocumento(e.target.value as 'cpf' | 'cnpj')}
                      className="mr-2"
                    />
                    <span className="text-sm">Pessoa Física (CPF)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoDocumento"
                      value="cnpj"
                      checked={tipoDocumento === 'cnpj'}
                      onChange={(e) => setTipoDocumento(e.target.value as 'cpf' | 'cnpj')}
                      className="mr-2"
                    />
                    <span className="text-sm">Pessoa Jurídica (CNPJ)</span>
                  </label>
                </div>
              </div>

              {/* Campo Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  {tipoDocumento === 'cpf' ? 'Nome Completo' : 'Razão Social'}
                </label>
                <Input
                  type="text"
                  placeholder={tipoDocumento === 'cpf' ? 'Digite seu nome completo' : 'Digite a razão social'}
                  value={formData.nome}
                  onChange={handleInputChange('nome')}
                  className="border-gray-300 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
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
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha}
                    onChange={handleInputChange('senha')}
                    className="border-gray-300 text-sm sm:text-base pr-10"
                    required
                  />
                  <Button
                    type="button"
                    onClick={toggleSenhaVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Campo CPF/CNPJ */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  {tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'}
                </label>
                <Input
                  type="text"
                  placeholder={tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={formatDocument(formData.idFiscal, tipoDocumento)}
                  onChange={handleDocumentChange}
                  className="border-gray-300 text-sm sm:text-base"
                  maxLength={tipoDocumento === 'cpf' ? 14 : 18}
                  required
                />
              </div>


              {/* Campo Data */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  {tipoDocumento === 'cpf' ? 'Data de Nascimento' : 'Data de Fundação'}
                </label>
                <Input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleInputChange('dataNascimento')}
                  className="border-gray-300 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Campo Renda Mensal */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  {tipoDocumento === 'cpf' ? 'Renda Mensal (R$)' : 'Faturamento Mensal (R$)'}
                </label>
                <Input
                  type="number"
                  placeholder="0,00"
                  min="1"
                  step="0.01"
                  value={formData.rendaMensal || ''}
                  onChange={handleInputChange('rendaMensal')}
                  className="border-gray-300 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Botão de Cadastro */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full text-sm sm:text-base py-2.5 flex justify-center items-center rounded-lg bg-green-500 hover:bg-green-400 !text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar conta
                    </>
                  )}
                </Button>
              </div>

              {/* Link para Login */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-900 hover:text-blue-700"
                  >
                    Fazer login
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

export default Cadastro;