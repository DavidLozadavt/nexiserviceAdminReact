import { useAuthContext } from '@/auth';
import { Container } from '@/components';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

const ConfiguracionEmpresaPage = () => {
  const authContext = useAuthContext();
  const { empresa } = authContext;

  const [formData, setFormData] = useState({
    razonSocial: empresa?.razonSocial || '',
    nit: empresa?.nit || '',
    digitoVerificacion: empresa?.digitoVerificacion || '',
    email: empresa?.email || '',
    direccion: empresa?.direccion || '',
    telefono: empresa?.telefono || '',
    representanteLegal: empresa?.representanteLegal || '',
    devolucion: empresa?.devolucion || '',
    garantia: empresa?.garantia || '',
    valorIva: empresa?.valorIva || '',
    responsableIva: empresa?.responsableIva || 0,
    retenciones: empresa?.retenciones || 0,
    facturacionElectronica: 0
  });

  const [logoPreview, setLogoPreview] = useState(empresa?.rutaLogoUrl || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value as string);
      });
      if (logoFile) {
        dataToSend.append('rutaLogoFile', logoFile);
      }

      await axios.post(`company_update`, dataToSend);
      enqueueSnackbar('Datos actualizados correctamente', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al actualizar la empresa', { variant: 'error' });
    }
  };

  if (!empresa) return <div>Cargando...</div>;

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <div className="card pb-2.5">
          <div className="card-header">
            <h3 className="card-title">Configuración de Empresa</h3>
          </div>
          <div className="card-body grid gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-5 items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <label className="form-label max-w-56">Logo</label>
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex items-baseline gap-2.5">
                  <label className="form-label max-w-56">Razón Social</label>
                  <input
                    type="text"
                    name="razonSocial"
                    className="input"
                    value={formData.razonSocial}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-baseline gap-2.5">
                  <label className="form-label max-w-56">NIT</label>
                  <input
                    type="text"
                    name="nit"
                    className="input"
                    value={formData.nit}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-baseline gap-2.5">
                  <label className="form-label max-w-56">Dígito de Verificación</label>
                  <input
                    type="number"
                    name="digitoVerificacion"
                    className="input"
                    value={formData.digitoVerificacion}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-center items-center border rounded ">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Vista previa"
                    className="w-full h-52 object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No hay logo seleccionado</span>
                )}
              </div>
            </div>

            {[
              { label: 'Correo', name: 'email', type: 'email' },
              { label: 'Dirección', name: 'direccion', type: 'text' },
              { label: 'Teléfono', name: 'telefono', type: 'text' },
              { label: 'Representante Legal', name: 'representanteLegal', type: 'text' },
              { label: 'Días hábiles para devolución', name: 'devolucion', type: 'number' },
              { label: 'Días hábiles para garantía', name: 'garantia', type: 'number' },
              { label: 'Valor IVA (%)', name: 'valorIva', type: 'number' }
            ].map((field) => (
              <div
                key={field.name}
                className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5"
              >
                <label className="form-label max-w-56">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  className="input"
                  value={formData[field.name as keyof typeof formData] as string}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label max-w-56">Responsable IVA</label>
              <select
                name="responsableIva"
                className="select"
                value={formData.responsableIva}
                onChange={handleChange}
              >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
              </select>
            </div>

            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label max-w-56">Retenciones</label>
              <select
                name="retenciones"
                className="select"
                value={formData.retenciones}
                onChange={handleChange}
              >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
              </select>
            </div>

            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <label className="form-label max-w-56">Facturación Electrónica</label>
              <select
                name="facturacionElectronica"
                className="select"
                value={formData.facturacionElectronica}
                onChange={handleChange}
              >
                <option value={1}>Sí</option>
                <option value={0}>No</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </form>
    </Container>
  );
};

export { ConfiguracionEmpresaPage };
