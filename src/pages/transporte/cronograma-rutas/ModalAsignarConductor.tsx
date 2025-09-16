import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { Conductor } from './model/ConductorInterface';
import { useSnackbar } from 'notistack';

interface ModalProps {
    open: boolean;
    vehiculo?: any;
    onClose: () => void;
    onSave?: (conductor: Conductor) => void;
    idViaje: number;
}

const ModalAsignarConductor = ({ open, onClose, vehiculo, onSave, idViaje }: ModalProps) => {
    const { enqueueSnackbar } = useSnackbar();

    const [searchTerm, setSearchTerm] = useState('');
    const [conductores, setConductores] = useState<Conductor[]>([]);
    const [filteredConductores, setFilteredConductores] = useState<Conductor[]>([]);
    const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const conductoresResp = await axios.get<Conductor[]>('get_all_drivers');
                    setConductores(conductoresResp.data);
                    setFilteredConductores(conductoresResp.data);

                    const viajeResp = await axios.get(`/viajes/${idViaje}`);
                    const conductorAsignadoViaje = viajeResp.data?.idConductor;
                    console.log('Datos del viaje:', viajeResp.data);


                    console.log('Conductor asignado al viaje:', conductorAsignadoViaje);


                    if (conductorAsignadoViaje) {
                        const conductorEncontrado = conductoresResp.data.find(
                            c => c.contrato?.some(ct => ct.id === conductorAsignadoViaje)
                        );

                        if (conductorEncontrado) {
                            setSelectedConductor(conductorEncontrado);
                        }
                    }

                } catch (error) {
                    console.error('Error obteniendo conductores o viaje:', error);
                }
            };

            fetchData();
        }
    }, [open, idViaje]);




    useEffect(() => {
        if (searchTerm) {
            const filtered = conductores.filter(conductor =>
                conductor.identificacion.includes(searchTerm)
            );
            setFilteredConductores(filtered);
        } else {
            setFilteredConductores(conductores);
        }
    }, [searchTerm, conductores]);

    const handleSelectConductor = (conductor: Conductor) => {
        if (selectedConductor?.id === conductor.id) {
            setSelectedConductor(null);
        } else {
            setSelectedConductor(conductor);
        }
    };

    const handleSave = () => {
        if (selectedConductor && selectedConductor.contrato && selectedConductor.contrato.length > 0) {
            const idContrato = selectedConductor.contrato[0].id;
            const data = {
                idConductor: idContrato,
            };
            axios.patch(`/viajes/${idViaje}`, data)
                .then(response => {
                    enqueueSnackbar('Conductor asignado correctamente', { variant: 'success' });

                    if (onSave) {
                        onSave(selectedConductor);
                    }
                    onClose();
                })
                .catch(error => {
                    enqueueSnackbar('Error asignando conductor', { variant: 'error' });
                });
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalContent className="max-w-[600px] top-[15%] p-4">
                <ModalHeader>
                    <ModalTitle>{vehiculo ? 'Editar Vehiculo asignado' : 'Asignar conductor'}</ModalTitle>
                    <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
                        <KeenIcon icon="cross" />
                    </button>
                </ModalHeader>
                <ModalBody className="grid gap-5 px-0 py-5">
                    <input
                        className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                        placeholder="Buscar conductor por identificación"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="overflow-y-auto max-h-60">
                        {filteredConductores.length > 0 ? (
                            filteredConductores.map((conductor) => (
                                <div
                                    key={conductor.id}
                                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSelectConductor(conductor)}
                                >
                                    <div className="flex items-center">
                                        <img
                                            src={conductor.rutaFotoUrl}
                                            alt={`${conductor.nombre1} ${conductor.apellido1}`}
                                            className="w-10 h-10 mr-4 rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold">
                                                {`${conductor.nombre1} ${conductor.nombre2 || ''} ${conductor.apellido1 || ''}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {conductor.identificacion}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Toggle con Tailwind CSS */}
                                    <div
                                        className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ${selectedConductor?.id === conductor.id ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que el clic en el toggle active el contenedor
                                            handleSelectConductor(conductor);
                                        }}
                                    >
                                        <div
                                            className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${selectedConductor?.id === conductor.id ? 'translate-x-6' : 'translate-x-0'
                                                }`}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Mensaje cuando no hay resultados
                            <div className="p-4 text-center text-gray-500">
                                No se encontraron conductores que coincidan con la búsqueda.
                            </div>
                        )}
                    </div>
                    {selectedConductor && (
                        <div className="flex justify-end mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                            >
                                Asignar Conductor
                            </button>
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModalAsignarConductor;