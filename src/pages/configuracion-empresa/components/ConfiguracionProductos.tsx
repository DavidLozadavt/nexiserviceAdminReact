import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';

interface CategoriaModel { id: number; nombre: string; }
interface MedidaModel { valor: string; unidadMedida: string; }

interface ProductoModel {
    id: number;
    rutaProductoUrl: string;
    caracteristicas: string;
    existente: boolean;
    sin_distribucion: boolean;
    sin_existencia: boolean;
    medida: MedidaModel;
    categoria: CategoriaModel;
}

interface ConfiguracionProductosProps {
    setPageLoading: (loading: boolean) => void;
    empresaId: number | undefined;
    isEmpresaLoaded: boolean;
}


const ConfiguracionProductos: React.FC<ConfiguracionProductosProps> = ({ setPageLoading, empresaId, isEmpresaLoaded }) => {
    if (!isEmpresaLoaded || !empresaId) return null;

    // --- ESTADOS DE PRODUCTOS ---
    const [productos, setProductos] = useState<ProductoModel[]>([]);
    const [totalProductos, setTotalProductos] = useState(0);
    const [pageActual, setPageActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [categoriasProducto, setCategoriasProducto] = useState<CategoriaModel[]>([]);
    const [categoriasProductoSeleccionadas, setCategoriasProductoSeleccionadas] = useState<string[]>([]);

    // CORRECCIÓN TYPESCRIPT
    const [productosSeleccionados, setProductosSeleccionados] = useState<Set<number>>(new Set());

    const [isLoadingProductos, setIsLoadingProductos] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    // --- LÓGICA DE CARGA DE DATOS ---

    const fetchCategorias = useCallback(async () => {
        try {
            const response = await axios.get<CategoriaModel[]>('/categorias_unicas');
            setCategoriasProducto(response.data);
        } catch (error) {
            enqueueSnackbar('Error al cargar categorías de productos.', { variant: 'error' });
        }
    }, []);

    const fetchProductos = useCallback(async (page: number = pageActual, limit: number = registrosPorPagina) => {
        if (!empresaId) return;

        const isInitialLoad = (page === 1 && !busquedaProducto && categoriasProductoSeleccionadas.length === 0);
        if (!isInitialLoad) {
            setIsLoadingProductos(true);
        } else {
            setPageLoading(true);
        }

        try {
            const params = {
                page: page,
                per_page: limit,
                search: busquedaProducto,
                categorias: categoriasProductoSeleccionadas.join(','),
            };

            const response = await axios.get<{ data: ProductoModel[], total: number, current_page: number }>(`/get_all_productos_companys`, { params });

            setProductos(response.data.data);
            setTotalProductos(response.data.total);
            setPageActual(response.data.current_page);

        } catch (error) {
            enqueueSnackbar('Error al cargar productos.', { variant: 'error' });
        } finally {
            setIsLoadingProductos(false);
            setPageLoading(false);
        }
    }, [pageActual, registrosPorPagina, busquedaProducto, categoriasProductoSeleccionadas, setPageLoading, empresaId]);

    // --- HANDLERS DE FILTROS Y PAGINACIÓN ---

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusquedaProducto(e.target.value);
        setPageActual(1);
    };

    const onCategoriaCheckboxChange = (categoryName: string) => {
        setCategoriasProductoSeleccionadas(prevSelected => {
            const isSelected = prevSelected.includes(categoryName);
            let newSelected: string[];

            if (isSelected) {
                newSelected = prevSelected.filter(name => name !== categoryName);
            } else {
                newSelected = [...prevSelected, categoryName];
            }

            if (newSelected.join(',') !== prevSelected.join(',')) {
                setPageActual(1);
            }
            return newSelected;
        });
    };

    const clearCategoryFilters = () => {
        if (categoriasProductoSeleccionadas.length > 0) {
            setCategoriasProductoSeleccionadas([]);
            setPageActual(1);
            setIsDropdownOpen(false);
        }
    };


    const cambiarNumeroRegistros = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRegistrosPorPagina(Number(e.target.value));
        setPageActual(1);
    };

    const totalPaginas = Math.ceil(totalProductos / registrosPorPagina);

    const cambiarPagina = (page: number) => {
        if (page < 1 || page > totalPaginas) return;
        setPageActual(page);
    };

    const obtenerPaginas = (): number[] => {
        const pages: number[] = [];
        const start = Math.max(1, pageActual - 1);
        const end = Math.min(totalPaginas, pageActual + 1);

        if (start > 1) { pages.push(1); }
        if (start > 2) { pages.push(-1); }

        for (let i = start; i <= end; i++) { pages.push(i); }

        if (end < totalPaginas - 1) { pages.push(-1); }
        if (end < totalPaginas) { pages.push(totalPaginas); }

        return pages.filter((value, index, self) => self.indexOf(value) === index);
    };

    // --- LÓGICA DE SELECCIÓN DE PRODUCTOS ---

    const toggleSeleccion = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setProductosSeleccionados((prev: Set<number>) => {
            const newSet = new Set(prev);
            checked ? newSet.add(id) : newSet.delete(id);
            return newSet;
        });
    };

    const toggleSeleccionTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setProductosSeleccionados((prev: Set<number>) => {
            const newSet = new Set(prev);
            productos.forEach(p => {
                if (p.sin_distribucion) {
                    checked ? newSet.add(p.id) : newSet.delete(p.id);
                }
            });
            return newSet;
        });
    };

    const productosElegibles = useMemo(() => productos.filter(p => p.sin_distribucion), [productos]);
    const todosSeleccionadosVisibles = useMemo(() => {
        if (productosElegibles.length === 0) return false;
        return productosElegibles.every(p => productosSeleccionados.has(p.id));
    }, [productosElegibles, productosSeleccionados]);


    const restaurarSeleccionados = async () => {
        if (productosSeleccionados.size === 0) {
            enqueueSnackbar('Selecciona al menos un producto para guardar.', { variant: 'warning' });
            return;
        }

        const result = await Swal.fire({
            title: '¿Deseas agregar estos productos?',
            text: `Se añadirán ${productosSeleccionados.size} productos a tu empresa.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, agregar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'bg-primary-DEFAULT hover:bg-primary-active',
                cancelButton: 'bg-gray-500 hover:bg-gray-600'
            }
        });

        if (!result.isConfirmed) return;

        setPageLoading(true);
        const ids = Array.from(productosSeleccionados);

        try {
            const promises = ids.map(id =>
                axios.post(`/store_producto_company/${id}`)
            );

            await Promise.all(promises);

            enqueueSnackbar(`Se guardaron ${ids.length} productos seleccionados.`, { variant: 'success' });

            setProductosSeleccionados(new Set());
            await fetchProductos(1, registrosPorPagina);

        } catch (error) {
            enqueueSnackbar('Error al guardar la selección de productos.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    const eliminarProducto = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el producto de tu empresa. Si tiene existencias, estas se perderán.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'bg-danger-DEFAULT hover:bg-danger-active',
                cancelButton: 'bg-gray-500 hover:bg-gray-600'
            }
        });

        if (!result.isConfirmed) return;

        setPageLoading(true);
        try {
            await axios.post(`/delete_distribucion_producto_company/${id}`); enqueueSnackbar('Producto eliminado de la empresa correctamente.', { variant: 'success' });

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
    useEffect(() => { fetchCategorias(); }, [fetchCategorias]);
    useEffect(() => {
        fetchProductos();
    }, [pageActual, registrosPorPagina, busquedaProducto, categoriasProductoSeleccionadas, fetchProductos]);


    return (
        <div className="border border-gray-200 card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
            {/* TÍTULO */}
            <div className="card-header">
                <h4 className="text-xl font-semibold text-gray-800 md:text-2xl dark:text-gray-900">📦 Configuración de Productos</h4>
                <p className='text-sm text-gray-600 dark:text-gray-700'>Administra los productos disponibles para tu empresa.</p>
            </div>

            <div className="card-body">
                {/* FILTROS Y BÚSQUEDA (CON DROPDOWN DE CATEGORÍAS MEJORADO) */}
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                    <div>
                        <label htmlFor="busquedaProducto" className="block mb-2 font-medium text-gray-700 text-2sm dark:text-gray-600">Buscar producto</label>
                        <input
                            id="busquedaProducto"
                            type="text"
                            className="w-full input input-lg"
                            placeholder="Buscar por código o características..."
                            value={busquedaProducto}
                            onChange={onSearch}
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="filtroCategorias" className="block mb-2 font-medium text-gray-700 text-2sm dark:text-gray-600">Filtrar por Categorías</label>

                        <button
                            type="button"
                            className="flex items-center justify-between w-full input input-lg"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-haspopup="listbox"
                            aria-expanded={isDropdownOpen}
                        >
                            <span className={`text-2sm ${categoriasProductoSeleccionadas.length > 0 ? 'text-gray-900 dark:text-gray-800 font-medium' : 'text-gray-500'}`}>
                                {categoriasProductoSeleccionadas.length > 0
                                    ? `${categoriasProductoSeleccionadas.length} seleccionada(s)`
                                    : 'Todas las categorías'}
                            </span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {/* Botón para limpiar los filtros */}
                        {categoriasProductoSeleccionadas.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCategoryFilters}
                                title="Limpiar filtros"
                                className="absolute top-1/2 right-3 -translate-y-1/2 mt-2.25 text-danger-DEFAULT hover:text-danger-active"
                                aria-label="Limpiar filtros de categoría"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        )}

                        {isDropdownOpen && (
                            <div
                                // FONDO DEL CONTENEDOR PRINCIPAL
                                className="absolute z-10 w-full mt-1.25 overflow-y-auto max-h-60 bg-white dark:bg-gray-700 shadow-xl rounded-lg border border-gray-200 dark:border-gray-600"
                                role="listbox"
                            >
                                {categoriasProducto.length === 0 ? (
                                    <div className="p-3 text-sm italic text-gray-500">Cargando categorías...</div>
                                ) : (
                                    <div className="flex flex-col">
                                        {categoriasProducto.map(cat => (
                                            <label
                                                key={cat.id}
                                                className="flex items-center px-4 py-2 text-gray-800 transition duration-100 cursor-pointer bg-black-50 dark:bg-gray-600 dark:text-gray-200 text-2sm hover:bg-black-500 dark:hover:bg-primary-dark/50"
                                                role="option"
                                                aria-selected={categoriasProductoSeleccionadas.includes(cat.nombre)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={categoriasProductoSeleccionadas.includes(cat.nombre)}
                                                    onChange={() => onCategoriaCheckboxChange(cat.nombre)}
                                                    className="checkbox"
                                                />
                                                <span className="flex-grow ml-3 font-medium">{cat.nombre}</span>
                                                {categoriasProductoSeleccionadas.includes(cat.nombre) && (
                                                    <i className="ki-solid ki-check text-primary-DEFAULT" />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

<div className="relative overflow-x-auto rounded-lg shadow-xl card-border">
    {/* Dividers ajustados para ambos temas */}
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        
        {/* Fondo del encabezado ligeramente más claro que el cuerpo oscuro */}
        <thead className="tracking-wider text-gray-800 uppercase bg-gray-100 dark:bg-gray-300 dark:text-gray-200">
            <tr>
                <th className="px-4 py-3 text-sm font-semibold text-left table-th dark:text-gray-600">Código</th>
                <th className="px-4 py-3 text-sm font-semibold text-center dark:text-gray-600 table-th">Imagen</th>
                <th className="px-4 py-3 text-sm font-semibold text-left dark:text-gray-600 table-th">Medida</th>
                <th className="py-3 text-sm text-left dark:text-gray-600 font- semibold dark:text-gray-600px-4 table-th">Producto</th>
                <th className="px-4 py-3 text-sm font-semibold text-left dark:text-gray-600 table-th">Categoría</th>
                <th className="dark:text-gray-600 table-th px-4 py-3 text-center text-sm font-semibold w-[120px]">
                    <span className='mr-2'>Acciones</span>
                    <input
                        type="checkbox"
                        checked={todosSeleccionadosVisibles && productosElegibles.length > 0}
                        onChange={toggleSeleccionTodos}
                        title="Seleccionar todos a añadir"
                        className="align-middle checkbox checkbox-sm"
                        disabled={productosElegibles.length === 0}
                    />
                </th>
            </tr>
        </thead>
        
        {/* CUERPO DE LA TABLA (BODY) */}
        {/* AJUSTE CLAVE: dark:bg-gray-900 para fondo uniforme en modo oscuro */}
        <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-100 ">
            {isLoadingProductos ? (
                <tr>
                    <td colSpan={6} className="p-8 font-medium text-center text-primary-DEFAULT">
                        <div className="flex items-center justify-center">
                            <i className="text-2xl ki-solid ki-loader animate-spin text-primary-DEFAULT" />
                        </div>
                        <span className="block mt-2 text-2sm">Cargando productos...</span>
                    </td>
                </tr>
            ) : productos.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-4 py-3 text-sm italic text-center text-gray-500 dark:text-gray-400">
                        No se encontraron productos que coincidan con tu búsqueda o filtros.
                    </td>
                </tr>
            ) : (
                productos.map((item) => (
                    <tr
                        key={item.id}
                        className={`
                            ${(item.existente || item.sin_existencia)
                                ? 'bg-secondary-light/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 opacity-75'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 text-gray-800 dark:text-gray-600'
                            }
                        `}
                    >
                        {/* Celdas de Datos */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 table-td dark:text-gray-600">{item.id}</td>
                        
                        <td className="px-4 py-3 table-td">
                            <img
                                src={item.rutaProductoUrl || "https://placehold.co/60x60/f0f0f0/333?text=N/A"}
                                alt={`Producto ${item.caracteristicas}`}
                                className="object-cover mx-auto border border-gray-200 rounded-md shadow-sm w-14 h-14 dark:border-gray-700"
                            />
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-700 table-td dark:text-gray-600">
                            {item.medida?.valor} {item.medida?.unidadMedida}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 table-td dark:text-gray-600">{item.caracteristicas}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 table-td dark:text-gray-600">{item.categoria?.nombre}</td>
                        
                        {/* Celdas de Acciones */}
                        <td className="px-4 py-3 text-center table-td">
                            <div className="flex items-center justify-center gap-3">
                                {item.sin_distribucion && (
                                    <input
                                        type="checkbox"
                                        checked={productosSeleccionados.has(item.id)}
                                        onChange={(e) => toggleSeleccion(item.id, e)}
                                        className="checkbox"
                                        title="Agregar a la empresa"
                                    />
                                )}
                                {(item.sin_existencia || item.existente) && (
                                    <button
                                        className="btn btn-sm btn-danger-light btn-icon"
                                        onClick={() => eliminarProducto(item.id)}
                                        title="Eliminar de la empresa"
                                    >
                                        <i className="ki-outline ki-trash" />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    </table>
</div>
            {/* BOTÓN GUARDAR SELECCIÓN */}
            {productosSeleccionados.size > 0 && (
                <div className="flex justify-end card-footer">
                    <button
                        className="btn btn-primary shadow-primary"
                        onClick={restaurarSeleccionados}
                    >
                        <i className="ki-solid ki-plus-square" />
                        Agregar {productosSeleccionados.size} Producto(s)
                    </button>
                </div>
            )}

            {/* CONTROLES DE PAGINACIÓN */}
            <div className="flex flex-wrap items-center justify-between border-t-0 card-footer">
                <div className="flex items-center gap-3 text-gray-600 text-2sm dark:text-gray-700">
                    <span>Mostrar</span>
                    <select
                        className="input-sm bg-light-DEFAULT dark:bg-dark-DEFAULT"
                        onChange={cambiarNumeroRegistros}
                        value={registrosPorPagina}
                    >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                    </select>
                    <span>elementos</span>
                </div>

                <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span className='text-gray-600 text-2sm dark:text-gray-700'>
                        Página **{pageActual}** de **{totalPaginas}** ({totalProductos} productos)
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            className="btn btn-sm btn-light btn-icon"
                            onClick={() => cambiarPagina(pageActual - 1)}
                            disabled={pageActual === 1}
                            aria-label="Página anterior"
                        >
                            <i className="ki-solid ki-left" />
                        </button>

                        {obtenerPaginas().map((pagina, index) => (
                            pagina === -1 ? (
                                <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>
                            ) : (
                                <button
                                    key={pagina}
                                    className={`pagination-btn pagination-btn-sm ${pagina === pageActual ? 'pagination-btn-active' : ''}`}
                                    onClick={() => cambiarPagina(pagina)}
                                    aria-current={pagina === pageActual ? 'page' : undefined}
                                >
                                    {pagina}
                                </button>
                            )
                        ))}

                        <button
                            className="btn btn-sm btn-light btn-icon"
                            onClick={() => cambiarPagina(pageActual + 1)}
                            disabled={pageActual >= totalPaginas}
                            aria-label="Página siguiente"
                        >
                            <i className="ki-solid ki-right" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { ConfiguracionProductos };