import { useEffect, useState } from 'react';
import axios from 'axios';
import { categoryStyles, CategoryKey } from './categoryStyles';

/**
 * Hook personalizado para manejar los colores y estilos
 * según la categoría de la empresa logueada.
 */
export const useEmpresaTheme = () => {
  const [theme, setTheme] = useState<CategoryKey>('otros');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // <-- añadimos error

  useEffect(() => {
    let mounted = true;

    const obtenerTema = async () => {
      try {
        setLoading(true);
        setError(null);

        // Paso 1: Obtener usuario logueado
        const userRes = await axios.post('/user_logged');
        const userData = userRes?.data;

        // Paso 2: Sacar el ID de empresa
        const idEmpresa = userData?.activation_company_users?.[0]?.company_id;

        if (!idEmpresa) {
          console.warn('[useEmpresaTheme] No se encontró company_id — se aplicará tema "otros"');
          if (mounted) {
            setTheme('otros');
            setLoading(false);
          }
          return;
        }

        // Paso 3: Obtener la empresa
        const empresaRes = await axios.get(`/get_company_by_params/${idEmpresa}`);
        const empresaData = empresaRes?.data;

        // Paso 4: Leer categoría
        let categoriaFinal: CategoryKey = 'otros';
        const categorias = empresaData?.categorias;

        if (Array.isArray(categorias) && categorias.length > 0) {
          const nombreCategoria = (categorias[0].nombre || '').toUpperCase().trim();

          if (nombreCategoria in categoryStyles) {
            categoriaFinal = nombreCategoria as CategoryKey;
          } else {
            categoriaFinal = 'otros';
          }
        }

        if (mounted) {
          setTheme(categoriaFinal);
        }
      } catch (err: any) {
        console.error('[useEmpresaTheme] Error obteniendo tema:', err);
        if (mounted) {
          setTheme('otros');
          setError('No se pudo obtener la categoría de la empresa'); // <-- manejamos error
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    obtenerTema();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Retornamos error también
  return { theme, styles: categoryStyles[theme], loading, error };
};
