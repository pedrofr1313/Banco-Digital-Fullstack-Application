import  { useState, useEffect } from "react";
import { Search, X, ArrowLeft, Send, User } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "@/components/ui/Navbar";
import { BanknoteArrowUp } from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  idFiscal: string;
}

const Transferir = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await apiClient.get('/usuarios');
        if (response.success) {
          setClientes(response.data);
          clientes.filter(cliente => cliente.id !== Number(localStorage.getItem('id')));
          setClientesFiltrados(clientes);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.idFiscal.includes(searchTerm)
      );
      setClientesFiltrados(filtrados);
    }
  }, [searchTerm, clientes]);

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setClienteSelecionado(null);
    setValor('');
    setDescricao('');
  };

  const formatIdFiscal = (idFiscal: string) => {
    if (idFiscal.length === 11) {
      return idFiscal.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (idFiscal.length === 14) {
      return idFiscal.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return idFiscal;
  };

  const handleEnviarTransferencia = async () => {
    if (!clienteSelecionado || !valor || !descricao) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    setEnviando(true);
    console.log('Enviando transferência para:', clienteSelecionado.id, 'Valor:', valorNumerico, 'Descrição:', descricao);
    try {
      const response = await apiClient.post('api/transacoes/realizar', {
        idDestinatario: clienteSelecionado.id,
        valor: valorNumerico,
        descricao: descricao
      });

      if (response.success) {
        alert('Transferência realizada com sucesso!');
        navigate('/');
      } else {
        const errorMessage =  response.error?.message || 'Erro ao criar conta';
        alert('Erro ao realizar transferência:'+ errorMessage);
      }
    } catch (error) {
      console.error('Erro ao realizar transferência:', error);
      alert('Erro ao realizar transferência');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Conteúdo Principal */}
      <div className="pt-20 px-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 justify-between">
          <div className="flex items-center gap-2">
          <Link 
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
              <BanknoteArrowUp size={20} className="text-gray-600 bg-neutral-200" />
            </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Transferir</h1>
          </div>
          </div>

           <div className="hidden md:flex justify-center items-center w-md">
            <Search size={20} className="text-gray-400 mr-1" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-2 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Barra de Pesquisa */}
       
         <div className="flex md:hidden justify-center items-center mb-3">
            <Search size={20} className="text-gray-400 mr-1" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-2 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        

        {/* Lista de Clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos os clientes'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {clientesFiltrados.length-1} cliente(s) encontrado(s)
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <div>
                    { cliente.id !== Number(localStorage.getItem('id')) &&
                <div
                  key={cliente.id}
                  onClick={() => handleSelecionarCliente(cliente)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{cliente.nome}</h4>
                      <p className="text-sm text-gray-500">{cliente.email}</p>
                      <p className="text-xs text-gray-400">{formatIdFiscal(cliente.idFiscal)}</p>
                    </div>
                  </div>
                </div>
                }
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Transferência */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Transferência</h3>
              <button
                onClick={handleFecharModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {clienteSelecionado && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Destinatário:</p>
                <p className="font-medium text-gray-900">{clienteSelecionado.nome}</p>
                <p className="text-sm text-gray-500">{clienteSelecionado.email}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  placeholder="Descreva o motivo da transferência"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleFecharModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarTransferencia}
                disabled={enviando}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transferir;