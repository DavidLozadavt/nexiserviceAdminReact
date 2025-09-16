import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Sede } from './models/SedeInterface';
import { PuntoVenta, Caja } from './models/TypesInterface';
import { Container } from '@/components';
import ModalInfomacion from './Caja/ModalInfomacion';
import ModalAbrirCaja from './Caja/ModalAbrirCaja';
const PuntosDeVentaPage = () => {
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [puntosDeVenta, setPuntosDeVenta] = useState<PuntoVenta[]>([]);
    const [selectedSede, setSelectedSede] = useState<number | null>(null);
    const [selectedPuntoDeVenta, setSelectedPuntoDeVenta] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpenBox, setModalOpenBox] = useState(false);

    const [selectedPuntoDeVentaId, setSelectedPuntoDeVentaId] = useState<number | null>(null);

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchSedes();
    }, []);

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleModalOpenBox = () => {
        setModalOpenBox(true);
    };

    const handleModalCloseBox = () => {
        setModalOpenBox(false);
    };

    useEffect(() => {
        if (selectedSede) {
            fetchPuntosDeVenta(selectedSede);
        } else {
            setPuntosDeVenta([]);
        }
    }, [selectedSede]);

    const fetchSedes = async () => {
        try {
            const response = await axios.get<Sede[]>('sedes');
            setSedes(response.data);
        } catch (error) {
            console.error('Error fetching sedes:', error);
            enqueueSnackbar('Error al cargar las sedes', { variant: 'error' });
        }
    };

    const fetchPuntosDeVenta = async (sedeId: number) => {
        try {
            const response = await axios.get<PuntoVenta[]>(`get_point_sales_by_sede/${sedeId}`);
            setPuntosDeVenta(response.data);
        } catch (error) {
            console.error('Error fetching puntos de venta:', error);
            enqueueSnackbar('Error al cargar los puntos de venta', { variant: 'error' });
        }
    };

    const handleSedeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const sedeId = parseInt(event.target.value, 10);
        setSelectedSede(sedeId || null);
        setSelectedPuntoDeVenta(null);
    };

    const handleInfoClick = (puntoDeVentaId: number) => {
        setSelectedPuntoDeVentaId(puntoDeVentaId);
        handleModalOpen();
    };

    const handlePuntoDeVentaClick = (puntoDeVentaId: number) => {
        setSelectedPuntoDeVenta(puntoDeVentaId);
    };

    const validarPropietarioCaja = async (puntoDeVentaId: number) => {
        try {
            const response = await axios.get(`puntos-de-venta/${puntoDeVentaId}/verificar-usuario`);
            return response.data;
        } catch (error) {
            console.error('Error validando propietario de la caja:', error);
            enqueueSnackbar('Error al validar la caja', { variant: 'error' });
            return null;
        }
    };

    const handleIrACajaClick = async (puntoDeVentaId: number) => {
        const validacion = await validarPropietarioCaja(puntoDeVentaId);

        if (validacion && validacion.esPropietario) {
            navigate(`/caja/${puntoDeVentaId}`);
        } else if (validacion) {
            enqueueSnackbar(`La caja está abierta por otro usuario`, {
                variant: 'warning',
            });
        } else {
            enqueueSnackbar('No se pudo validar la caja', { variant: 'error' });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    Puntos de venta
                    <a href="#" className="link" onClick={(e) => e.preventDefault()}></a>
                </h3>
            </div>
            <div className="flex justify-center mt-4">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <label className="block text-sm font-medium text-center text-gray-900">
                        Seleccionar Sede
                    </label>
                    <select
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm select focus:border-indigo-500 focus:ring-indigo-500"
                        name="select"
                        value={selectedSede || ''}
                        onChange={handleSedeChange}
                    >
                        <option value="">Selecciona una sede</option>
                        {sedes.map((sede) => (
                            <option key={sede.id} value={sede.id}>
                                {sede.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap justify-center mt-4">
                {puntosDeVenta.length > 0 ? (
                    puntosDeVenta.map((punto) => (
                        <div
                            key={punto.id}
                            className="w-full p-2 cursor-pointer sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
                            onClick={() => handlePuntoDeVentaClick(punto.id)}
                        >
                            <div className="relative p-4 transition-shadow border border-gray-200 rounded-lg shadow-md hover:shadow-lg">
                                <div className="relative">
                                    <img
                                        src={punto.imagenUrl}
                                        alt={punto.nombre}
                                        className="object-cover w-full h-32 rounded-t-lg"
                                    />

                                    {punto.cajas?.length > 0 && punto.cajas[0]?.estado?.estado === 'ABIERTO' && (
                                        <div className="absolute transform -translate-x-1/2 -bottom-4 left-1/2">
                                            <img
                                                src={punto.cajas[0].usuario.persona.rutaFotoUrl}
                                                alt={punto.cajas[0].usuario.persona.nombre1}
                                                className="w-16 h-16 border-2 border-blue-500 rounded-full shadow-lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                <h4 className="mt-8 text-lg font-semibold text-center">{punto.nombre}</h4>

                                {punto.cajas && punto.cajas.length > 0 && punto.cajas[0]?.estado?.estado === 'ABIERTO' && (
                                    <div className="mt-2 text-center">
                                        <p className="text-sm font-medium text-gray-900">
                                            {punto.cajas[0].usuario.persona.nombre1}{' '}
                                            {punto.cajas[0].usuario.persona.apellido1}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between mt-4">
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (punto.cajas?.length > 0 && punto.cajas[0]?.estado?.estado === 'ABIERTO') {
                                                handleIrACajaClick(punto.id);
                                            } else {
                                                setSelectedPuntoDeVentaId(punto.id);
                                                handleModalOpenBox();
                                            }
                                        }}
                                    >
                                        {punto.cajas?.length > 0 && punto.cajas[0]?.estado?.estado === 'ABIERTO'
                                            ? 'Ir a caja'
                                            : 'Abrir'}
                                    </button>
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleInfoClick(punto.id)
                                        }}
                                    >
                                        Info
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full text-center">
                        <p className="text-gray-500">No hay puntos de venta para la sede seleccionada.</p>
                    </div>
                )}
            </div>
            <Container>
                <ModalInfomacion
                    open={modalOpen}
                    onClose={handleModalClose}
                    data={selectedPuntoDeVentaId}
                />
                <ModalAbrirCaja
                    open={modalOpenBox}
                    onClose={handleModalCloseBox}
                    idPunto={selectedPuntoDeVentaId}
                    redirectTo={`/caja/${selectedPuntoDeVentaId}`}

                />
            </Container>
        </div>
    );
};

export default PuntosDeVentaPage;