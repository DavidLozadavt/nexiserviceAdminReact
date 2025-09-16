import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { ViajesModel } from '@/pages/transporte/cronograma-rutas/model/ViajesInterface';
import { useSnackbar } from 'notistack';
import ModalPdfViewer from '../ModalPdfViewer';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSave?: (ticketData: any) => void;
    viajeData: ViajesModel | null;
    selectedRutaId: number | null;
}

interface Tercero {
    id: number;
    nombre: string;
    nit: string;
    email: string;
    direccion: string;
    telefono: string;
    digitoVerficacion: string;
    responsableIva: number;
    retenciones: number;
    identificacion: string;
}

const ModalCreateTicket = ({ open, onClose, onSave, viajeData, selectedRutaId }: ModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [identificacion, setIdentificacion] = useState('');
    const [terceroSeleccionado, setTerceroSeleccionado] = useState<Tercero | null>(null);
    const [mostrarFormularioTercero, setMostrarFormularioTercero] = useState(false);
    const [nuevoTercero, setNuevoTercero] = useState<Tercero>({
        id: 0,
        nombre: '',
        nit: '',
        identificacion: '',
        email: '',
        direccion: '',
        telefono: '',
        digitoVerficacion: '',
        responsableIva: 0,
        retenciones: 0
    });
    const [generarTicket, setGenerarTicket] = useState(true);
    const [generarFactura, setGenerarFactura] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [modalPdfOpen, setModalPdfOpen] = useState(false);
    const [cantidad, setCantidad] = useState(1); // Estado para la cantidad

    useEffect(() => {
        if (identificacion.trim() === '') {
            setTerceroSeleccionado(null);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            try {
                const response = await axios.get(`terceros?identificacion=${identificacion}`);
                if (response.data.length > 0) {
                    setTerceroSeleccionado(response.data[0]);
                } else {
                    setTerceroSeleccionado(null);
                }
            } catch (error) {
                console.error('Error buscando tercero:', error);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [identificacion]);

    const crearNuevoTercero = async () => {
        try {
            const datosParaBackend = {
                nombre: nuevoTercero.nombre,
                nit: nuevoTercero.identificacion,
                email: nuevoTercero.email,
                direccion: nuevoTercero.direccion,
                telefono: nuevoTercero.telefono,
                digitoVerficacion: nuevoTercero.digitoVerficacion,
                responsableIva: nuevoTercero.responsableIva,
                retenciones: nuevoTercero.retenciones
            };

            const response = await axios.post('terceros', datosParaBackend);
            setTerceroSeleccionado(response.data);
            setMostrarFormularioTercero(false);
            enqueueSnackbar('Tercero creado con éxito.', { variant: 'success' });

        } catch (error) {
            console.error('Error creando tercero:', error);
        }
    };

    const cerrarFormularioTercero = () => {
        setMostrarFormularioTercero(false);
        setNuevoTercero({
            id: 0,
            nombre: '',
            nit: '',
            identificacion: '',
            email: '',
            direccion: '',
            telefono: '',
            digitoVerficacion: '',
            responsableIva: 0,
            retenciones: 0
        });
    };

    const venderTicket = async () => {
        if (terceroSeleccionado && viajeData) {
            const ticketData = {
                idViaje: viajeData.id,
                idTercero: terceroSeleccionado.id,
                idConfiguracionVehiculo: viajeData.vehiculo?.configuracion_vehiculo.id || null,
                idAgendaViaje: viajeData.agendar_viajes?.id || null,
                idRuta: selectedRutaId || null,
                cantidad: cantidad
            };
            try {
                const response = await axios.post('/tickets', ticketData);

                if (onSave) onSave(ticketData);
                console.log(ticketData);

                enqueueSnackbar('Ticket vendido exitosamente.', { variant: 'success' });

                if (generarTicket) {
                    await generarTicketPDF();
                }
                if (generarFactura) {
                    // await generarFacturaElectronicaPDF();
                }

                onClose();
            } catch (error) {
                enqueueSnackbar('Hubo un error al vender el ticket. Por favor, inténtalo de nuevo.', { variant: 'error' });
            }
        } else {
            enqueueSnackbar('Por favor, selecciona un tercero antes de vender el ticket.', { variant: 'warning' });
        }
    };

    const generarTicketPDF = async () => {
        if (viajeData) {
            try {
                const response = await axios.get('/generate_ticket_pdf', {
                    params: {
                        idViaje: viajeData.id,
                        action: 'generate_ticket'
                    },
                    responseType: 'blob'
                });

                if (response.status === 200) {
                    const facturaUrl = response.headers['x-factura-url'];
                    const qrdata = response.headers['x-qr-code'];

                    if (qrdata) {
                        console.log('Código QR:', qrdata);
                        window.open(qrdata, '_blank');
                    }

                    if (facturaUrl) {
                        console.log('URL de la factura:', facturaUrl);
                        window.open(facturaUrl, '_blank');
                    }

                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);

                    setPdfUrl(url);
                    setModalPdfOpen(true);

                    enqueueSnackbar('Ticket generado exitosamente.', { variant: 'success' });
                } else {
                    throw new Error('Respuesta no exitosa del servidor');
                }
            } catch (error) {
                console.error('Error generando el ticket:', error);
                enqueueSnackbar('Hubo un error al generar el ticket. Por favor, inténtalo de nuevo.', { variant: 'error' });
            }
        }
    };

    const handleClose = () => {
        setIdentificacion('');
        setTerceroSeleccionado(null);
        setMostrarFormularioTercero(false);
        setNuevoTercero({
            id: 0,
            nombre: '',
            nit: '',
            identificacion: '',
            email: '',
            direccion: '',
            telefono: '',
            digitoVerficacion: '',
            responsableIva: 0,
            retenciones: 0
        });
        setGenerarTicket(true);
        setGenerarFactura(false);
        setPdfUrl(null);
        setCantidad(1);
        onClose();
    };

    return (
        <>
            {/* Modal principal para crear el ticket */}
            <Modal open={open} onClose={handleClose}>
                <ModalContent className="max-w-[600px] top-[15%] p-4">
                    <ModalHeader>
                        <ModalTitle className="text-lg font-semibold">Vender Ticket</ModalTitle>
                        <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
                            <KeenIcon icon="cross" />
                        </button>
                    </ModalHeader>
                    <ModalBody className="p-6 space-y-6">
                        {/* Buscador de terceros */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Buscar Tercero por Identificación:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={identificacion}
                                    onChange={(e) => setIdentificacion(e.target.value)}
                                    placeholder="Ingrese la identificación"
                                    className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                                />
                                <button
                                    onClick={() => setMostrarFormularioTercero(true)}
                                    className="p-2 text-gray-500 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700"
                                >
                                    <KeenIcon icon="plus" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Información del tercero seleccionado */}
                        {terceroSeleccionado && (
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                <h3 className="text-sm text-gray-600">Tercero Seleccionado</h3>
                                <div className="mt-1">
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Nombre:</span> {terceroSeleccionado.nombre}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Identificación:</span> {terceroSeleccionado.identificacion}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Email:</span> {terceroSeleccionado.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Formulario para agregar un nuevo tercero */}
                        {mostrarFormularioTercero && (
                            <div className="relative space-y-4">
                                <button
                                    onClick={cerrarFormularioTercero}
                                    className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
                                >
                                    <KeenIcon icon="cross" className="w-4 h-4" />
                                </button>
                                <h3 className="text-lg font-semibold text-gray-700">Agregar Nuevo Tercero</h3>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={nuevoTercero.nombre}
                                    onChange={(e) => setNuevoTercero({ ...nuevoTercero, nombre: e.target.value })}
                                    placeholder="Nombre"
                                    className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                                />
                                <input
                                    type="text"
                                    name="identificacion"
                                    value={nuevoTercero.identificacion}
                                    onChange={(e) => setNuevoTercero({ ...nuevoTercero, identificacion: e.target.value })}
                                    placeholder="Identificación"
                                    className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={nuevoTercero.email}
                                    onChange={(e) => setNuevoTercero({ ...nuevoTercero, email: e.target.value })}
                                    placeholder="Email"
                                    className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                                />
                                <button
                                    onClick={crearNuevoTercero}
                                    className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Guardar Tercero
                                </button>
                            </div>
                        )}

                        {/* Campo para la cantidad de tickets (solo se muestra si hay un tercero seleccionado) */}
                        {terceroSeleccionado && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Cantidad de Tickets:
                                </label>
                                <input
                                    type="number"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(Number(e.target.value))}
                                    min="1"
                                    className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
                                />
                            </div>
                        )}

                        {/* Checkboxes para generar ticket y factura */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={generarTicket}
                                    onChange={(e) => setGenerarTicket(e.target.checked)}
                                    className="form-checkbox"
                                />
                                <span>Generar Ticket</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={generarFactura}
                                    onChange={(e) => setGenerarFactura(e.target.checked)}
                                    className="form-checkbox"
                                />
                                <span>Generar Factura Electrónica</span>
                            </label>
                        </div>

                        {/* Botón para vender el ticket */}
                        <button
                            onClick={venderTicket}
                            disabled={!terceroSeleccionado}
                            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Vender Ticket
                        </button>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <ModalPdfViewer
                isOpen={modalPdfOpen}
                onClose={() => {
                    setModalPdfOpen(false);
                    setPdfUrl(null);
                }}
                pdfUrl={pdfUrl}
            />
        </>
    );
};

export default ModalCreateTicket;