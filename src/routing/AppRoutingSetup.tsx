import { ReactElement, lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
// import { DefaultPage } from '@/pages/dashboards';
// import { AccountRolesPage } from '@/pages/account';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import ProtectedRoute from '@/auth/ProtectedRoute';

// Lazy loaded pages
const DefaultPage = lazy(() => import('@/pages/dashboards').then(m => ({ default: m.DefaultPage })));
const AccountRolesPage = lazy(() => import('@/pages/account').then(m => ({ default: m.AccountRolesPage })));
const MedioPagoPage = lazy(() => import('@/pages/configuracion/config-pagos/medios-pago/MedioPagoPage').then(m => ({ default: m.MedioPagoPage })));
const TipoPagoPage = lazy(() => import('@/pages/configuracion/config-pagos/tipos-pago/TipoPagoPage').then(m => ({ default: m.TipoPagoPage })));
const TipoDocumentoPage = lazy(() => import('@/pages/tipos-documento/TipoDocumentoPage').then(m => ({ default: m.TipoDocumentoPage })));
const PermissionsToggle = lazy(() => import('@/pages/account/members/permissions-toggle/blocks/PermissionsToggle'));
const ProcesoPage = lazy(() => import('@/pages/configuracion/proceso/ProcesoPage'));
const MultimediaPage = lazy(() => import('@/pages/multimedia/gestion-multimedia/MultimediaPage'));
const TerceroPage = lazy(() => import('@/pages/registrar-compra/TerceroPage').then(m => ({ default: m.TerceroPage })));
const RegistroCompraPage = lazy(() => import('@/pages/registrar-compra/RegistroCompraPage').then(m => ({ default: m.RegistroCompraPage })));
const CuentasPagarPage = lazy(() => import('@/pages/cuentas-pagar/CuentasPagarPage').then(m => ({ default: m.CuentasPagarPage })));
const GestionSedesPage = lazy(() => import('@/pages/configuracion/gestion-sedes/GestionSedesPage'));
const GestionAlmacenPage = lazy(() => import('@/pages/configuracion/gestion-almacen/GestionAlmacenPage'));
const PuntosVentaPage = lazy(() => import('@/pages/configuracion/gestion-puntos-venta/PuntosVentaPage'));
const ServiciosPage = lazy(() => import('@/pages/configuracion/gestion-servicios/GestionServiciosPage'));
const GestionEscenariosPage = lazy(() => import('@/pages/configuracion/gestion-escenarios/GestionEscenariosPage'));
const CatalogoPage = lazy(() => import('@/pages/gestion-catalogo-menu/CatalogoPage'));
const GestionPersonalPage = lazy(() => import('@/pages/gestion-personal/GestionPersonalPage'));
const CuentasCobrarPage = lazy(() => import('@/pages/cuentas-cobrar/CuentasCobrarPage').then(m => ({ default: m.CuentasCobrarPage })));
const ConfiguracionEmpresaPage = lazy(() => import('@/pages/configuracion-empresa/ConfiguracionEmpresaPage').then(m => ({ default: m.ConfiguracionEmpresaPage })));
const UsuariosPage = lazy(() => import('@/pages/usuarios/UsuariosPage').then(m => ({ default: m.UsuariosPage })));
const PerfilPage = lazy(() => import('@/pages/perfil/PerfilPage').then(m => ({ default: m.PerfilPage })));
const AreaPage = lazy(() => import('@/pages/areas/AreaPage').then(m => ({ default: m.AreaPage })));
const GestionPacientes = lazy(() => import('@/pages/historias-clinicas/gestion-pacientes/Gestion-Pacientes').then(m => ({ default: m.GestionPacientes })));
const GestionHistorias = lazy(() => import('@/pages/historias-clinicas/gestion-historias/GestionHistorias').then(m => ({ default: m.GestionHistorias })));
const CalendarioReservas = lazy(() => import('@/pages/GestionReservas/CalendarioReservas'));
const AuditoriaLogs = lazy(() => import('@/pages/historias-clinicas/auditorias/AuditoriaLogs'));
const EvolucionPage = lazy(() => import('@/pages/historias-clinicas/evolucionar-historia/EvolucionPage'));
const ConfiguracionProducto = lazy(() => import('@/pages/configuracion/gestion-productos/ConfiguracionProducto'));
const PacienteDetalle = lazy(() => import('@/pages/historias-clinicas/PacienteDetalle').then(m => ({ default: m.PacienteDetalle })));
const Pedidos = lazy(() => import('@/pages/gestionde-pedidos/Pedidos'));
const PedidosPendientes = lazy(() => import('@/pages/gestionde-pedidos/PedidosPendientes'));
const GestionCotizaciones = lazy(() => import('@/pages/gestionde-pedidos/GestionCotizaciones'));
const PuntosVenta = lazy(() => import('@/pages/punto-de-venta/PuntoDeVenta'));
const CalendarioEscenarios = lazy(() => import('@/pages/ReservaEscenario/CalendarioEscenario'));
const GestionVehiculosPage = lazy(() => import('@/pages/taller/gestion-vehiculos/GestionVehiculosPage'));

import { PacienteCard } from '@/pages/historias-clinicas/gestion-pacientes/components/PacienteCard';
import { useAuthContext } from '@/auth/useAuthContext';
import { useParams } from 'react-router-dom';
import { useGestionPacientes } from '@/pages/historias-clinicas/gestion-pacientes/hooks/useGestionPacientes';
// import CalendarioEscenarios from '@/pages/ReservaEscenario/CalendarioEscenario';




const PacienteCardWrapper = ({ onVerHistoria }: { onVerHistoria: () => void }) => {
  const { id } = useParams();
  const { handleVerHistoria, handleVerDocumentos, handleVerSeguimiento } = useGestionPacientes();

  // Usar datos temporales para el paciente
  const pacienteTemp = {
    id: Number(id) || 0,
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
            path="configuracion/gestion-escenarios"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <GestionEscenariosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="configuracion/gestion-servicios"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONFIGURACION_SERVICIOS']}>
                <ServiciosPage />
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
            path="configuracion/gestion-productos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PRODUCTOS']}>
                <ConfiguracionProducto />
              </ProtectedRoute>
            }
          />

          <Route
            path="/empresa/configuracion-empresa"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
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
            path="historias-clinicas/evolucion"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <EvolucionPage />
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
          <Route
            // Debe coincidir con el 'path' de tu menú
            path="/gestion-agendamientos/escenarios"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <CalendarioEscenarios idCompany={ID_EMPRESA_LOGUEADA} />
              </ProtectedRoute>
            }
          />

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

          <Route
            path="terceros"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_TERCEROS']}>
                {<TerceroPage />}
              </ProtectedRoute>
            }
          />

          <Route
            path="gestion-pedidos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PEDIDOS']}>
                {<Pedidos />}
              </ProtectedRoute>
            }
          />

          <Route
            path="gestion-pedidos-pendientes"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PEDIDOS']}>
                {<PedidosPendientes />}
              </ProtectedRoute>
            }
          />

          <Route
            path="gestionde-pedidos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_COTIZACIONES']}>
                {<GestionCotizaciones />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/multimedia/gestion-multimedia"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                {<MultimediaPage />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/taller/gestion-vehiculos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                <GestionVehiculosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-catalogo-menu"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_USUARIO']}>
                {<CatalogoPage />}
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
