import { Container } from '@/components/container';
import { useLayout } from '@/providers';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import React, { Fragment, useState } from 'react';
import ModalProducto from './ModalCatalogo';
import CatalogoProductosContent from './CatalogoContent';

const GestionSedesPage = () => {
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
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Administra tus productos del catalogo menu</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <button className="btn btn-sm btn-light" onClick={handleModalOpen}>
                Nuevo Producto
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
        <ModalProducto open={modalOpen} onClose={handleModalClose} onSave={handleAfterSave} />
        <CatalogoProductosContent reload={reloadContent} />
      </Container>
    </Fragment>
  );
};

export default GestionSedesPage;
