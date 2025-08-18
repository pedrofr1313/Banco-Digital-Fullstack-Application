import { useState } from 'react';

// Função para formatar valor para exibição no input
export const formatCurrencyInput = (value: string | number | null | undefined): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Função para formatar valor para exibição (apenas leitura)
export const formatCurrency = (value: string | number | null | undefined): string => {
  if (!value) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `R$ ${numValue.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Função para converter string monetária em número
export const parseCurrencyToNumber = (value: string | number | null | undefined): number => {
  if (!value) return 0;
  const numericValue = value.toString().replace(/\D/g, '');
  return numericValue ? parseFloat(numericValue) / 100 : 0;
};


interface UseCurrencyInputReturn {
  displayValue: string;
  numericValue: number;
  handleChange: (inputValue: string) => number;
  setDisplayValue: (value: string | number) => void;
  setNumericValue: (value: number) => void;
}

// Hook personalizado para inputs monetários
export const useCurrencyInput = (initialValue: string | number = ''): UseCurrencyInputReturn => {
  const [displayValue, setDisplayValue] = useState<string>(formatCurrencyInput(initialValue));
  const [numericValue, setNumericValue] = useState<number>(
    typeof initialValue === 'string' ? parseFloat(initialValue) || 0 : initialValue
  );

  const handleChange = (inputValue: string): number => {
    const numeric = parseCurrencyToNumber(inputValue);
    setNumericValue(numeric);
    setDisplayValue(formatCurrencyInput(numeric));
    return numeric;
  };

  const updateDisplayValue = (value: string | number): void => {
    setDisplayValue(formatCurrencyInput(value));
  };

  const updateNumericValue = (value: number): void => {
    setNumericValue(value);
    setDisplayValue(formatCurrencyInput(value));
  };

  return {
    displayValue,
    numericValue,
    handleChange,
    setDisplayValue: updateDisplayValue,
    setNumericValue: updateNumericValue
  };
};