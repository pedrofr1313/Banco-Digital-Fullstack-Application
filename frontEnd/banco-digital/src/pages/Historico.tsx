import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, ArrowUpRight, ArrowDownLeft, User, Clock } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { Link } from 'react-router-dom';
import Navbar from "@/components/ui/Navbar";
import { BanknoteArrowUp,BanknoteArrowDown } from 'lucide-react';

interface OutroUsuario {
  id: number;
  nome: string;
  email: string;
  idFiscal: string | null;
}

interface Transacao {
  id: number;
  dataTransacao: string;
  valor: number;
  descricao: string;
  tipoTransacao: "ENVIADA" | "RECEBIDA";
  outroUsuario: OutroUsuario;
}

interface HistoricoResponse {
  content: Transacao[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

const Historico = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [transacoesFiltradas, setTransacoesFiltradas] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'ENVIADA' | 'RECEBIDA'>('TODAS');

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await apiClient.get('/api/transacoes/historico');
        if (response.success) {
          setTransacoes(response.data.content);
          setTransacoesFiltradas(response.data.content);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  useEffect(() => {
    let filtradas = transacoes;

   
    if (filtroTipo !== 'TODAS') {
      filtradas = filtradas.filter(transacao => transacao.tipoTransacao === filtroTipo);
    }

    
    if (searchTerm !== '') {
      filtradas = filtradas.filter(transacao =>
        transacao.outroUsuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transacao.outroUsuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transacao.outroUsuario.idFiscal && transacao.outroUsuario.idFiscal.includes(searchTerm))
      );
    }

    setTransacoesFiltradas(filtradas);
  }, [searchTerm, filtroTipo, transacoes]);

  const formatarData = (dataTransacao: string) => {
    const data = new Date(dataTransacao);
   
    const dataAjustada = new Date(data.getTime() - (3 * 60 * 60 * 1000));
    return dataAjustada.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatIdFiscal = (idFiscal: string | null) => {
    if (!idFiscal) return '';
    if (idFiscal.length === 11) {
     
      return idFiscal.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (idFiscal.length === 14) {
    
      return idFiscal.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return idFiscal;
  };

  return (
    <div className="min-h-screen">
     
      <Navbar />

     
      <div className="pt-20 px-6 max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-6 justify-between">
          <div className="flex items-center gap-2">
            <Link 
              to="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Histórico</h1>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center w-md">
            <Search size={20} className="text-gray-400 mr-1" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-2 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

       
        <div className="flex md:hidden justify-center items-center mb-3">
          <Search size={20} className="text-gray-400 mr-1" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-2 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

      
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFiltroTipo('TODAS')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filtroTipo === 'TODAS'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroTipo('ENVIADA')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filtroTipo === 'ENVIADA'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Enviadas
            </button>
            <button
              onClick={() => setFiltroTipo('RECEBIDA')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filtroTipo === 'RECEBIDA'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Recebidas
            </button>
          </div>
        </div>

       
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Suas transferências'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {transacoesFiltradas.length} transação(ões) encontrada(s)
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : transacoesFiltradas.length > 0 ? (
              transacoesFiltradas.map((transacao) => (
                <div
                  key={transacao.id}
                  className="p-4  transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transacao.tipoTransacao === 'ENVIADA' 
                        ? 'bg-neutral-100' 
                        : 'bg-green-100'
                    }`}>
                      {transacao.tipoTransacao === 'ENVIADA' ? (
                        <BanknoteArrowUp size={18} className="" />
                      ) : (
                        <BanknoteArrowDown size={18} className="text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex justify-start items-start flex-col">
                          <h4 className="font-medium text-gray-900 pr-6">
                            {transacao.tipoTransacao === 'ENVIADA' ? 'Para: ' :'De: '}
                            {transacao.outroUsuario.nome}
                          </h4>
                          <p className="text-sm text-gray-500">{transacao.outroUsuario.email}</p>
                          {transacao.outroUsuario.idFiscal && (
                            <p className="text-xs text-gray-400">
                              {formatIdFiscal(transacao.outroUsuario.idFiscal)}
                            </p>
                          )}
                            {transacao.descricao && (
                   <p className="text-sm text-gray-500">Descrição: {transacao.descricao}</p>
                      )}
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transacao.tipoTransacao === 'ENVIADA' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {transacao.tipoTransacao === 'ENVIADA' ? '-' : '+'}
                            {formatarValor(transacao.valor)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatarData(transacao.dataTransacao)}
                          </p>
                        </div>
                      </div>
                      
                    
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">Nenhuma transferência encontrada</p>
                <p className="text-sm">
                  {searchTerm || filtroTipo !== 'TODAS' 
                    ? 'Tente ajustar os filtros de pesquisa' 
                    : 'Você ainda não realizou nenhuma transferência'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historico;