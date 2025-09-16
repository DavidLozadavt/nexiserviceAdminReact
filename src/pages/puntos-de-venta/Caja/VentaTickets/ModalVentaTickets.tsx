import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { PaymentType } from '@/pages/tipos-pago/model/TipoPagoInterface';
import Timeline from '@/pages/transporte/gestion-rutas/timeLine';
import TimelineTickets from '@/pages/transporte/gestion-rutas/timeLineTickets';
import { ViajesModel } from '@/pages/transporte/cronograma-rutas/model/ViajesInterface';

interface ModalProps {
    open: boolean;
    paymentType?: PaymentType;
    onClose: () => void;
    onSave?: () => void;
    idRutaPadre?: number;
    viajeData: ViajesModel | null;

}


const ModalVentaTickets = ({
    open,
    onClose,
    paymentType,
    onSave,
    idRutaPadre,
    viajeData
}: ModalProps) => {

    useEffect(() => {
        if (paymentType) {
        }
    }, [paymentType]);



    return (
        <Modal open={open} onClose={onClose}>
            <ModalContent className="max-w-[600px] top-[15%] p-4">
                <ModalHeader>
                    <ModalTitle>{'Verder tickets'}</ModalTitle>
                    <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
                        <KeenIcon icon="cross" />
                    </button>
                </ModalHeader>
                <ModalBody className="grid gap-5 px-0 py-5">
                    <TimelineTickets
                        viajeData={viajeData}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ModalVentaTickets