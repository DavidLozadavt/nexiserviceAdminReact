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
import ConexionesPage from '@/pages/conexiones/ConexionesPage';
import { CanvaPage } from '@/pages/canva/CanvaPage';
import { BoardPage } from '@/pages/canva/BoardPage';
import { ContratacionPage } from '@/pages/contratacion/ContratacionPage';
import { ContratosPage } from '@/pages/contratos/ContratosPage';
import { ContratoPage } from '@/pages/contratos/ContratoPage';
import { PagosPendientesPage } from '@/pages/pagos-contratos/pagos-pendientes/PagosPendientesPage';
import { PagoPendientePage } from '@/pages/pagos-contratos/pagos-pendientes/PagoPendientePage';
import { ConfiguracionNominaPage } from '@/pages/nomina/ConfiguracionNominaPage';
import { CentroCostosPage } from '@/pages/centro-costos/CentroCostosPage';
import { TarifasRiesgoPage } from '@/pages/tarifas-riesgo/TarifasRiesgoPage';
import { ConfiguracionHorasExtraPage } from '@/pages/configuracion-horas-extras/ConfiguracionHorasExtraPage';
import { ComisionPage } from '@/pages/comisiones/ComisionPage';
import { TuNominaPage } from '@/pages/tu-nomina/TuNominaPage';
import { SolicitudVacacionesPage } from '@/pages/tu-nomina/novedades/vacaciones/SolicitudVacacionesPage';
import { SolicitudVacacionesAdminPage } from '@/pages/tu-nomina/novedades/vacaciones/admin/SolicitudVacacionesAdminPage';
import { SolicitudIncapacidadLicenciaAdminPage } from '@/pages/tu-nomina/novedades/licencias-permisos/admin/SolicitudIncapacidadLicenciaAdminPage';
import { SolicitudIncapacidadLicenciaPage } from '@/pages/tu-nomina/novedades/licencias-permisos/SolicitudIncapacidadLicenciaPage';
import { TipoIncapacidadesPage } from '@/pages/tipo-incapacidades/TipoIncapacidadesPage';
import { TerceroPage } from '@/pages/registrar-compra/TerceroPage';
import { RegistroCompraPage } from '@/pages/registrar-compra/RegistroCompraPage';
import { CuentasPagarPage } from '@/pages/cuentas-pagar/CuentasPagarPage';
import GestionSedesPage from '@/pages/gestion-sedes/GestionSedesPage';
import PuntosVentaPage from '@/pages/gestion-puntos-venta/PuntosVentaPage';
import PuntosDeVentaPage from '@/pages/puntos-de-venta/PuntosDeVentaPage';
import CajaContent from '@/pages/puntos-de-venta/Caja/CajaContent';
import { AfiliacionVehiculoPage } from '@/pages/afiliacion-vehiculos/AfiliacionVehiculoPage';
import GestionRutasPage from '@/pages/transporte/gestion-rutas/GestionRutasPage';
import { AfiliacionesPage } from '@/pages/afiliaciones/AfiliacionesPage';
import CronogramaRutasPage from '@/pages/transporte/cronograma-rutas/CronogramaRutasPage';
import { CuentasCobrarPage } from '@/pages/cuentas-cobrar/CuentasCobrarPage';
import CajaPage from '@/pages/puntos-de-venta/Caja/CajaPage';
import PosTiendaPage from '@/pages/Pos/PosTiendaPage';
import { PosPage } from '@/pages/Pos/components/PosPage';
import { ConfiguracionEmpresaPage } from '@/pages/configuracion-empresa/ConfiguracionEmpresaPage';
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage';
import { PerfilPage } from '@/pages/perfil/PerfilPage';
import { TipoContratoPage } from '@/pages/tipo-contrato/TipoContratoPage';
import { EntidadesSeguridadSocialPage } from '@/pages/entidades-seguridad-social/EntidadesSeguridadSocialPage';
import { CuentasPucPage } from '@/pages/cuentas-puc/CuentasPucPage';
import { AreaPage } from '@/pages/areas/AreaPage';
import { HorasExtraTrabajadorPage } from '@/pages/tu-nomina/novedades/horas-extra/horas-extra-trabajador/HorasExtraTrabajadorPage';
import { HorasExtraAdminPage } from '@/pages/tu-nomina/novedades/horas-extra/admin/HorasExtraAdminPage';
import { OtrasDeduccionesPage } from '@/pages/tu-nomina/novedades/otras-deducciones/OtrasDeduccionesPage';
import { ReporteSuperintendenciaPage } from '@/pages/reporte-superintendencia/ReporteSuperintendenciaPage';
import { BonificacionPage } from '@/pages/tu-nomina/novedades/bonificaciones/BonificacionPage';
import { ReemplazoPage } from '@/pages/tu-nomina/novedades/reemplazos/ReemplazoPage';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DefaultPage />} />

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
            path="/gestion-contratos/contratacion"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONTRATACION']}>
                <ContratacionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-contratos/contratos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONTRATOS']}>
                <ContratosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-contratos/contratos/contrato"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONTRATOS']}>
                <ContratoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-contratos/tipo-contratos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_TIPO_CONTRATO']}>
                <TipoContratoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-contratos/entidades-seguridad-social"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_ENTIDADES_SEGURIDAD_SOCIAL']}>
                <EntidadesSeguridadSocialPage />
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
            path="/gestion-contratos/pagos-pendientes/pago"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PAGOS_CONTRATOS']}>
                <PagoPendientePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-contratos/pagos-pendientes"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PAGOS_CONTRATOS']}>
                <PagosPendientesPage />
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
            path="/aplicaciones/canva"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_BOARD_TASK']}>
                <CanvaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aplicaciones/canva/board"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_BOARD_TASK']}>
                <BoardPage />
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
            path="/conexiones"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CONEXIONES']}>
                <ConexionesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/configuracion"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <ConfiguracionNominaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nomina/centros-costos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <CentroCostosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/tarifas-riesgo"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <TarifasRiesgoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/configuracion-horas-extra"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <ConfiguracionHorasExtraPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/comisiones"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <ComisionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/tipo-incapacidad"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <TipoIncapacidadesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/tu-nomina"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <TuNominaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/novedades/vacaciones-trabajador"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA_TRABAJADOR']}>
                <SolicitudVacacionesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/novedades/vacaciones-admin"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <SolicitudVacacionesAdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/novedades/licencias-trabajador"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA_TRABAJADOR']}>
                <SolicitudIncapacidadLicenciaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/novedades/licencias-admin"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <SolicitudIncapacidadLicenciaAdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/novedades/horas-extra-admin"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <HorasExtraAdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nomina/novedades/horas-extra-trabajador"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_HORAS_EXTRA_TRABAJADOR']}>
                <HorasExtraTrabajadorPage />
              </ProtectedRoute>
            }
          />


      <Route
            path="/nomina/novedades/otras-deducciones"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <OtrasDeduccionesPage />
              </ProtectedRoute>
            }
          />


          
      <Route
            path="/nomina/novedades/bonificaciones"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <BonificacionPage />
              </ProtectedRoute>
            }
          />


               <Route
            path="/nomina/novedades/reemplazos"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_NOMINA']}>
                <ReemplazoPage />
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
            path="/sedes/gestion-sedes"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_SEDE']}>
                <GestionSedesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestion-punto-de-ventas/punto-ventas"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <PuntosVentaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/punto-de-ventas/puntos-de-ventas"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <PuntosDeVentaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/punto-de-ventas/pos-tienda"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <PosTiendaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tienda/caja/:idPunto?"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <PosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/caja/:idPunto?"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <CajaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-vinculaciones/vinculacion-vehiculo"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_AFILIACIONES']}>
                <AfiliacionVehiculoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transporte/gestion-rutas"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_PUNTO_VENTAS']}>
                <GestionRutasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cronograma/cronograma-rutas"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_AFILIACIONES']}>
                <CronogramaRutasPage />
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
            path="/gestion-vinculaciones/vinculaciones"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_AFILIACIONES']}>
                <AfiliacionesPage />
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
            path="/gestion-cuentas/cuentas-puc"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_CUENTAS_PUC']}>
                <CuentasPucPage />
              </ProtectedRoute>
            }
          />


            <Route
            path="/reporte-superintendencia/reporte-superintendencia"
            element={
              <ProtectedRoute requiredPermissions={['GESTION_REPORTE_SUPERINTENDENCIA']}>
                <ReporteSuperintendenciaPage />
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
