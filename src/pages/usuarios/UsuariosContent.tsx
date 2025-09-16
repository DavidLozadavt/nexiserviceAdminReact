import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components';
import { CommonAvatar } from '@/partials/common';

import { ActivationCompanyUser } from '../network/models/_ActivationCompanyUser';
import axios from 'axios';
import { AssignRoleModal } from '../network/user-cards/team-crew/AssignRoleModal';
import { ModalUsuarios } from './ModalUsuarios';
import { useConfirm } from '@/hooks';
import { enqueueSnackbar } from 'notistack';
import { RoleModel } from '../account/members/roles/models/_Role';
import clsx from 'clsx';

interface IAvatar {
  className: string;
  image?: string;
  imageClass?: string;
  fallback?: string;
  badgeClass: string;
}

interface IMiniCardsContentItem {
  avatar: IAvatar;
  name: string;
  email: string;
  verify: boolean;
}
interface IMiniCardsContentItems extends Array<IMiniCardsContentItem> {}

interface usuariosContentTypeProps {
  reload: boolean;
}

const UsuariosContent = ({ reload }: usuariosContentTypeProps) => {
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [activation, setActivation] = useState<ActivationCompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<ActivationCompanyUser[]>([]);
  const [modalUserOpen, setUserModalOpen] = useState(false);
  const { confirmAction } = useConfirm();

  const [user, setUser] = useState<ActivationCompanyUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('1');

  const fetchRoles = async () => {
    try {
      const response = await axios.get('roles');
      setRoles(response.data);
    } catch (err) {
      setError('Hubo un error al obtener los roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('lista_usuarios');
      setUsers(response.data);
    } catch (err) {
      setError('Hubo un error al obtener los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter((item) => {
      const nombre = item?.user?.persona?.nombre1?.toLowerCase() || '';
      const apellido = item?.user?.persona?.apellido1?.toLowerCase() || '';
      const identificacion = item?.user?.persona?.identificacion?.toLowerCase() || '';
      const term = search.toLowerCase();

      const matchesSearch =
        nombre.includes(term) || apellido.includes(term) || identificacion.includes(term);

      const matchesStatus = statusFilter === '' || String(item?.estado?.id) === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a?.user?.created_at || 0).getTime();
      const dateB = new Date(b?.user?.created_at || 0).getTime();

      if (sortOrder === '1') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  const handleOpenRoles = (activation: ActivationCompanyUser) => {
    setRolesModalOpen(true);
    setActivation(activation);
    handleRolesAssigned(activation);
  };

  const handleCloseRoles = () => {
    setRolesModalOpen(false);
    setActivation(null);
  };

  const handleRolesAssigned = (updatedUser: ActivationCompanyUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? { ...user, roles: updatedUser.roles } : user
      )
    );
  };

  const handleConfirmDelete = (idUser?: number) => {
    if (idUser === undefined) return;
    confirmAction('Esta acción eliminara el usuario.', () => handleDeleteUser(idUser));
  };

  const handleDeleteUser = async (idUser: number) => {
    try {
      await axios.delete(`usuarios/${idUser}`);
      enqueueSnackbar('Usuario eliminado correctamente.', { variant: 'success' });
      fetchUsers();
    } catch (error: unknown) {
      enqueueSnackbar('Error al eliminar el usuario.', { variant: 'error' });
    }
  };

  const handleSaveAsignRol = () => {
    setRolesModalOpen(false);
    fetchUsers();
  };

  const handleSave = () => {
    setUserModalOpen(false);
    fetchUsers();
  };

  const handleEdit = (user: any) => {
    setUser(user.user);
    setUserModalOpen(true);
  };

  const handleToggleStatus = (idUser: number, currentEstado: string) => {
    const nuevoEstado = currentEstado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    confirmAction(
      `¿Seguro que deseas cambiar el estado del usuario a ${nuevoEstado}?`,
      async () => {
        try {
          await axios.post(`update_status_user/${idUser}`, {
            estado: nuevoEstado
          });

          enqueueSnackbar(`Estado cambiado a ${nuevoEstado}.`, { variant: 'success' });
          fetchUsers();
        } catch (error: unknown) {
          enqueueSnackbar('Error al cambiar el estado del usuario.', { variant: 'error' });
        }
      }
    );
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [reload]);

  const renderItem = (item: any, index: number) => {
    const estado = item?.estado?.estado;

    return (
      <div key={index} className="card flex flex-col items-center p-5 lg:py-10 relative">
        {estado && (
          <button
            onClick={() => handleToggleStatus(item.user.id, estado)}
            className={clsx(
              'badge badge-outline absolute top-2 right-2 cursor-pointer transition',
              {
                'badge-danger': estado === 'INACTIVO',
                'badge-primary': estado === 'ACTIVO'
              }
            )}
          >
            {estado}
          </button>
        )}

        <div className="mb-3.5">
          {item?.user?.persona.rutaFotoUrl && (
            <div className="w-20 h-20 rounded-full overflow-hidden relative">
              <CommonAvatar
                className="w-full h-full object-cover"
                image={item?.user?.persona.rutaFotoUrl}
                imageClass="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-2">
          <a
            href="#"
            className="hover:text-primary-active text-base leading-5 font-medium text-gray-900"
          >
            {item?.user?.persona.nombre1} {item?.user?.persona.apellido1}
          </a>
        </div>

        <a href="#" className="text-gray-700 text-sm hover:text-primary-active">
          {item?.user?.email}
        </a>

        <div className="mt-4 w-full border-t pt-3 flex justify-center gap-3">
          <button
            title="Asignar Roles"
            className="btn btn-sm btn-primary"
            onClick={() => handleOpenRoles(item)}
          >
            <KeenIcon icon="toggle-on" />
          </button>

          <button
            className="btn btn-sm btn-secondary"
            title="Editar Usuario"
            onClick={() => handleEdit(item)}
          >
            <KeenIcon icon="pencil" />
          </button>
          <button
            title="Eliminar Usuario"
            className="btn btn-sm btn-danger"
            onClick={() => handleConfirmDelete(item.user.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="flex items-center justify-between gap-2.5 flex-wrap mb-7.5">
        <h3 className="text-md text-gray-900 font-medium">Mostrando {users.length} Usuarios</h3>

        <div className="flex items-center flex-wrap gap-2.5">
          <select
            className="select select-sm w-28"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="1">Activos</option>
            <option value="2">Inactivos</option>
          </select>

          <select
            className="select select-sm w-32"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="1">Más recientes</option>
            <option value="3">Más antiguos</option>
          </select>

          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                placeholder="Buscar usuarios"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-7.5">
        {filteredUsers.map((item, index) => renderItem(item, index))}
      </div>

      <div className="flex grow justify-center pt-5 lg:pt-7.5">{/* paginado */}</div>

      <AssignRoleModal
        open={rolesModalOpen}
        roles={roles}
        activation={activation}
        onClose={handleCloseRoles}
        onRolesAssigned={handleRolesAssigned}
        onSave={handleSaveAsignRol}
      />

      <ModalUsuarios
        open={modalUserOpen}
        persona={user}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSave}
      />
    </Fragment>
  );
};

export { UsuariosContent, type IMiniCardsContentItem, type IMiniCardsContentItems };
