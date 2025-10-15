import React, { useState } from 'react';
import { Search, Download, FileText, Calendar, User, Activity } from 'lucide-react';
import { Log } from './types';

// Mock data for logs
const mockLogs: Log[] = [
  {
    id: 1,
    usuario: 'admin',
    accion: 'Acceso',
    detalle: 'Ingresó al módulo de historias clínicas',
    fechaHora: '2025-10-10 10:00:00',
    tipo: 'info'
  },
  {
    id: 2,
    usuario: 'jdoe',
    accion: 'Modificación',
    detalle: 'Actualizó la historia clínica #123',
    fechaHora: '2025-10-10 11:30:00',
    tipo: 'warning'
  },
  {
    id: 3,
    usuario: 'admin',
    accion: 'Consulta',
    detalle: 'Consultó los registros de auditoría',
    fechaHora: '2025-10-10 12:00:00',
    tipo: 'success'
  },
  {
    id: 4,
    usuario: 'msmith',
    accion: 'Eliminación',
    detalle: 'Eliminó el documento temporal #456',
    fechaHora: '2025-10-10 13:15:00',
    tipo: 'danger'
  },
  {
    id: 5,
    usuario: 'jdoe',
    accion: 'Acceso',
    detalle: 'Ingresó al sistema de reportes',
    fechaHora: '2025-10-10 14:00:00',
    tipo: 'info'
  },
];

export default function AuditoriaLogs() {
  const [logs, setLogs] = useState<Log[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccion, setFilterAccion] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.detalle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAccion === 'all' || log.accion === filterAccion;
    return matchesSearch && matchesFilter;
  });

  const getAccionBadge = (accion: Log['accion'], tipo: Log['tipo']): string => {
  const badges = {
    'Acceso': 'bg-primary-light text-primary',
    'Modificación': 'bg-warning-light text-warning',
    'Consulta': 'bg-success-light text-success',
    'Eliminación': 'bg-danger-light text-danger'
  };
  return badges[accion] || 'bg-gray-200 text-gray-700';
};

  const stats = [
    { label: 'Total de Logs', value: logs.length, icon: Activity, color: 'primary' },
    { label: 'Acciones Hoy', value: logs.length, icon: Calendar, color: 'success' },
    { label: 'Usuarios Activos', value: new Set(logs.map(l => l.usuario)).size, icon: User, color: 'info' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Auditoría de Logs</h1>
          <p className="text-gray-600">Registro completo de actividades del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-card border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-light flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-card border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por usuario o detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterAccion}
                onChange={(e) => setFilterAccion(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todas las acciones</option>
                <option value="Acceso">Acceso</option>
                <option value="Modificación">Modificación</option>
                <option value="Consulta">Consulta</option>
                <option value="Eliminación">Eliminación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Detalle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {log.usuario.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-800">
                          {log.usuario}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAccionBadge(log.accion, log.tipo)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{log.detalle}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {log.fechaHora}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No se encontraron registros</p>
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button 
            onClick={() => alert('Exportar a PDF')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-danger text-white rounded-lg font-medium hover:bg-danger-active transition-colors shadow-sm"
          >
            <FileText className="w-5 h-5" />
            Exportar a PDF
          </button>
          <button 
            onClick={() => alert('Exportar a Excel')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-success text-white rounded-lg font-medium hover:bg-success-active transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Exportar a Excel
          </button>
        </div>
      </div>
    </div>
  );
}