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
import MultimediaContent from './MultimediaContent';

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
              <ToolbarDescription>Administra tus historias</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <button className="btn btn-sm btn-light" onClick={handleModalOpen}>
                Nueva Historia
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
      
        <MultimediaContent reload={reloadContent} />
      </Container>
    </Fragment>
  );
};

export default GestionSedesPage;
