import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import { KeenIcon } from '@/components';

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
    tk: any;
}

const ConfiguracionProductos: React.FC<ConfiguracionProductosProps> = ({ setPageLoading, empresaId, isEmpresaLoaded, tk }) => {
    if (!isEmpresaLoaded || !empresaId) return null;

    // --- ESTADOS DE PRODUCTOS ---
    const [productos, setProductos] = useState<ProductoModel[]>([]);
    const [totalProductos, setTotalProductos] = useState(0);
    const [pageActual, setPageActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [categoriasProducto, setCategoriasProducto] = useState<CategoriaModel[]>([]);
    const [categoriasProductoSeleccionadas, setCategoriasProductoSeleccionadas] = useState<string[]>([]);
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

    // --- HANDLERS ---

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusquedaProducto(e.target.value);
        setPageActual(1);
    };

    const onCategoriaCheckboxChange = (categoryName: string) => {
        setCategoriasProductoSeleccionadas(prevSelected => {
            const isSelected = prevSelected.includes(categoryName);
            const newSelected = isSelected 
                ? prevSelected.filter(name => name !== categoryName)
                : [...prevSelected, categoryName];
            setPageActual(1);
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
        if (start > 1) { pages.push(1); if (start > 2) pages.push(-1); }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPaginas - 1) { pages.push(-1); if (end < totalPaginas) pages.push(totalPaginas); }
        return pages;
    };

    const toggleSeleccion = (id: number, checked: boolean) => {
        setProductosSeleccionados((prev: Set<number>) => {
            const newSet = new Set(prev);
            checked ? newSet.add(id) : newSet.delete(id);
            return newSet;
        });
    };

    const toggleSeleccionTodos = (checked: boolean) => {
        setProductosSeleccionados((prev: Set<number>) => {
            const newSet = new Set(prev);
            productos.forEach(p => {
                if (p.sin_distribucion) checked ? newSet.add(p.id) : newSet.delete(p.id);
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
        if (productosSeleccionados.size === 0) return;
        const result = await Swal.fire({
            title: '¿Agregar productos?',
            text: `Añadirás ${productosSeleccionados.size} productos a tu empresa.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, agregar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3b82f6'
        });
        if (!result.isConfirmed) return;
        setPageLoading(true);
        const ids = Array.from(productosSeleccionados);
        try {
            await Promise.all(ids.map(id => axios.post(`/store_producto_company/${id}`)));
            enqueueSnackbar(`Se agregaron ${ids.length} productos.`, { variant: 'success' });
            setProductosSeleccionados(new Set());
            await fetchProductos(1, registrosPorPagina);
        } catch (error) {
            enqueueSnackbar('Error al guardar.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    const eliminarProducto = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Esta acción eliminará el producto y sus existencias de la empresa.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444'
        });
        if (!result.isConfirmed) return;
        setPageLoading(true);
        try {
            await axios.post(`/delete_distribucion_producto_company/${id}`);
            enqueueSnackbar('Producto eliminado.', { variant: 'success' });
            await fetchProductos(pageActual, registrosPorPagina);
        } catch (error) {
            enqueueSnackbar('Error al eliminar.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => { fetchCategorias(); }, [fetchCategorias]);
    useEffect(() => { fetchProductos(); }, [fetchProductos]);

    return (
        <div className="nx-in overflow-hidden rounded-3xl md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd }}>
            {/* HEADER */}
            <div className="flex flex-col gap-4 p-4 md:p-8 md:flex-row md:items-center md:justify-between">
                <div className="text-center md:text-left">
                    <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: tk.txt }}>📦 Catálogo de Productos</h4>
                    <p className="text-xs md:text-sm" style={{ color: tk.txt2 }}>Gestiona los productos distribuidos por tu empresa</p>
                </div>
                {productosSeleccionados.size > 0 && (
                    <button
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        onClick={restaurarSeleccionados}
                    >
                        <KeenIcon icon="plus-square" className="text-xl" />
                        <span>Agregar {productosSeleccionados.size} <span className="hidden sm:inline">Productos</span></span>
                    </button>
                )}
            </div>

            {/* FILTROS */}
            <div className="grid grid-cols-1 gap-4 px-4 md:px-8 mb-6 md:mb-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: tk.txt3 }}>Búsqueda</label>
                    <div className="relative group">
                        <KeenIcon icon="magnifier" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar código o nombre..."
                            className="w-full pl-11 pr-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl border text-sm transition-all focus:ring-2 focus:ring-blue-500/20"
                            style={{ background: tk.surf2, borderColor: tk.brd, color: tk.txt }}
                            value={busquedaProducto}
                            onChange={onSearch}
                        />
                    </div>
                </div>

                <div className="relative space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider ml-1" style={{ color: tk.txt3 }}>Filtrar Categoría</label>
                    <button
                        type="button"
                        className="flex items-center justify-between w-full px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl border transition-all active:scale-[0.99]"
                        style={{ background: tk.surf2, borderColor: tk.brd, color: tk.txt }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex items-center gap-3">
                            <KeenIcon icon="filter" className={categoriasProductoSeleccionadas.length > 0 ? 'text-blue-500' : 'text-gray-400'} />
                            <span className="text-sm font-medium truncate max-w-[150px]">
                                {categoriasProductoSeleccionadas.length > 0
                                    ? `${categoriasProductoSeleccionadas.length} seleccionadas`
                                    : 'Todas las categorías'}
                            </span>
                        </div>
                        <KeenIcon icon="down" className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
                             style={{ background: tk.surf, borderColor: tk.brd }}>
                            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                                {categoriasProducto.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={categoriasProductoSeleccionadas.includes(cat.nombre)}
                                            onChange={() => onCategoriaCheckboxChange(cat.nombre)}
                                            className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium" style={{ color: tk.txt }}>{cat.nombre}</span>
                                    </label>
                                ))}
                            </div>
                            {categoriasProductoSeleccionadas.length > 0 && (
                                <button
                                    onClick={clearCategoryFilters}
                                    className="w-full mt-2 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors uppercase tracking-widest"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* VISTA MÓVIL (CARDS) / ESCRITORIO (TABLA) */}
            <div className="px-4 md:px-8 pb-4 md:pb-8">
                {isLoadingProductos ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold animate-pulse" style={{ color: tk.txt2 }}>Cargando catálogo...</span>
                    </div>
                ) : productos.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
                        <KeenIcon icon="box-search" className="text-6xl" />
                        <p className="font-bold text-lg" style={{ color: tk.txt }}>No se encontraron productos</p>
                    </div>
                ) : (
                    <>
                        {/* VISTA CARDS (MÓVIL) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                            {productos.map((item) => (
                                <div 
                                    key={item.id} 
                                    className={`relative p-4 rounded-2xl transition-all ${item.existente || item.sin_existencia ? 'opacity-60 grayscale-[0.5]' : 'hover:border-blue-500/30 shadow-sm'}`}
                                    style={{ background: tk.surf2, borderColor: tk.brd }}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border bg-white shrink-0" style={{ borderColor: tk.brd }}>
                                            <img
                                                src={item.rutaProductoUrl || "https://placehold.co/100x100/f0f0f0/333?text=N/A"}
                                                alt={item.caracteristicas}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/50 dark:bg-black/20" style={{ color: tk.txt2 }}>#{item.id}</span>
                                                {item.sin_distribucion ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={productosSeleccionados.has(item.id)}
                                                        onChange={(e) => toggleSeleccion(item.id, e.target.checked)}
                                                        className="w-6 h-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => eliminarProducto(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <KeenIcon icon="trash" />
                                                    </button>
                                                )}
                                            </div>
                                            <h5 className="text-sm font-bold leading-snug line-clamp-2 mb-1" style={{ color: tk.txt }}>{item.caracteristicas}</h5>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 uppercase">{item.categoria?.nombre}</span>
                                                <span className="text-[10px] font-medium opacity-60" style={{ color: tk.txt2 }}>{item.medida?.valor} {item.medida?.unidadMedida}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* VISTA TABLA (ESCRITORIO) */}
                        <div className="hidden md:block overflow-hidden rounded-3xl border" style={{ borderColor: tk.brd }}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ background: tk.surf2 }}>
                                        <th className="p-5 text-[10px] font-bold uppercase tracking-wider" style={{ color: tk.txt3 }}>Código</th>
                                        <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: tk.txt3 }}>Imagen</th>
                                        <th className="p-5 text-[10px] font-bold uppercase tracking-wider" style={{ color: tk.txt3 }}>Especificación</th>
                                        <th className="p-5 text-[10px] font-bold uppercase tracking-wider" style={{ color: tk.txt3 }}>Categoría</th>
                                        <th className="p-5 text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: tk.txt3 }}>
                                            <div className="flex items-center justify-center gap-3">
                                                <span>Acción</span>
                                                <input
                                                    type="checkbox"
                                                    checked={todosSeleccionadosVisibles}
                                                    onChange={(e) => toggleSeleccionTodos(e.target.checked)}
                                                    disabled={productosElegibles.length === 0}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody
                                    className="divide-y"
                                    style={{ '--tw-divide-opacity': '1', borderColor: tk.brd } as any}
                                >
                                    {productos.map((item) => (
                                        <tr key={item.id} className={`group transition-colors ${item.existente || item.sin_existencia ? 'opacity-60 bg-gray-50/30 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                            <td className="p-5">
                                                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10" style={{ color: tk.txt }}>#{item.id}</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="relative w-14 h-14 mx-auto rounded-xl overflow-hidden border p-0.5" style={{ borderColor: tk.brd }}>
                                                    <img
                                                        src={item.rutaProductoUrl || "https://placehold.co/60x60/f0f0f0/333?text=N/A"}
                                                        alt={item.caracteristicas}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold" style={{ color: tk.txt }}>{item.caracteristicas}</span>
                                                    <span className="text-xs opacity-60" style={{ color: tk.txt2 }}>{item.medida?.valor} {item.medida?.unidadMedida}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 uppercase tracking-wide">
                                                    {item.categoria?.nombre}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-3">
                                                    {item.sin_distribucion ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={productosSeleccionados.has(item.id)}
                                                            onChange={(e) => toggleSeleccion(item.id, e.target.checked)}
                                                            className="w-6 h-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => eliminarProducto(item.id)}
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            title="Eliminar de empresa"
                                                        >
                                                            <KeenIcon icon="trash" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* PAGINACIÓN */}
                <div className="flex flex-col gap-4 mt-6 md:mt-8 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border" style={{ background: tk.surf2, borderColor: tk.brd }}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tk.txt3 }}>Mostrar</span>
                            <select
                                className="px-4 py-2 rounded-xl border bg-transparent text-xs font-bold focus:ring-2 focus:ring-blue-500/20"
                                style={{ borderColor: tk.brd, color: tk.txt }}
                                value={registrosPorPagina}
                                onChange={cambiarNumeroRegistros}
                            >
                                {[10, 15, 20, 25].map(v => <option key={v} value={v} className="bg-white dark:bg-gray-800">{v}</option>)}
                            </select>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tk.txt3 }}>por página</span>
                        </div>
                        
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-60" style={{ color: tk.txt2 }}>
                            Página <span style={{ color: tk.txt }}>{pageActual}</span> de {totalPaginas} | {totalProductos} Resultados
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => cambiarPagina(pageActual - 1)}
                            disabled={pageActual === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-transparent hover:border-blue-500/50 disabled:opacity-20 transition-all shadow-sm"
                            style={{ color: tk.txt }}
                        >
                            <KeenIcon icon="left" />
                        </button>

                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full px-2">
                            {obtenerPaginas().map((p, i) => (
                                p === -1 ? <span key={i} className="px-2 opacity-30">...</span> : (
                                    <button
                                        key={i}
                                        onClick={() => cambiarPagina(p)}
                                        className={`w-10 h-10 min-w-[2.5rem] flex items-center justify-center rounded-xl text-xs font-bold transition-all ${p === pageActual ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                        style={p !== pageActual ? { color: tk.txt } : {}}
                                    >
                                        {p}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => cambiarPagina(pageActual + 1)}
                            disabled={pageActual >= totalPaginas}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-transparent hover:border-blue-500/50 disabled:opacity-20 transition-all shadow-sm"
                            style={{ color: tk.txt }}
                        >
                            <KeenIcon icon="right" />
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export { ConfiguracionProductos };