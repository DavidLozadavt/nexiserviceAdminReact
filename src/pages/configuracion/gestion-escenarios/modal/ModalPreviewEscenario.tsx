import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';


interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalPreviewOpen = ({ open, data, onClose, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalContent className="max-w-[600px] top-[10%] p-4">
          <ModalHeader>
            {/* <ModalTitle>
              {data ? 'Editar Escenario' : 'Nuevo Escenario'}
            </ModalTitle> */}
            <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
              <KeenIcon icon="cross" />
            </button>
          </ModalHeader>

          <ModalBody className="grid gap-3 px-0 py-5">
            <h1>HOLA PREVIEW</h1>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { ModalPreviewOpen };