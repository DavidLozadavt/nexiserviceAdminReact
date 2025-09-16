import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

interface VehiculoSimplificado {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    foto: string;
    estado: string;
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSave?: (vehiculo: VehiculoSimplificado, observacion: string) => void;
    idViaje: number;
}

const ModalAsignarVehiculo = ({ open, onClose, onSave, idViaje }: ModalProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const [searchTerm, setSearchTerm] = useState('');
    const [vehiculos, setVehiculos] = useState<VehiculoSimplificado[]>([]);
    const [filteredVehiculos, setFilteredVehiculos] = useState<VehiculoSimplificado[]>([]);
    const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoSimplificado | null>(null);
    const [observacion, setObservacion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [vehiculoAsignado, setVehiculoAsignado] = useState<VehiculoSimplificado | null>(null);

    // Obtener los vehículos y el vehículo asignado al viaje
    useEffect(() => {
        if (open) {
            setIsLoading(true);

            // Obtener todos los vehículos
            axios.get('get_all_vehiculos')
                .then(response => {
                    const datosApi = response.data.map((vehiculo: any) => ({
                        id: vehiculo.id.toString(),
                        placa: vehiculo.placa,
                        marca: vehiculo.marca.marca,
                        modelo: vehiculo.modelo.modelo,
                        foto: vehiculo.foto || '/public/media/images/default.png',
                        estado: vehiculo.estado.estado,
                    }));
                    setVehiculos(datosApi);
                    setFilteredVehiculos(datosApi);

                    // Obtener el vehículo asignado al viaje
                    return axios.get(`/viajes/${idViaje}`);
                })
                .then(response => {
                    const vehiculoAsignado = response.data.vehiculo;
                    if (vehiculoAsignado) {
                        const vehiculo = {
                            id: vehiculoAsignado.id.toString(),
                            placa: vehiculoAsignado.placa,
                            marca: vehiculoAsignado.marca.marca,
                            modelo: vehiculoAsignado.modelo.modelo,
                            foto: vehiculoAsignado.foto || '/public/media/images/default.png',
                            estado: vehiculoAsignado.estado.estado,
                        };
                        setVehiculoAsignado(vehiculo);
                        setSelectedVehiculo(vehiculo); // Marcar como seleccionado
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    enqueueSnackbar('Error cargando vehículos', { variant: 'error' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [open, idViaje, enqueueSnackbar]);

    // Filtrar vehículos según el término de búsqueda
    useEffect(() => {
        if (searchTerm) {
            const filtered = vehiculos.filter(vehiculo =>
                vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredVehiculos(filtered);
        } else {
            setFilteredVehiculos(vehiculos);
        }
    }, [searchTerm, vehiculos]);

    // Seleccionar o deseleccionar un vehículo
    const handleSelectVehiculo = (vehiculo: VehiculoSimplificado) => {
        if (selectedVehiculo?.id === vehiculo.id) {
            setSelectedVehiculo(null);
            setObservacion('');
        } else {
            setSelectedVehiculo(vehiculo);
            setObservacion('');
        }
    };

    // Guardar la asignación del vehículo
    const handleSave = () => {
        if (selectedVehiculo) {
            const data = {
                idVehiculo: selectedVehiculo.id,
            };

            axios.patch(`/viajes/${idViaje}`, data)
                .then(response => {
                    enqueueSnackbar('Vehículo asignado correctamente', { variant: 'success' });

                    if (onSave) {
                        onSave(selectedVehiculo, observacion);
                    }
                    onClose();
                })
                .catch(error => {
                    enqueueSnackbar('Error asignando vehículo', { variant: 'error' });
                });
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalContent className="max-w-[600px] top-[15%] p-4">
                <ModalHeader>
                    <ModalTitle>Asignar Vehículo</ModalTitle>
                    <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
                        <KeenIcon icon="cross" />
                    </button>
                </ModalHeader>
                <ModalBody className="grid gap-5 px-0 py-5">
                    <input
                        className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                        placeholder="Buscar vehículo por placa"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            Cargando...
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-60">
                            {filteredVehiculos.length > 0 ? (
                                filteredVehiculos.map((vehiculo) => (
                                    <div
                                        key={vehiculo.id}
                                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSelectVehiculo(vehiculo)}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={vehiculo.foto}
                                                alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                                                className="w-10 h-10 mr-4 rounded-full"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/public/media/images/default.png';
                                                }}
                                            />
                                            <div>
                                                <p className="font-semibold">{vehiculo.marca} {vehiculo.modelo}</p>
                                                <p className="text-sm text-gray-500">
                                                    Placa: {vehiculo.placa} | Estado: {vehiculo.estado}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ${selectedVehiculo?.id === vehiculo.id ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectVehiculo(vehiculo);
                                            }}
                                        >
                                            <div
                                                className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${selectedVehiculo?.id === vehiculo.id ? 'translate-x-6' : 'translate-x-0'
                                                    }`}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    No se encontraron vehículos que coincidan con la búsqueda.
                                </div>
                            )}
                        </div>
                    )}
                    {selectedVehiculo && (
                        <div className="grid gap-4">
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md input"
                                placeholder="Escribe una observación..."
                                rows={3}
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    Asignar Vehículo
                                </button>
                            </div>
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModalAsignarVehiculo;