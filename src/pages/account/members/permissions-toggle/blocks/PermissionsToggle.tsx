import { KeenIcon } from '@/components';
import { CommonHexagonBadge } from '@/partials/common';
import { PermissionModel } from '../models/_Permission';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

import { useSnackbar } from 'notistack';
import { RoleModel } from '../../roles/models/_Role';

const PermissionsToggle = React.memo(() => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      try {
        const rolesResponse = await axios.get('roles');
        setRoles(rolesResponse.data);
        const permissionsResponse = await axios.get('permisos');
        setPermissions(permissionsResponse.data);
      } catch (err) {
        setError("Hubo un error al obtener los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchRolesAndPermissions();
  }, []);

  const handleRoleChange = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = Number(event.target.value);
    setSelectedRole(roleId);

    const response = await axios.get(`permisos_rol?rol=${roleId}`);
    setActivePermissions(response.data);
  }, []);

  const handlePermissionChange = useCallback((permissionId: string) => {
    setActivePermissions(prevState =>
      prevState.includes(permissionId)
        ? prevState.filter(id => id !== permissionId)
        : [...prevState, permissionId]
    );
  }, []);

  const assignPermissions = useCallback(async () => {
    if (selectedRole === null) return;

    setSaving(true);
    try {
      const permissionIds = permissions
        .filter(permission => activePermissions.includes(permission.name))
        .map(permission => permission.id);

      const payload = {
        idRol: selectedRole,
        funciones: permissionIds,
      };

      await axios.put('asignar_rol_permiso', payload);
      enqueueSnackbar('Permisos asignados correctamente', {
        variant: 'solid',
        state: 'success'
      });
    } catch (err) {
      enqueueSnackbar('Hubo un error al asignar los permisos', {
        variant: 'solid',
        state: 'danger'
      });
    } finally {
      setSaving(false);
    }
  }, [selectedRole, activePermissions, permissions, enqueueSnackbar]);

  const totalPages = Math.ceil(permissions.length / itemsPerPage);

  const renderItem = useCallback((item: PermissionModel, index: number) => {
    const isChecked = activePermissions.includes(item.name);

    return (
      <div key={index} className="rounded-xl border p-4 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3.5">
          <CommonHexagonBadge
            stroke="stroke-gray-300"
            fill="fill-gray-100"
            size="size-[45px]"
            badge={<KeenIcon icon="security-user" className="text-lg text-gray-500" />}
          />
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 leading-none font-medium text-sm text-gray-900">
              {item.name}
            </span>
            <span className="text-2sm text-gray-700">{item.description}</span>
          </div>
        </div>
        <div className="switch switch-sm">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handlePermissionChange(item.name)}
          />
        </div>
      </div>
    );
  }, [activePermissions, handlePermissionChange]);

  const handlePageClick = useCallback((selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const currentItems = permissions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Permisos
          <a href="#" className="link" onClick={(e) => e.preventDefault()}>
            &nbsp;Virtual Technology
          </a>
        </h3>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-900 text-center">Seleccionar Rol</label>
          <select
            className="select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            name="select"
            value={selectedRole || ''}
            onChange={handleRoleChange}
          >
            <option value="" disabled>Seleccionar un rol</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card-body grid grid-cols-1 lg:grid-cols-2 gap-5 py-5 lg:py-7.5">
        {currentItems.map((item, index) => renderItem(item, index))}
      </div>

      <div className="flex justify-center space-x-3 my-3">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          {'<'}
        </button>
        <span>{`Página ${currentPage + 1} de ${totalPages}`}</span>
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          {'>'}
        </button>
      </div>

      <button
        type="button"
        className="btn btn-success flex justify-center mt-4"
        onClick={assignPermissions}
        disabled={saving}
      >
        {saving ? 'Guardando...' : 'Asignar permisos'}
      </button>
    </div>
  );
});

export default PermissionsToggle;
