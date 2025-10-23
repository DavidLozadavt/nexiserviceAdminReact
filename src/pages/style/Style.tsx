// src/colores/useEmpresaTheme.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// Estilos por categoría (todos igual que "otros" excepto TIENDA)
export const categoryStyles = {
  TIENDA: {
    bg: 'bg-gray-100 dark:bg-neutral-900',
    cardBg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-800/50 dark:to-blue-700/50',
    cardHover:
      'hover:from-blue-100 hover:to-white dark:hover:from-blue-900/20 dark:hover:to-neutral-800',
    inputFocus: 'focus:ring-blue-300 focus:border-blue-400',
    button: 'bg-blue-500 hover:bg-blue-600',
    buttonSelect:
      'bg-blue-500 hover:bg-blue-400 border-2 border-neutral-900 dark:border-neutral-50',
    cartBtn:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg',
    price: 'text-blue-600 dark:text-blue-400'
  },
  otros: {
    bg: 'bg-gray-100 dark:bg-neutral-900',
    cardBg: 'bg-gradient-to-br from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-700',
    cardHover:
      'hover:from-gray-100 hover:to-white dark:hover:from-gray-900/20 dark:hover:to-neutral-800',
    inputFocus: 'focus:ring-gray-300 focus:border-gray-400',
    button: 'bg-gray-500 hover:bg-gray-600',
    buttonSelect:
      'bg-gray-500 hover:bg-gray-400 border-2 border-neutral-900 dark:border-neutral-50',
    cartBtn:
      'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg',
    price: 'text-gray-600 dark:text-gray-400'
  },
  BARBERIAS: {
    bg: 'bg-gray-100 dark:bg-neutral-900',
    cardBg: 'bg-gradient-to-br from-red-50 to-white dark:from-red-800/50 dark:to-red-700',
    cardHover:
      'hover:from-red-100 hover:to-white dark:hover:from-red-900/20 dark:hover:to-neutral-800',
    inputFocus: 'focus:ring-red-300 focus:border-red-400',
    button: 'bg-red-500 hover:bg-red-600',
    buttonSelect: 'bg-red-500 hover:bg-red-600 border-2 border-neutral-900 dark:border-neutral-50',
    cartBtn:
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg',
    price: 'text-red-600 dark:text-red-400'
  },
  RESTAURANTES: {
    bg: 'bg-gray-100 dark:bg-neutral-900',
    cardBg:
      'bg-gradient-to-br from-orange-600 to-amber-700 dark:from-orange-800/50 dark:to-orange-700/50',
    cardHover:
      'hover:from-orange-500 hover:to-white dark:hover:from-orange-900/20 dark:hover:to-neutral-800',
    inputFocus: 'focus:ring-orange-300 focus:border-orange-400',
    button: 'bg-orange-500 hover:bg-orange-600',
    buttonSelect:
      'bg-orange-300 hover:bg-orange-400 border-2 border-neutral-900 dark:border-neutral-50',
    cartBtn:
      'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg',
    price: 'text-orange-600 dark:text-orange-400'
  },
  HOTEL: {
    bg: 'bg-gray-100 dark:bg-neutral-900',
    cardBg:
      'bg-gradient-to-br from-purple-50 to-white dark:from-purple-800/50 dark:to-purple-700/50',
    cardHover:
      'hover:from-purple-100 hover:to-white dark:hover:from-purple-900/20 dark:hover:to-neutral-800',
    inputFocus: 'focus:ring-purple-300 focus:border-purple-400',
    button: 'bg-purple-500 hover:bg-purple-600',
    buttonSelect:
      'bg-purple-400 hover:bg-purple-500 border-2 border-neutral-900 dark:border-neutral-50',
    cartBtn:
      'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg',
    price: 'text-purple-600 dark:text-purple-400'
  },
  CONSULTORIO: {
    bg: 'bg-sky-50 dark:bg-neutral-900',
    cardBg:
      'bg-gradient-to-br from-sky-50 to-white border border-slate-200 dark:from-sky-900/40 dark:to-neutral-900 dark:border-neutral-700',
    cardHover:
      'hover:from-sky-100 hover:to-white dark:hover:from-sky-800/30 dark:hover:to-neutral-800',
    inputFocus: 'focus:ring-sky-200 focus:border-sky-300',
    button: 'bg-sky-500 hover:bg-sky-600 text-white',
    buttonSelect: 'bg-sky-500 hover:bg-sky-400 border-2 border-neutral-900 dark:border-neutral-50',
    cartBtn:
      'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-md',
    price: 'text-sky-600 dark:text-sky-400'
  }
} as const;

export type CategoryKey = keyof typeof categoryStyles;

/**
 * Hook para obtener el tema de la empresa según la categoría real del array.
 */
export const useEmpresaTheme = (id: number) => {
  const [theme, setTheme] = useState<CategoryKey>('otros');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await axios.get(`get_company_by_params/${id}`);
        const data = response.data;
        let categoriaFinal: CategoryKey = 'otros';

        // Solo usa el nombre de la categoría del array
        if (Array.isArray(data.categorias) && data.categorias.length > 0) {
          const nombreCat = (data.categorias[0].nombre || '').toUpperCase().trim();
          if (nombreCat in categoryStyles) {
            categoriaFinal = nombreCat as CategoryKey;
          }
        }

        setTheme(categoriaFinal);
      } catch (error) {
        setTheme('otros');
        console.error('Error obteniendo empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, [id]);

  return { theme, loading, styles: categoryStyles[theme] };
};
