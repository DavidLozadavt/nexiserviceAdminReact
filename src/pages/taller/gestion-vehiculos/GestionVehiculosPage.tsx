import { Fragment } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { KeenIcon } from '@/components/keenicons';

const GestionVehiculosPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Gestión y recepción de vehículos del taller</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Vehículos Registrados</h3>
            </div>
            <div className="card-body">
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <KeenIcon icon="car" className="text-4xl mb-3 text-gray-400" />
                <p className="text-lg font-medium">Módulo de Gestión de Vehículos</p>
                <p className="text-sm text-gray-400 mt-1">
                  Sección en desarrollo — próximamente podrás registrar, consultar y gestionar vehículos del taller.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default GestionVehiculosPage;
