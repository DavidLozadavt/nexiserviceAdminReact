import React, { useState } from 'react';
import { Container } from '@/components/container';
import { useLayout } from '@/providers';

import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider';
import { PersonalContent } from './GestionPersonalContent';

const GestionPersonalPage = () => {
  const { currentLayout } = useLayout();
  const { styles } = useEmpresaThemeContext();
  const [reload, setReload] = useState(false);

  return (
    <>
      {currentLayout?.name === 'demo1-layout' && <Container></Container>}
      <Container>
        <PersonalContent reload={reload} />
      </Container>
    </>
  );
};

export default GestionPersonalPage;

