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
import GestionPersonalContent from './GestionPersonalContent';
import ModalPersonal from './ModalPersonal';

const GestionPersonalPage = () => {
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
              <ToolbarDescription>Administra el personal agregado</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <button className="btn btn-sm btn-light" onClick={handleModalOpen}>
                Nueva Personal
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
        <ModalPersonal open={modalOpen} onClose={handleModalClose} onSave={handleAfterSave} />
        <GestionPersonalContent reload={reloadContent} />
      </Container>
    </Fragment>
  );
};

export default GestionPersonalPage;
