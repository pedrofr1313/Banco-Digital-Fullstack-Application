import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Save, X, UserRound, ArrowLeft, Trash2 } from 'lucide-react';
import { apiClient } from '@/api/apiClient';
import Navbar from '@/components/ui/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/Types';
import type { ChangeEvent } from 'react';
import { formatCurrencyInput, parseCurrencyToNumber, formatCurrency } from '../utils/currencyUtils';
const Perfil = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const{setUser,
      setUserType,
      setIsAuthenticated,} = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  
  const [editData, setEditData] = useState({
    nome: '',
    dataNascimento: '',
    rendaMensal: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!id) {
          console.error('ID do usuário não encontrado na URL');
          navigate('/dashboard');
          return;
        }

        const response = await apiClient.get(`/usuarios/${id}`);
        if (response.success) {
          setUserData(response.data);
          setEditData({
            nome: response.data.nome || '',
            dataNascimento: response.data.dataNascimento 
              ? response.data.dataNascimento.split('T')[0]
              : '',
            rendaMensal: response.data.rendaMensal || 0
          });

          console.log("tamanho:" + response.data.idFiscal.length);
          if(response.data.idFiscal && response.data.idFiscal.length === 11) {
            setTipoDocumento('CPF');
            console.log("CPF");
          } else {
            setTipoDocumento('CNPJ');
            console.log("CNPJ");
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        id: Number(id),
        nome: editData.nome,
        dataNascimento: editData.dataNascimento,
        rendaMensal: Number(editData.rendaMensal)
      };

      const response = await apiClient.patch('/usuarios', payload);
      
      if (response.success) {
       
        setUserData(prev => prev ? {
          ...prev,
          nome: editData.nome,
          dataNascimento: editData.dataNascimento,
          rendaMensal: Number(editData.rendaMensal)
        } : null);
        
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
   
    if (userData) {
      setEditData({
        nome: userData.nome || '',
        dataNascimento: userData.dataNascimento 
          ? userData.dataNascimento.split('T')[0]
          : '',
        rendaMensal: userData.rendaMensal || 0
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      
      const response = await apiClient.delete(`/usuarios/${id}`);
      
      if (response.success) {

        setIsAuthenticated(false);
        setUser(null);
        setUserType(null);
        localStorage.removeItem('id');
        localStorage.removeItem('userType');
        alert('Conta deletada com sucesso.');
        navigate('/login', { 
          replace: true,
          state: { message: 'Conta deletada com sucesso' }
        });
      }
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
     
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    
    const dateParts = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 px-6 max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-20 px-6 max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 justify-center ">
             <button
          onClick={() => navigate(-1)}
          className=" text-gray-600 hover:text-gray-800 mb-4 transition-colors  mt-4"
        >
          <ArrowLeft size={16} />
        </button>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <UserRound size={20} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Meu Perfil</h1>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              <span className="text-sm font-medium">Editar</span>
            </button>
          )}
        </div>

        {/* Card de Informações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Informações Pessoais</h3>
            
            {/* Grid 2 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome 
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                  />
                ) : (
                  <p className="text-gray-900 py-1">{userData?.nome || 'Não informado'}</p>
                )}
              </div>

               
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renda Mensal
                </label>
                {isEditing ? (
                 <input
  type="text"
  value={formatCurrencyInput(editData.rendaMensal || '')}
  onChange={(e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseCurrencyToNumber(e.target.value);
    handleInputChange('rendaMensal', numericValue);
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
  placeholder="0,00"
/>
                ) : (
                   <p className="text-gray-900 py-1">
                    {formatCurrency(userData?.rendaMensal || 0)}
                  </p>
                )}
              </div>

              {/* Data de Nascimento/Fundação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tipoDocumento === 'CPF' ? 'Data de Nascimento' : 'Data de Fundação'} 
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dataNascimento}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 py-1">
                    {formatDate(userData?.dataNascimento || '')}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <p className="text-gray-500 py-1">{userData?.email || 'Não informado'}</p>
              </div>

              {/* CPF/CNPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tipoDocumento === 'CPF' ? 'CPF' : 'CNPJ'} 
                </label>
                <p className="text-gray-500 py-1">{userData?.idFiscal || 'Não informado'}</p>
              </div>

              {/* Saldo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo Atual
                </label>
                <p className="text-green-600 font-medium py-1">
                  {formatCurrency(userData?.saldo || 0)}
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            {isEditing && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  <Save size={16} />
                  <span className="text-sm font-medium">
                    {saving ? 'Salvando...' : 'Salvar'}
                  </span>
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                  <span className="text-sm font-medium">Cancelar</span>
                </button>
              </div>
            )}

            {/* Seção de Zona de Perigo */}
            
          </div>
        </div>

{!isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <Trash2 size={16} />
                  <span className="text-sm font-medium">Deletar Conta</span>
                </button>
              </div>
            )}

      </div>

      {/* Modal de Confirmação de Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Deletar Conta</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar sua conta? Esta ação é permanente e não pode ser desfeita. 
              Todos os seus dados, incluindo histórico de transações e saldo, serão perdidos.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm font-medium">Deletando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span className="text-sm font-medium">Sim, deletar conta</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
              >
                <span className="text-sm font-medium">Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;