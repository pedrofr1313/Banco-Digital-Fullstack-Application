import { useState, useEffect } from "react";
import {  ArrowUpRight, Eye, EyeOff,Banknote,UserRound } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { Link } from 'react-router-dom';
import Navbar from "@/components/ui/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types/Types";

const DashBoard = () => {
  
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const {  user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        
        const userId = localStorage.getItem('id');
        if (!userId) {
          console.error('ID do usuário não encontrado no localStorage');
          return;
        }

        const response = await apiClient.get(`/usuarios/${userId}`);
        if (response.success) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

 

  const formatCurrency = (value:any) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen">
      
      <Navbar/>

      
      <div className="pt-20 px-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Olá, {userData?.nome || user?.nome || 'Usuário'}
                </h1>
                <p className="text-gray-500 text-sm">Gerencie suas finanças!</p>
              </div>

             
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Saldo disponível</p>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {showBalance 
                        ? formatCurrency(userData?.saldo || 0) 
                        : '••••••'
                      }
                    </h2>
                  </div>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

           
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="flex justify-center md:gap-10 ">
                
                 <Link to="/transferir">
                 
                <button className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-50 transition-colors">
                    <ArrowUpRight size={20} className="text-gray-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Transferir</span>
                </button>
                </Link>

                <Link to='/historico'>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                    <Banknote size={20}></Banknote>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Histórico</span>
                </button>
                </Link>

                <Link to={`/perfil/${userData?.id || user?.id}`}>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                    <UserRound size={20} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Perfil</span>
                </button>
                </Link>

                
              </div>
            </div>

           
            
          </>
        )}
      </div>

      
     
    </div>
  );
};

export default DashBoard;