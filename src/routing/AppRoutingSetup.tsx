import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage } from '@/pages/dashboards';
import { AccountRolesPage } from '@/pages/account';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import ProtectedRoute from '@/auth/ProtectedRoute';
import { MedioPagoPage } from '@/pages/configuracion/config-pagos/medios-pago/MedioPagoPage';
import { TipoPagoPage } from '@/pages/configuracion/config-pagos/tipos-pago/TipoPagoPage';
import { TipoDocumentoPage } from '@/pages/tipos-documento/TipoDocumentoPage';
import PermissionsToggle from '@/pages/account/members/permissions-toggle/blocks/PermissionsToggle';
import ProcesoPage from '@/pages/configuracion/proceso/ProcesoPage';

import { TerceroPage } from '@/pages/registrar-compra/TerceroPage';
import { RegistroCompraPage } from '@/pages/registrar-compra/RegistroCompraPage';
import { CuentasPagarPage } from '@/pages/cuentas-pagar/CuentasPagarPage';
import GestionSedesPage from '@/pages/configuracion/gestion-sedes/GestionSedesPage';
import GestionAlmacenPage from '@/pages/configuracion/gestion-almacen/GestionAlmacenPage';
import PuntosVentaPage from '@/pages/configuracion/gestion-puntos-venta/PuntosVentaPage';
import GestionServicios from '@/pages/configuracion/gestion-servicios/GestionServiciosPage';
import GestionPersonalPage  from '@/pages/gestion-personal/GestionPersonalPage';

import { CuentasCobrarPage } from '@/pages/cuentas-cobrar/CuentasCobrarPage';

import { ConfiguracionEmpresaPage } from '@/pages/configuracion-empresa/ConfiguracionEmpresaPage';
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage';
import { PerfilPage } from '@/pages/perfil/PerfilPage';

import { AreaPage } from '@/pages/areas/AreaPage';
import { GestionPacientes } from '@/pages/historias-clinicas/gestion-pacientes/Gestion-Pacientes';
import { GestionHistorias } from '@/pages/historias-clinicas/gestion-historias/GestionHistorias';
import CalendarioReservas from '@/pages/GestionReservas/CalendarioReservas';
import AuditoriaLogs from '@/pages/historias-clinicas/auditorias/AuditoriaLogs';
import { PacienteCard } from '@/pages/historias-clinicas/gestion-pacientes/components/PacienteCard';

import { PacienteDetalle } from '@/pages/historias-clinicas/PacienteDetalle';

import PuntosVenta from '@/pages/punto-de-venta/Punto-De-Venta';

import { useAuthContext } from '@/auth/useAuthContext';
import { useParams } from 'react-router-dom';
import { useGestionPacientes } from '@/pages/historias-clinicas/gestion-pacientes/hooks/useGestionPacientes';

const PacienteCardWrapper = ({ onVerHistoria }: { onVerHistoria: () => void }) => {
  const { id } = useParams();
  const { handleVerHistoria, handleVerDocumentos, handleVerSeguimiento } = useGestionPacientes();

  // Usar datos temporales para el paciente
  const pacienteTemp = {
    id: id || '1',
    identificacion: '1234567890',
    nombre: 'Juan Carlos Pérez García',
    nombre1: 'Juan Carlos',
    apellido1: 'Pérez García',
    direccion: 'Calle Falsa 123',
    email: 'juan.perez@example.com',
    telefono: '',
    tipoIdentificacion: 'CC',
    idCiudad: 'Bogotá',
    sexo: 'M',
    fechaNac: '1985-05-15',
    eps: 'EPS Salud Total'
  };

  return (
    <PacienteCard
      paciente={pacienteTemp}
      onVerHistoria={() => handleVerHistoria(id)}
      onVerDocumentos={handleVerDocumentos}
      onVerSeguimiento={handleVerSeguimiento}
    />
  );
};

const AppRoutingSetup = (): ReactElement => {
  const context = useAuthContext();

  const { empresa } = context;

  const ID_EMPRESA_LOGUEADA = empresa?.id || 0;

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />
          <Route
            path="punto-venta"
            element={
              <ProtectedRoute requiredPermissions={['PUNTO_VENTAS']}>
                <PuntosVenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="gestion-usuarios/usuarios"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="gestion-usuarios/roles"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_ROLES']}>
                <AccountRolesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="gestion-usuarios/permisos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_ROL_PERMISOS']}>
                <PermissionsToggle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-contratos/areas"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_AREAS']}>
                <AreaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/config-pagos/medios-pago"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_MEDIO_PAGO']}>
                <MedioPagoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/config-pagos/tipos-pago"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_TIPO_PAGO']}>
                <TipoPagoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tipo-documento/tipo-documentos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_TIPO_DOCUMENTOS']}>
                <TipoDocumentoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proceso"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PROCESOS']}>
                <ProcesoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/terceros"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_COMPRAS']}>
                <TerceroPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/terceros/registrar-compra"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_COMPRAS']}>
                <RegistroCompraPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/cuentas-pagar"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_COMPRAS']}>
                <CuentasPagarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/cuentas-cobrar"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CUENTAS_PENDIENTES']}>
                <CuentasCobrarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/gestion-sedes"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_SEDE']}>
                <GestionSedesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="configuracion/gestion-puntos-venta"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <PuntosVentaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/empresa/configuracion-empresa"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONFIGURACION_EMPRESA']}>
                <ConfiguracionEmpresaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <PerfilPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="historias-clinicas/gestion-pacientes"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <GestionPacientes />
              </ProtectedRoute>
            }
          />

          <Route
            path="historias-clinicas/auditoria"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <AuditoriaLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="gestion-agendamientos/agenda"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <CalendarioReservas idCompany={ID_EMPRESA_LOGUEADA} />
              </ProtectedRoute>
            }
          />

          <Route path="/configuracion/gestion-almacen" element={<GestionAlmacenPage />} />
          <Route
            path="paciente/:id"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <PacienteDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion/gestion-almacen"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <GestionAlmacenPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="configuracion/gestion-servicios"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONFIGURACION_SERVICIOS']}>
                <GestionServicios />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion/procesos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <ProcesoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="gestion-personal"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                {<GestionPersonalPage />}
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
