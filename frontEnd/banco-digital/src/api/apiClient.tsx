import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
// 🔗 Base URL (ajustável conforme ambiente)
const getBaseUrl = () => {
  return 'http://localhost:8080';
};

export const BASE_URL = getBaseUrl();

// ✅ Headers padrão
const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

// 🔧 Instância do Axios
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: defaultHeaders,
  // 🍪 CRÍTICO: Habilita envio de cookies
  withCredentials: true
});

// 🛠️ Tipagem de resposta padronizada
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data?: T;
  headers?: any;
  error?: {
    message: string;
    code: string | null;
    details: any;
    original: any;
  };
}

// 🚩 Função para tratar mensagens de erro amigáveis
const getUserFriendlyErrorMessage = (
  errordata:any
): string => {
  // Adicionar mensagens específicas para problemas de autenticação
    if (errordata?.message) {
  return errordata.message;
    }
  return 'Ocorreu um erro. Por favor, tente novamente.';
};

// 📦 Formata resposta de sucesso
const formatResponse = (response: AxiosResponse): ApiResponse => {
  return {
    success: true,
    status: response.status,
    data: response.data,
    headers: response.headers
  };
};

// 🚫 Formata resposta de erro
const formatError = (error: AxiosError): ApiResponse => {
  console.log('API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    error: error.message,
    body: error.response?.data,
    status: error.response?.status,
    // Debug para cookies
    withCredentials: error.config?.withCredentials
  });

  let errorMessage = 'Erro de conexão com o servidor';
  let statusCode = error.response?.status || 500;
  let errorCode: string | null = null;
  let errorDetails = null;

  if (error.response) {
    const errorData = error.response.data as any;


    errorMessage = getUserFriendlyErrorMessage(errorData);
  }

  return {
    success: false,
    status: statusCode,
    error: {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      original: error
    }
  };
};

// 🚀 Cliente API
export const apiClient = {
  get: async <T = any>(
    endpoint: string,
    options?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get<T>(endpoint, {
        ...options,
        // Garante que withCredentials está sempre ativo
        withCredentials: true
      });
      return formatResponse(response);
    } catch (error: any) {
      return formatError(error);
    }
  },

  post: async <T = any>(
    endpoint: string,
    data: any = {},
    options?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.post<T>(endpoint, data, {
        ...options,
        withCredentials: true,
        headers: {
          ...defaultHeaders,
          ...(options?.headers || {})
        }
      });
      return formatResponse(response);
    } catch (error: any) {
      return formatError(error);
    }
  },

  put: async <T = any>(
    endpoint: string,
    data: any = {},
    options?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put<T>(endpoint, data, {
        ...options,
        withCredentials: true,
        headers: {
          ...defaultHeaders,
          ...(options?.headers || {})
        }
      });
      return formatResponse(response);
    } catch (error: any) {
      return formatError(error);
    }
  },

  patch: async <T = any>(
    endpoint: string,
    data: any = {},
    options?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const isFormData = data instanceof FormData;

      const response = await axiosInstance.patch<T>(endpoint, data, {
        ...options,
        withCredentials: true,
        headers: {
          ...(isFormData ? {} : defaultHeaders),
          ...(options?.headers || {})
        }
      });
      return formatResponse(response);
    } catch (error: any) {
      return formatError(error);
    }
  },

  delete: async <T = any>(
    endpoint: string,
    options?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.delete<T>(endpoint, {
        ...options,
        withCredentials: true
      });
      return formatResponse(response);
    } catch (error: any) {
      return formatError(error);
    }
  },

  getErrorMessage: (error: any): string => {
    if (!error) return 'Erro desconhecido';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error?.message) return error.error.message;
    return 'Ocorreu um erro. Tente novamente.';
  }
};