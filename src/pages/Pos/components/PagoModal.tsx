import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';
import { Pago, MedioPagoModel, TipoPagoModel } from '../models/PagoModel';
import { Cliente } from '../models/ClienteModel';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    montoTotal: number;
    idShoppingCart?: number | null;
    ivaActivo?: any;
    idTercero?: number | null;
    idPunto?: number | null;
    onSuccess?: () => void;
    cliente: Cliente | null;

}

const PagoModal = ({
    open,
    onClose,
    montoTotal,
    idShoppingCart,
    ivaActivo,
    idPunto,
    onSuccess,
    cliente
}: ModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [fecha, setFecha] = useState<string>('');
    const [pagoMixto, setPagoMixto] = useState(false);
    const [facturaElectronica, setFacturaElectronica] = useState(false);
    const [mediosPago, setMediosPago] = useState<MedioPagoModel[]>([]);
    const [tiposPago, setTiposPago] = useState<TipoPagoModel[]>([]);
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [idCajaTienda, setIdCajaTienda] = useState<number | null>(null);

   

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFecha(today);

        axios.get('/medio_pagos')
            .then((res) => setMediosPago(res.data))
            .catch(() => enqueueSnackbar('Error cargando medios de pago', { variant: 'error' }));

        axios.get('/tipo_pagos')
            .then((res) => setTiposPago(res.data))
            .catch(() => enqueueSnackbar('Error cargando tipos de pago', { variant: 'error' }));

            axios.get(`caja-latest/${idPunto}`)
                .then((res) => {
                    setIdCajaTienda(res.data.id);
                })
                .catch((error) => {
                    console.error('Error al obtener la caja:', error);
                });

          
        setPagos([crearPagoVacio()]);
    }, []);

    const crearPagoVacio = (): Pago => ({
        valor: '',
        idTipoPago: { id: 1, detalleTipoPago: 'CONTADO' },
        idMedioPago: { id: 0, detalleMedioPago: '' },
        rutaComprobante: null,
        aporte: '',
        opcionPago: '',
    });

    const handleAddPago = () => {
        setPagos([...pagos, crearPagoVacio()]);
    };

    const handleRemovePago = (index: number) => {
        const nuevos = [...pagos];
        nuevos.splice(index, 1);
        setPagos(nuevos);
    };

    const handlePagoChange = <K extends keyof Pago>(index: number, key: K, value: Pago[K]) => {
        const nuevos = [...pagos];
        nuevos[index][key] = value;
        setPagos(nuevos);
    };

    const handleGuardar = async () => {
        const pagosValidos = pagos.every(
            (p) => p.idTipoPago?.id && p.idMedioPago?.id && p.valor
        );
        const formData = new FormData();
        formData.append('idShoppingCart', idShoppingCart?.toString() || '');
        // formData.append('ivaActivo', ivaActivo.toString());
        formData.append('idTercero', JSON.stringify(cliente?.id));
        formData.append('idCaja', idCajaTienda?.toString() || '');

        pagos.forEach((pago, index) => {
            formData.append(`pagos[${index}][idTipoPago]`, pago.idTipoPago.id.toString());
            formData.append(`pagos[${index}][idMedioPago]`, pago.idMedioPago.id.toString());
            formData.append(`pagos[${index}][valor]`, montoTotal.toString());
            formData.append(`pagos[${index}][fecha]`, fecha);
            formData.append(`pagos[${index}][facturaElectronica]`, facturaElectronica ? 'true' : 'false');

            if (pago.aporte) {
                formData.append(`pagos[${index}][aporte]`, pago.aporte);
            }

            if (pago.opcionPago) {
                formData.append(`pagos[${index}][opcionPago]`, pago.opcionPago);
            }

            if (pago.rutaComprobante instanceof File) {
                formData.append(`pagos[${index}][rutaComprobante]`, pago.rutaComprobante);
            }
        });

        try {
            await axios.post('store_venta_contado', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            enqueueSnackbar('Pago realizado con éxito', { variant: 'success' });
            onSuccess!();
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Error al realizar el pago', { variant: 'error' });
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalContent className="max-w-[600px] top-[10%] p-4">
                <ModalHeader>
                    <ModalTitle>Pagos</ModalTitle>
                    <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
                        <KeenIcon icon="cross" />
                    </button>
                </ModalHeader>

                <ModalBody className="grid gap-5 px-0 py-5">
                    <div className="px-4 flex flex-col gap-3">
                        <div>
                            <label className="font-semibold">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 rounded-md"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={pagoMixto} onChange={(e) => setPagoMixto(e.target.checked)} />
                                <span>Pago Mixto</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={facturaElectronica}
                                    onChange={(e) => setFacturaElectronica(e.target.checked)}
                                    disabled={!pagoMixto}
                                />
                                <span className={pagoMixto ? '' : 'text-gray-400'}>Factura Electrónica</span>
                            </label>
                        </div>

                        {pagos.map((pago, i) => (
                            <div key={i} className="border rounded p-4 mt-2 relative">
                                <div className="font-bold mb-2">Pago {i + 1}</div>

                                {/* Tipo de pago */}
                                <div className="mt-2">
                                    <label className="text-sm font-medium">Tipo de Pago</label>
                                    <select
                                        className="w-full px-3 py-2 bg-gray-100 rounded-md"
                                        value={pago.idTipoPago?.id || ''}
                                        onChange={(e) => {
                                            const tipo = tiposPago.find(tp => tp.id === Number(e.target.value));
                                            if (tipo) handlePagoChange(i, 'idTipoPago', tipo);
                                        }}
                                    >
                                        <option value="">Seleccione...</option>
                                        {tiposPago.map(tp => (
                                            <option key={tp.id} value={tp.id}>
                                                {tp.detalleTipoPago}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Medio de pago */}
                                <div className="mt-2">
                                    <label className="text-sm font-medium">Medio de Pago</label>
                                    <select
                                        className="w-full px-3 py-2 bg-gray-100 rounded-md"
                                        value={pago.idMedioPago?.id || ''}
                                        onChange={(e) => {
                                            const medio = mediosPago.find(mp => mp.id === Number(e.target.value));
                                            if (medio) handlePagoChange(i, 'idMedioPago', medio);
                                        }}
                                    >
                                        <option value="">Seleccione...</option>
                                        {mediosPago.map(mp => (
                                            <option key={mp.id} value={mp.id}>
                                                {mp.detalleMedioPago}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Valor */}
                                <div className="mt-2">
                                    <label className="text-sm font-medium">Valor</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 bg-gray-100 rounded-md"
                                        value={montoTotal}
                                        onChange={(e) => handlePagoChange(i, 'valor', e.target.value)}
                                    />
                                </div>

                           

                                {pagoMixto && pagos.length > 1 && (
                                    <button className="btn btn-sm btn-danger mt-3" onClick={() => handleRemovePago(i)}>
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        ))}

                        {pagoMixto && (
                            <button className="btn btn-outline-primary mt-2" onClick={handleAddPago}>
                                + Agregar otro pago
                            </button>
                        )}

                        <div className="mt-4">
                            <label className="font-semibold">Valor Total</label>
                            <div className="bg-gray-100 p-2 rounded">
                                {montoTotal.toLocaleString('es-CO')} COP
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 px-4">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button onClick={handleGuardar} className="btn btn-primary">
                            Aceptar
                        </button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default PagoModal;
