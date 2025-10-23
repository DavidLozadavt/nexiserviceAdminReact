import { Container } from '@/components/container';
import { useLayout } from '@/providers';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading } from '@/partials/toolbar';
import React, { Fragment, useState } from 'react';
import { GestionAlmacenContent } from './GestionAlmacenContent';
import { ModalAlmacen } from './ModalAlmacen';

const GestionAlmacenPage = () => {
  const { currentLayout } = useLayout();
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadContent, setReloadContent] = useState(false);

  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAfterSave = () => {
    setReloadContent((prev) => !prev);
    setModalOpen(false);
  };

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
        </Container>
      )}
      <Container>
        <ModalAlmacen open={modalOpen} onClose={handleModalClose} onSave={handleAfterSave} />
        <GestionAlmacenContent reload={reloadContent} />
      </Container>
    </Fragment>
  );
};

export default GestionAlmacenPage;
