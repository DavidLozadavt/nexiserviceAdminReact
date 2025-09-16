import { useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface ModalProps {
    open: boolean;
    vehiculo?: any;
    onClose: () => void;
    onSave?: (viaje: any) => void;
    idViaje: number;
}

enum DiasSemana {
    LUNES = 'LUNES',
    MARTES = 'MARTES',
    MIERCOLES = 'MIERCOLES',
    JUEVES = 'JUEVES',
    VIERNES = 'VIERNES',
    SABADO = 'SABADO',
    DOMINGO = 'DOMINGO',
}

const ModalAgendarViajes = ({ open, onClose, vehiculo, onSave, idViaje }: ModalProps) => {
          const { enqueueSnackbar } = useSnackbar();
    
    const [diaSeleccionado, setDiaSeleccionado] = useState<DiasSemana | null>(null);
    const [fecha, setFecha] = useState<string>('');
    const [hora, setHora] = useState<string>('');
    const [repetir, setRepetir] = useState<boolean>(false);

    const toggleDia = (dia: DiasSemana) => {
        if (diaSeleccionado === dia) {
            setDiaSeleccionado(null); 
        } else {
            setDiaSeleccionado(dia);
        }
    };

    const handleSave = async () => {
        if (!diaSeleccionado || !fecha || !hora) {
            enqueueSnackbar('Por favor, selecciona un día, una fecha y una hora.', {
                variant: 'warning', 
            });
            return;
        }

        const viaje = {
            idViaje,
            dia: diaSeleccionado,
            fecha,
            hora,
            repetir,
        };

        console.log(viaje);

        try {
            const response = await axios.post('schedule_trip', viaje);

            if (response.status === 200 || response.status === 201) {
                console.log('Viaje agendado exitosamente:', response.data);
                enqueueSnackbar('Viaje agendado exitosamente.', {
                    variant: 'success',
                });
                if (onSave) {
                    onSave(viaje);
                }
                onClose();
            } else {
                console.error('Error al agendar el viaje:', response.data);
                enqueueSnackbar('Hubo un error al agendar el viaje. Por favor, intenta nuevamente.', {
                    variant: 'error', 
                });
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            enqueueSnackbar('Hubo un error en la solicitud. Por favor, verifica tu conexión e intenta nuevamente.', {
                variant: 'error', 
            });
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Hora</label>
                            <input
                                type="time"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
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
                    <div>
                        <label className="block mb-2 text-sm font-medium">Repetir semanalmente</label>
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <span className="text-sm font-medium">Repetir</span>
                            <div
                                className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ${repetir ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                onClick={() => setRepetir(!repetir)}
                            >
                                <div
                                    className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${repetir ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                ></div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                            Guardar
                        </button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModalAgendarViajes;