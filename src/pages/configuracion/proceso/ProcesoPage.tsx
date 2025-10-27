import { Container } from '@/components/container';
import { useLayout } from '@/providers';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import React, { Fragment, useState } from 'react';
import ProcesoContent from './ProcesoContent';
import ModalProceso from './ModalProceso';

// ✅ Importar estilos dinámicos
import { useEmpresaThemeContext } from '../../../colores/EmpresaThemeProvider';

const ProcesoPage = () => {
  const { currentLayout } = useLayout();
  const { styles } = useEmpresaThemeContext();
  const [procesoModalOpen, setProcesoModalOpen] = useState(false);
  const [reloadContent, setReloadContent] = useState(false);

  const handleProcesoModalOpen = () => setProcesoModalOpen(true);
  const handleModalClose = () => setProcesoModalOpen(false);

  const handleAfterSave = () => {
    setReloadContent((prev) => !prev);
    setProcesoModalOpen(false);
  };

  return (
    <>
      {/* Encabezado superior con título */}
      {currentLayout?.name === 'demo1-layout' && <Container></Container>}

      {/* Contenido */}
      <Container>
        <ProcesoContent reload={reloadContent} />
      </Container>

      {/* Modal */}
      <ModalProceso open={procesoModalOpen} onClose={handleModalClose} onSave={handleAfterSave} />
    </>
  );
};

export default ProcesoPage;
