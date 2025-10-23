import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Asumiendo que estos placeholders se definen aquí o se importan.
// Para este ejemplo, los definimos localmente para la demostración.

interface CategoriaModel { id: number; nombre: string; }
interface MedidaModel { valor: string; unidadMedida: string; }
interface ProductoModel {
    id: number;
    rutaProductoUrl: string;
    caracteristicas: string;
    existente: boolean; // tiene distribución y cantidad > 0
    sin_distribucion: boolean; // no tiene distribución
    sin_existencia: boolean; // tiene distribución y cantidad == 0
    medida: MedidaModel;
    categoria: CategoriaModel;
}
interface NgxSpinnerProps { loading: boolean; }
const NgxSpinner: React.FC<NgxSpinnerProps> = ({ loading }) => ( 
    loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-lg text-white">Cargando...</div>
        </div>
    ) : null
);

// --- TIPADO DE PROPS para el componente separado ---
interface ConfiguracionProductosProps {
    setPageLoading: (loading: boolean) => void;
    empresaId: number | undefined;
    isEmpresaLoaded: boolean;
}


const ConfiguracionProductos: React.FC<ConfiguracionProductosProps> = ({ setPageLoading, empresaId, isEmpresaLoaded }) => {
    // Si la empresa aún no está cargada o no tiene ID, no hacemos nada.
    if (!isEmpresaLoaded || !empresaId) return null;

    // --- ESTADOS DE PRODUCTOS ---
    const [productos, setProductos] = useState<ProductoModel[]>([]);
    const [totalProductos, setTotalProductos] = useState(0);
    const [pageActual, setPageActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [categoriasProducto, setCategoriasProducto] = useState<CategoriaModel[]>([]);
    const [categoriasProductoSeleccionadas, setCategoriasProductoSeleccionadas] = useState<string[]>([]); // Nombres de categoría
    const [productosSeleccionados, setProductosSeleccionados] = useState<Set<number>>(new Set());

    // --- LÓGICA DE CARGA DE DATOS ---

    const fetchCategorias = useCallback(async () => {
         try {
             // Endpoint del controlador: /categoriasUnicas
             const response = await axios.get('/categorias_unicas'); 
             setCategoriasProducto(response.data);
         } catch (error) {
             enqueueSnackbar('Error al cargar categorías de productos.', { variant: 'error' });
         }
    }, []);

    const fetchProductos = useCallback(async (page: number = pageActual, limit: number = registrosPorPagina) => {
                if (!empresaId) return; // 🧠 2️⃣ Evitar llamadas sin empresa

        setPageLoading(true);
        try {
            const params = {
                page: page,
                per_page: limit, 
                search: busquedaProducto, 
                categorias: categoriasProductoSeleccionadas.join(','), 
            };
            
            // Endpoint del controlador: /getAllProductosCompanys
            const response = await axios.get(`/get_all_productos_companys`, { params });

            // El controlador retorna el paginador de Laravel
            setProductos(response.data.data); 
            setTotalProductos(response.data.total);
            setPageActual(response.data.current_page);

            setProductosSeleccionados(new Set()); 

        } catch (error) {
            enqueueSnackbar('Error al cargar productos.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    }, [pageActual, registrosPorPagina, busquedaProducto, categoriasProductoSeleccionadas, setPageLoading]);

    // --- HANDLERS DE PRODUCTOS Y PAGINACIÓN ---

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusquedaProducto(e.target.value);
        setPageActual(1); // Reiniciar a la primera página con la nueva búsqueda
    };

    const onCategoriasSeleccionadasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions);
        const selectedNames = options.map(option => option.value); 
        
        setCategoriasProductoSeleccionadas(selectedNames);
        setPageActual(1); // Reiniciar a la primera página con el nuevo filtro
    };

    const cambiarNumeroRegistros = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRegistrosPorPagina(Number(e.target.value));
        setPageActual(1); // Reiniciar a la primera página
    };

    const totalPaginas = Math.ceil(totalProductos / registrosPorPagina);

    const cambiarPagina = (page: number) => {
        if (page < 1 || page > totalPaginas) return;
        setPageActual(page);
    };

    const obtenerPaginas = (): number[] => {
        const pages: number[] = [];
        const start = Math.max(1, pageActual - 2);
        const end = Math.min(totalPaginas, pageActual + 2);

        for (let i = start; i <= end; i++) { pages.push(i); }
        if (start > 1) { pages.unshift(1); }
        if (end < totalPaginas) { pages.push(totalPaginas); }
        
        return pages.filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a - b);
    };
    
    // --- LÓGICA DE SELECCIÓN ---
    
    const toggleSeleccion = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setProductosSeleccionados(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };
    
    const toggleSeleccionTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setProductosSeleccionados(prev => {
            const newSet = new Set(prev);
            // Solo se pueden seleccionar productos que no tienen distribución
            productos.forEach(p => {
                if (p.sin_distribucion && !p.sin_existencia && !p.existente) { 
                    if (checked) {
                        newSet.add(p.id);
                    } else {
                        newSet.delete(p.id);
                    }
                }
            });
            return newSet;
        });
    };

    const todosSeleccionadosVisibles = useMemo(() => {
        const elegibles = productos.filter(p => p.sin_distribucion && !p.sin_existencia && !p.existente); 
        if (elegibles.length === 0) return false;
        return elegibles.every(p => productosSeleccionados.has(p.id));
    }, [productos, productosSeleccionados]);


    const restaurarSeleccionados = async () => {
        if (productosSeleccionados.size === 0) {
            enqueueSnackbar('Selecciona al menos un producto para guardar.', { variant: 'warning' });
            return;
        }

        setPageLoading(true);
        const ids = Array.from(productosSeleccionados);

        try {
            // Llama a /createProductoWithCompany/{id} por cada producto
            const promises = ids.map(id => 
                axios.post(`/createProductoWithCompany/${id}`) 
            );

            await Promise.all(promises);

            enqueueSnackbar(`Se guardaron ${ids.length} productos seleccionados.`, { variant: 'success' });
            
            await fetchProductos(pageActual, registrosPorPagina);
            setProductosSeleccionados(new Set());

        } catch (error) {
             enqueueSnackbar('Error al guardar la selección de productos.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };
    
    const eliminarProducto = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este producto de tu empresa?")) return;
        setPageLoading(true);
         try {
            // Llama a /deleteDistribucionProducto/{id}
            await axios.delete(`/deleteDistribucionProducto/${id}`); 
            enqueueSnackbar('Producto eliminado de la empresa correctamente.', { variant: 'success' });
            
            await fetchProductos(pageActual, registrosPorPagina);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? error.response?.data?.message || 'Error desconocido al eliminar el producto.'
                : 'Error desconocido.';
             enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    // --- EFECTOS DE MONTAJE Y CAMBIOS DE ESTADO ---

    // Cargar categorías al montar
    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    // Cargar productos al montar, cambiar de página, límite o filtros
    useEffect(() => {
        fetchProductos();
    }, [fetchProductos, pageActual, registrosPorPagina]);


    return (
        <div className="p-5 border border-gray-200 rounded-lg shadow-sm card">
            <div className="pb-4 mb-4 border-b card-header">
                <h4 className="text-xl font-semibold">Configuración de Productos</h4>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="busquedaProducto" className="text-sm font-medium form-label">Buscar producto</label>
                    <input
                        id="busquedaProducto"
                        type="text"
                        className="w-full p-2 border rounded form-control"
                        placeholder="Buscar producto..."
                        value={busquedaProducto}
                        onChange={onSearch}
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="filtroCategorias" className="text-sm font-medium form-label">Filtrar por Categorías</label>
                    <select
                        id="filtroCategorias"
                        multiple
                        className="w-full h-24 p-2 border rounded form-control"
                        value={categoriasProductoSeleccionadas}
                        onChange={onCategoriasSeleccionadasChange as any} 
                    >
                        {categoriasProducto.map(cat => (
                            <option key={cat.id} value={cat.nombre}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="overflow-x-auto table-responsive">
                <table className="min-w-full border border-collapse border-gray-300 table-auto">
                    <thead>
                        <tr className="text-gray-700 bg-blue-50">
                            <th className="p-3 text-left border-b">Código</th>
                            <th className="p-3 text-left border-b">Imagen</th>
                            <th className="p-3 text-left border-b">Medida</th>
                            <th className="p-3 text-left border-b">Producto</th>
                            <th className="p-3 text-left border-b">Categoría</th>
                            <th className="p-3 border-b text-center w-[100px]">
                                <input
                                    type="checkbox"
                                    checked={todosSeleccionadosVisibles}
                                    onChange={toggleSeleccionTodos}
                                    title="Seleccionar todos (no distribuidos)"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">No se encontraron productos.</td>
                            </tr>
                        ) : (
                            productos.map((item) => (
                                <tr 
                                    key={item.id} 
                                    className={`${item.existente ? 'bg-gray-100 text-gray-500' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="p-3 border-b border-gray-200">{item.id}</td>
                                    <td className="p-3 text-center border-b border-gray-200">
                                        <img
                                            src={item.rutaProductoUrl || "https://placehold.co/80x80/ccc/000?text=Prod"}
                                            alt="Producto"
                                            className="object-cover w-20 h-20 mx-auto rounded"
                                        />
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        {item.medida?.valor} {item.medida?.unidadMedida}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">{item.caracteristicas}</td>
                                    <td className="p-3 border-b border-gray-200">{item.categoria?.nombre}</td>
                                    <td className="p-3 text-center border-b border-gray-200">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* CHECKBOX: Añadir (Solo si sin_distribucion=true) */}
                                            {item.sin_distribucion && (
                                                <input
                                                    type="checkbox"
                                                    checked={productosSeleccionados.has(item.id)}
                                                    onChange={(e) => toggleSeleccion(item.id, e)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                                    title="Agregar a la empresa"
                                                />
                                            )}
                                            
                                            {/* BOTÓN ELIMINAR: Eliminar (Solo si sin_existencia=true o existente=true) */}
                                            {(item.sin_existencia || item.existente) && (
                                                <button
                                                    className="p-1 text-white transition-colors bg-red-500 rounded btn btn-sm hover:bg-red-600"
                                                    onClick={() => eliminarProducto(item.id)}
                                                    title="Eliminar de la empresa"
                                                >
                                                    <i className="text-xs fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>

            {/* BOTÓN GUARDAR SELECCIÓN */}
            {productosSeleccionados.size > 0 && (
                <div className="flex justify-end my-3">
                    <button
                        className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg hover:bg-blue-700"
                        onClick={restaurarSeleccionados}
                    >
                        <i className="mr-2 fa-solid fa-floppy-disk"></i> Guardar Selección ({productosSeleccionados.size})
                    </button>
                </div>
            )}

            {/* CONTROLES DE PAGINACIÓN */}
            <div className="flex flex-wrap items-center justify-between mt-4 d-flex">
                <div className="flex items-center gap-2 d-flex">
                    <span>Mostrando</span>
                    <select
                        className="p-1 border rounded form-control"
                        style={{ width: 'auto' }}
                        onChange={cambiarNumeroRegistros}
                        value={registrosPorPagina}
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                    </select>
                    <span>por página</span>
                </div>

                <div className="flex items-center gap-3 mt-2 d-flex md:mt-0">
                    <span>
                        Mostrando {productos.length} de {totalProductos} productos
                    </span>

                    <div className="flex items-center gap-2 d-flex">
                        <button
                            className="p-2 text-gray-700 transition-colors bg-gray-300 rounded btn hover:bg-gray-400"
                            onClick={() => cambiarPagina(pageActual - 1)}
                            disabled={pageActual === 1}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>

                        {obtenerPaginas().map((pagina) => (
                            <button
                                key={pagina}
                                className={`p-2 rounded btn ${pagina === pageActual ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                onClick={() => cambiarPagina(pagina)}
                                disabled={pagina === pageActual}
                            >
                                {pagina}
                            </button>
                        ))}

                        <button
                            className="p-2 text-gray-700 transition-colors bg-gray-300 rounded btn hover:bg-gray-400"
                            onClick={() => cambiarPagina(pageActual + 1)}
                            disabled={pageActual >= totalPaginas}
                        >
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { ConfiguracionProductos };