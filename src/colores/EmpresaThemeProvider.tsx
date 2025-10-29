// src/colores/EmpresaThemeProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useEmpresaTheme } from './useEmpresaTheme';
import { categoryStyles, CategoryKey } from './categoryStyles';

// Definimos la forma del contexto
interface EmpresaThemeContextProps {
  theme: CategoryKey;
  styles: (typeof categoryStyles)[CategoryKey];
  loading: boolean;
  error: string | null;
}

// Creamos el contexto con valores por defecto
const EmpresaThemeContext = createContext<EmpresaThemeContextProps>({
  theme: 'otros',
  styles: categoryStyles['otros'],
  loading: true,
  error: null
});

// Provider que envuelve la app
export const EmpresaThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ✅ Llamada al hook SIN argumentos
  const { theme, styles, loading, error } = useEmpresaTheme();

  return (
    <EmpresaThemeContext.Provider value={{ theme, styles, loading, error }}>
      {children}
    </EmpresaThemeContext.Provider>
  );
};

// Hook para consumir el contexto desde cualquier componente
export const useEmpresaThemeContext = () => useContext(EmpresaThemeContext);
