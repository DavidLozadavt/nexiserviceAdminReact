import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage } from '@/pages/dashboards';
import { AccountRolesPage } from '@/pages/account';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import ProtectedRoute from '@/auth/ProtectedRoute';
import { MedioPagoPage } from '@/pages/medios-pago/MedioPagoPage';
import { TipoPagoPage } from '@/pages/tipos-pago/TipoPagoPage';
import { TipoDocumentoPage } from '@/pages/tipos-documento/TipoDocumentoPage';
import PermissionsToggle from '@/pages/account/members/permissions-toggle/blocks/PermissionsToggle';
import ProcesoPage from '@/pages/proceso/ProcesoPage';

import { TerceroPage } from '@/pages/registrar-compra/TerceroPage';
import { RegistroCompraPage } from '@/pages/registrar-compra/RegistroCompraPage';
import { CuentasPagarPage } from '@/pages/cuentas-pagar/CuentasPagarPage';
import GestionSedesPage from '@/pages/configuracion/gestion-sedes/GestionSedesPage';
import GestionAlmacenPage from '@/pages/configuracion/gestion-almacen/GestionAlmacenPage';
import PuntosVentaPage from '@/pages/configuracion/gestion-puntos-venta/PuntosVentaPage';

import { CuentasCobrarPage } from '@/pages/cuentas-cobrar/CuentasCobrarPage';

import { ConfiguracionEmpresaPage } from '@/pages/configuracion-empresa/ConfiguracionEmpresaPage';
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage';
import { PerfilPage } from '@/pages/perfil/PerfilPage';

import { AreaPage } from '@/pages/areas/AreaPage';
import { GestionPacientes } from '@/pages/historias-clinicas/gestion-pacientes/Gestion-Pacientes';
import { GestionHistorias } from '@/pages/historias-clinicas/gestion-historias/GestionHistorias';
import CalendarioReservas from '@/pages/GestionReservas/CalendarioReservas';
import AuditoriaLogs from '@/pages/historias-clinicas/auditorias/AuditoriaLogs';

import PuntosVenta from '@/pages/punto-de-venta/Punto-De-Venta';

import { useAuthContext } from '@/auth/useAuthContext';

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
            path="/pagos/medio-pagos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_MEDIO_PAGO']}>
                <MedioPagoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pagos/tipo-pagos"
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
            path="gestion-agendamientos/agenda"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <CalendarioReservas idCompany={ID_EMPRESA_LOGUEADA} />
              </ProtectedRoute>
            }
          />

          <Route path="/configuracion/gestion-almacen" element={<GestionAlmacenPage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
