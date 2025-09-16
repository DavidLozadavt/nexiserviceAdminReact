import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface ModalProps {
    open: boolean;
    vehiculo?: any;
    onClose: () => void;
    onSave?: (viaje: any) => void;
}

enum DiasSemana {
    LUNES = 'LUNES',
    MARTES = 'MARTES',
    MIERCOLES = 'MIERCOLES',
    JUEVES = 'JUEVES',
    VIERNES = 'VIERNES',
    SABADO = 'SABADO',
    DOMINGO = 'DOMINGO'
}

const ModalNuevoViaje = ({ open, onClose, vehiculo, onSave }: ModalProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const [diaSeleccionado, setDiaSeleccionado] = useState<DiasSemana | null>(null);
    const [fecha, setFecha] = useState<string>('');
    const [hora, setHora] = useState<string>('');
    const [repetir, setRepetir] = useState<boolean>(false);
    const [rutasIda, setRutasIda] = useState<any[]>([]); // Lista de rutas de ida
    const [rutasVuelta, setRutasVuelta] = useState<any[]>([]); // Lista de rutas de vuelta
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [rutaSeleccionada, setRutaSeleccionada] = useState<any>(null);
    const [rutaTipo, setRutaTipo] = useState<'ida' | 'vuelta' | null>(null);
    const [showInfo, setShowInfo] = useState<boolean>(false);

    useEffect(() => {
        if (open && searchTerm.length > 2) {
            axios
                .get(`rutas?search=${encodeURIComponent(searchTerm)}`)
                .then((response) => {
                    if (Array.isArray(response.data)) {
                        // Separar las rutas en ida y vuelta
                        const rutasIdaTemp: any[] = [];
                        const rutasVueltaTemp: any[] = [];

                        response.data.forEach((ruta) => {
                            if (ruta.rutaIda) {
                                rutasIdaTemp.push({ ...ruta.rutaIda, tipo: 'ida' });
                            }
                            if (ruta.rutaVuelta) {
                                rutasVueltaTemp.push({ ...ruta.rutaVuelta, tipo: 'vuelta' });
                            }
                        });

                        setRutasIda(rutasIdaTemp);
                        setRutasVuelta(rutasVueltaTemp);
                    } else {
                        setRutasIda([]);
                        setRutasVuelta([]);
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener las rutas:', error);
                    setRutasIda([]);
                    setRutasVuelta([]);
                });
        } else {
            setRutasIda([]);
            setRutasVuelta([]);
        }
    }, [searchTerm, open]);

    useEffect(() => {
        if (!open) {
            setRutaSeleccionada(null);
            setSearchTerm('');
            setRutaTipo(null);
        }
    }, [open]);

    const toggleDia = (dia: DiasSemana) => {
        setDiaSeleccionado(diaSeleccionado === dia ? null : dia);
    };

    const handleSave = async () => {
        if (!diaSeleccionado || !fecha || !hora || !rutaSeleccionada || !rutaTipo) {
            enqueueSnackbar('Por favor, selecciona un día, una fecha, una hora y una ruta.', {
                variant: 'warning'
            });
            return;
        }

        const viaje = {
            dia: diaSeleccionado,
            fecha,
            hora,
            repetir,
            idRuta: rutaSeleccionada.id, // Usar el ID de la ruta seleccionada
            tipoRuta: rutaTipo // Guardar el tipo de ruta (ida o vuelta)
        };
        console.log('Viaje:', viaje);

        try {
            const response = await axios.post('save_trip_agenda', viaje);
            if (response.status === 200 || response.status === 201) {
                enqueueSnackbar('Viaje agendado exitosamente.', { variant: 'success' });
                onSave?.(viaje);
                onClose();
            } else {
                enqueueSnackbar('Hubo un error al agendar el viaje.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Error de conexión. Intenta nuevamente.', { variant: 'error' });
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalContent className="max-w-[600px] top-[15%] p-4">
                <ModalHeader>
                    <ModalTitle>{vehiculo ? 'Editar viaje agendado' : 'Agendar viaje'}</ModalTitle>
                    <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
                        <KeenIcon icon="cross" />
                    </button>
                </ModalHeader>
                <ModalBody className="grid gap-5 px-0 py-5">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Buscar ruta</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar ruta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {rutaSeleccionada && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded">
                                        {rutaTipo === 'ida'
                                            ? `${rutaSeleccionada.ciudad_origen?.descripcion} - ${rutaSeleccionada.ciudad_destino?.descripcion}`
                                            : `${rutaSeleccionada.ciudad_origen?.descripcion} - ${rutaSeleccionada.ciudad_destino?.descripcion}`}
                                    </span>
                                    <button
                                        className="p-1 ml-2 text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            setRutaSeleccionada(null);
                                            setSearchTerm('');
                                            setRutaTipo(null);
                                        }}
                                    >
                                        <KeenIcon icon="cross" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Lista de rutas de ida */}
                        <div className="mt-4">
                            <h3 className="mb-2 text-sm font-medium">Rutas de Ida</h3>
                            <div className="overflow-y-auto border rounded-lg max-h-60">
                                {rutasIda.length > 0 ? (
                                    rutasIda.map((ruta, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 border-b cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setRutaSeleccionada(ruta);
                                                setRutaTipo('ida'); // Establecer el tipo de ruta como 'ida'
                                                console.log('Ruta seleccionada - ID:', ruta.id, 'Tipo:', 'ida');
                                            }}
                                        >
                                            <div className="text-sm">
                                                {ruta.ciudad_origen?.descripcion} - {ruta.ciudad_destino?.descripcion}
                                            </div>
                                            <button
                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowInfo(true);
                                                }}
                                            >
                                                <KeenIcon icon="eye" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-gray-500">No hay rutas de ida</div>
                                )}
                            </div>
                        </div>

                        {/* Lista de rutas de vuelta */}
                        {/* <div className="mt-4">
                            <h3 className="mb-2 text-sm font-medium">Rutas de Vuelta</h3>
                            <div className="overflow-y-auto border rounded-lg max-h-60">
                                {rutasVuelta.length > 0 ? (
                                    rutasVuelta.map((ruta, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 border-b cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setRutaSeleccionada(ruta);
                                                setRutaTipo('vuelta'); // Establecer el tipo de ruta como 'vuelta'
                                                console.log('Ruta seleccionada - ID:', ruta.id, 'Tipo:', 'vuelta');
                                            }}
                                        >
                                            <div className="text-sm">
                                                {ruta.ciudad_origen?.descripcion} - {ruta.ciudad_destino?.descripcion}
                                            </div>
                                            <button
                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowInfo(true);
                                                }}
                                            >
                                                <KeenIcon icon="eye" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-gray-500">No hay rutas de vuelta</div>
                                )}
                            </div>
                        </div>
                     */}
</div>  
                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full p-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Hora</label>
                            <input
                                type="time"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                                className="w-full p-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Día de la semana */}
                    <label className="block mb-2 text-sm font-medium">Día de la semana</label>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.values(DiasSemana).map((dia) => (
                            <div key={dia} className="flex flex-col items-center gap-2">
                                <span className="text-sm font-medium">{dia.slice(0, 3)}</span>
                                <div
                                    className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ${diaSeleccionado === dia ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}
                                    onClick={() => toggleDia(dia)}
                                >
                                    <div
                                        className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${diaSeleccionado === dia ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Switch de repetir */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Repetir semanalmente</span>
                        <div
                            className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ${repetir ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={() => setRepetir(!repetir)}
                        >
                            <div className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${repetir ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    {/* Botón guardar */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                        >
                            Guardar
                        </button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModalNuevoViaje;