import { type TMenuConfig } from '@/components/menu';
import path from 'path';

export const MENU_SIDEBAR: TMenuConfig = [
  {
    title: 'Puntos de Venta',
    icon: 'shopping-bag',
    path: '/punto-venta',
    requiredPermissions: ['ADMINISTRACION_PUNTOS_VENTA']
  },
  {
    title: 'Configuración',
    icon: 'setting',
    children: [
      {
        title: 'Procesos',
        path: '/configuracion/procesos',
        requiredPermissions: ['GESTION_PROCESOS']
      },

      {
        title: 'Gestión Almacen',
        path: '/configuracion/gestion-almacen',
        requiredPermissions: ['GESTION_ALMACEN']
      },
      {
        title: 'Gestión Sedes',
        path: '/configuracion/gestion-sedes',
        requiredPermissions: ['GESTION_SEDE']
      },
      {
        title: 'Gestión Puntos de Venta',
        path: '/configuracion/gestion-puntos-venta',
        requiredPermissions: ['GESTION_PUNTO_VENTAS']
      },
      {
        title: 'Gestión Servicios',
        icon: 'support',
        requiredPermissions: ['GESTION_CONFIGURACION_SERVICIOS'],
        path: '/configuracion/gestion-servicios'
      },
      {
        title: 'Configuración de Empresa',
        requiredPermissions: ['GESTION_USUARIO'],
        path: '/empresa/configuracion-empresa'
      },
      {
        title: 'Config de Pagos',
        requiredPermissions: ['GESTION_USUARIO'],

        children: [
          {
            title: 'Medios de Pago',
            path: '/configuracion/config-pagos/medios-pago',
            requiredPermissions: ['GESTION_MEDIO_PAGO']
          },
          {
            title: 'Tipos de Pago',
            path: '/configuracion/config-pagos/tipos-pago',
            requiredPermissions: ['GESTION_TIPO_PAGO']
          }
        ]
      }
    ]
  },

  {
    title: 'Gestión de Usuarios',
    icon: 'users',
    children: [
      {
        title: 'Usuarios',
        path: '/gestion-usuarios/usuarios',
        requiredPermissions: ['GESTION_USUARIO']
      },
      {
        title: 'Roles',
        path: '/gestion-usuarios/roles',
        requiredPermissions: ['GESTION_ROLES']
      },
      {
        title: 'Permisos',
        path: '/gestion-usuarios/permisos',
        requiredPermissions: ['GESTION_ROL_PERMISOS']
      }
    ]
  },
  {
    title: 'Historias Clínicas',
    icon: 'document',
    children: [
      {
        title: 'Gestión de Pacientes',
        path: '/historias-clinicas/gestion-pacientes',
        requiredPermissions: ['GESTION_USUARIO']
      },
      {
        title: 'Auditoría y Legalidad',
        path: '/historias-clinicas/auditoria',
        requiredPermissions: ['GESTION_USUARIO']
      }
    ]
  },
  {
    title: 'Gestión Agenda ',
    icon: 'calendar',
    requiredPermissions: ['GESTION_USUARIO'],
    path: '/gestion-agendamientos/agenda'
  },

  {
    title: 'Gestión de Personal',
    icon: 'profile-circle',
    requiredPermissions: ['GESTION_USUARIO'],
    path: '/gestion-personal'
  },

  // {
  //   title: 'Contabilidad',
  //   icon: 'chart-line',
  //   requiredPermissions: ['GESTION_NOMINA'],
  //   children: [
  //     {
  //       title: 'Centro de Costos',
  //       path: '/nomina/centros-costos',
  //       requiredPermissions: ['GESTION_NOMINA']
  //     }
  //   ]
  // },

  {
    title: 'Configuracion Pagos ',
    icon: 'setting',
    requiredPermissions: ['GESTION_NOMINA'],
    children: [
      // {
      //   title: 'Config de Pagos',
      //   requiredPermissions: ['GESTION_NOMINA'],
      //   children: [
      //     {
      //       title: 'Medios de Pago',
      //       path: '/pagos/medio-pagos',
      //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
      //     },
      //     {
      //       title: 'Tipos de Pago',
      //       path: '/pagos/tipo-pagos',
      //       requiredPermissions: ['GESTION_TIPO_PAGO']
      //     },
      //     {
      //       title: 'Tipos de Transacción',
      //       path: '/pagos/tipo-transaccion',
      //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
      //     }
      //   ]
      // },
      // {
      //   title: 'Config de Documentos',
      //   icon: 'setting',
      //   requiredPermissions: ['GESTION_NOMINA'],
      //   children: [
      //     {
      //       title: 'Tipos de Documentos',
      //       path: '/tipo-documento/tipo-documentos',
      //       requiredPermissions: ['GESTION_TIPO_DOCUMENTOS']
      //     },
      //     {
      //       title: 'Proceso',
      //       path: '/proceso',
      //       requiredPermissions: ['GESTION_TIPO_DOCUMENTOS']
      //     }
      //   ]
      // },
      // {
      //   title: 'Tipos de Contrato',
      //   path: '/gestion-contratos/tipo-contratos',
      //   requiredPermissions: ['GESTION_TIPO_CONTRATO']
      // },
      // {
      //   title: 'Entidades Seguridad Social',
      //   path: '/gestion-contratos/entidades-seguridad-social',
      //   requiredPermissions: ['GESTION_ENTIDADES_SEGURIDAD_SOCIAL']
      // },
      // {
      //   title: 'Áreas',
      //   path: '/gestion-contratos/areas',
      //   requiredPermissions: ['GESTION_AREAS']
      // }
    ]
  },

  // {
  //   title: 'Compras',
  //   icon: 'shop',
  //   children: [
  //     {
  //       title: 'Registrar Compra',
  //       path: '/compras/terceros',
  //       requiredPermissions: ['GESTION_COMPRAS']
  //     },
  //     {
  //       title: 'Cuentas Por Pagar',
  //       path: '/compras/cuentas-pagar',
  //       requiredPermissions: ['GESTION_COMPRAS']
  //     },
  //     {
  //       title: 'Cuentas Por Cobrar',
  //       path: '/compras/cuentas-cobrar',
  //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
  //     }
  //   ]
  // },

  {
    title: 'Aplicaciones',
    icon: 'category',
    children: [
      // {
      //   title: 'Chat',
      //   path: '/network/get-started',
      //   requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
      // },
      {
        title: 'Tableros Kanban',
        path: '/aplicaciones/canva',
        requiredPermissions: ['GESTION_BOARD_TASK']
      }
      // {
      //   title: 'Videollamada',
      //   path: '/network/get-started',
      //   requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
      // }
    ]
  },
  // {
  //   title: 'Productos Empresariales',
  //   icon: 'briefcase',
  //   children: [
  //     {
  //       title: 'Productos',
  //       path: '/network/get-started',
  //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
  //     },
  //     {
  //       title: 'Planes',
  //       path: '/network/get-started',
  //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
  //     },

  //     {
  //       title: 'Conexiones',
  //       path: '/conexiones',
  //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
  //     },
  //     {
  //       title: 'Solicitudes',
  //       path: '/network/get-started',
  //       requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
  //     }
  //   ]
  // },
  {
    title: 'Gestión de Cuentas',
    icon: 'bill',
    children: [
      {
        title: 'Cuentas por Pagar',
        path: '/gestion-cuentas/get-started',
        requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
      },
      {
        title: 'Cuentas por Cobrar',
        path: '/gestion-cuentas/get-started',
        requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
      },
      {
        title: 'Cuentas PUC',
        path: '/gestion-cuentas/cuentas-puc',
        requiredPermissions: ['GESTION_CUENTAS_PUC']
      }
    ]
  },
  {
    title: 'Reporte Superintendencia',
    icon: 'arrow-down-refraction',
    children: [
      {
        title: 'Reporte Superintendencia',
        path: '/reporte-superintendencia/reporte-superintendencia',
        requiredPermissions: ['GESTION_REPORTE_SUPERINTENDENCIA']
      }
    ]
  },

  {
    title: 'Authentication',
    icon: 'security-user',
    children: [
      {
        title: 'Classic',
        children: [
          {
            title: 'Sign In',
            path: '/auth/classic/login'
          },
          {
            title: 'Sign Up',
            path: '/auth/classic/signup'
          },
          {
            title: '2FA',
            path: '/auth/classic/2fa'
          },
          {
            title: 'Check Email',
            path: '/auth/classic/check-email'
          },
          {
            title: 'Reset Password',
            children: [
              {
                title: 'Enter Email',
                path: '/auth/classic/reset-password/enter-email'
              },
              {
                title: 'Check Email',
                path: '/auth/classic/reset-password/check-email'
              },
              {
                title: 'Change Password',
                path: '/auth/classic/reset-password/change'
              },
              {
                title: 'Password Changed',
                path: '/auth/classic/reset-password/changed'
              }
            ]
          }
        ]
      },
      {
        title: 'Branded',
        children: [
          {
            title: 'Sign In',
            path: '/auth'
          },
          {
            title: 'Sign Up',
            path: '/auth/signup'
          },
          {
            title: '2FA',
            path: '/auth/2fa'
          },
          {
            title: 'Check Email',
            path: '/auth/check-email'
          },
          {
            title: 'Reset Password',
            children: [
              {
                title: 'Enter Email',
                path: '/auth/reset-password/enter-email'
              },
              {
                title: 'Check Email',
                path: '/auth/reset-password/check-email'
              },
              {
                title: 'Change Password',
                path: '/auth/reset-password/change'
              },
              {
                title: 'Password Changed',
                path: '/auth/reset-password/changed'
              }
            ]
          }
        ]
      },
      {
        title: 'Welcome Message',
        path: '/auth/welcome-message'
      },
      {
        title: 'Account Deactivated',
        path: '/auth/account-deactivated'
      },
      {
        title: 'Error 404',
        path: '/error/404'
      },
      {
        title: 'Error 500',
        path: '/error/500'
      }
    ]
  }
];

export const MENU_MEGA: TMenuConfig = [
  {
    title: 'Home',
    path: '/'
  },
  {
    title: 'Profiles',
    children: [
      {
        title: 'Profiles',
        children: [
          {
            children: [
              {
                title: 'Default',
                icon: 'badge',
                path: '/public-profile/profiles/default',
                requiredPermissions: ['GESTION_CUENTAS_PENDIENTES']
              },
              {
                title: 'Creator',
                icon: 'coffee',
                path: '/public-profile/profiles/creator'
              },
              {
                title: 'Company',
                icon: 'abstract-41',
                path: '/public-profile/profiles/company'
              },
              {
                title: 'NFT',
                icon: 'bitcoin',
                path: '/public-profile/profiles/nft'
              },
              {
                title: 'Blogger',
                icon: 'message-text',
                path: '/public-profile/profiles/blogger'
              },
              {
                title: 'CRM',
                icon: 'devices',
                path: '/public-profile/profiles/crm'
              },
              {
                title: 'Gamer',
                icon: 'ghost',
                path: '/public-profile/profiles/gamer'
              }
            ]
          },
          {
            children: [
              {
                title: 'Feeds',
                icon: 'book',
                path: '/public-profile/profiles/feeds'
              },
              {
                title: 'Plain',
                icon: 'files',
                path: '/public-profile/profiles/plain'
              },
              {
                title: 'Modal',
                icon: 'mouse-square',
                path: '/public-profile/profiles/modal'
              },
              {
                title: 'Freelancer',
                icon: 'financial-schedule',
                path: '#',
                disabled: true
              },
              {
                title: 'Developer',
                icon: 'technology-4',
                path: '#',
                disabled: true
              },
              {
                title: 'Team',
                icon: 'users',
                path: '#',
                disabled: true
              },
              {
                title: 'Events',
                icon: 'calendar-tick',
                path: '#',
                disabled: true
              }
            ]
          }
        ]
      }
    ]
  }
];

export const MENU_ROOT: TMenuConfig = [
  {
    title: 'Public Profile',
    icon: 'profile-circle',
    rootPath: '/public-profile/',
    path: 'public-profile/profiles/default',
    childrenIndex: 2
  },
  {
    title: 'Account',
    icon: 'setting-2',
    rootPath: '/account/',
    path: '/',
    childrenIndex: 3
  },
  {
    title: 'Network',
    icon: 'users',
    rootPath: '/network/',
    path: 'network/get-started',
    childrenIndex: 4
  },
  {
    title: 'Authentication',
    icon: 'security-user',
    rootPath: '/authentication/',
    path: 'authentication/get-started',
    childrenIndex: 5
  }
];
