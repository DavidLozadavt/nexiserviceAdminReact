
import React, { useState } from 'react';
import { Snackbar } from '@/components/Snackbar';
import { HistoriaClinica } from './types';
import { useHistoriaClinicaForm } from './hooks/useHistoriaClinicaForm';
import { FormHeader } from './components/FormHeader';
import { TipoHistoriaSelector } from './components/TipoHistoriaSelector';
import { TextAreaField } from './components/TextAreaField';
import { AntecedentesSection } from './components/AntecedentesSection';
import { TagAutocomplete } from './components/TagAutocomplete';
import { cieDiagnosticos } from './components/autocompleteData';
import { InfoBanner } from './components/InfoBanner';
import { FormActions } from './components/FormActions';
import { crearHistoriaClinica, actualizarHistoriaClinica } from './historiaClinicaService';

interface HistoriaClinicaFormProps {
  onGuardar: (historia: HistoriaClinica) => void;
  onCancelar: () => void;
  historiaExistente?: HistoriaClinica;
  pacienteId: number;
}

export const HistoriaClinicaForm: React.FC<HistoriaClinicaFormProps> = ({
  onGuardar,
  onCancelar,
  historiaExistente,
  pacienteId,
}) => {
  const { form, setForm, handleChange, validateForm, getFormData } = useHistoriaClinicaForm(historiaExistente);
  const [isAntecedentesExpanded, setIsAntecedentesExpanded] = useState(true);
  const [snackbar, setSnackbar] = useState<{ message: string; type?: 'error' | 'success' | 'info' | 'warning' } | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingField = validateForm();
    if (missingField) {
      // Try to scroll and focus to the missing field
      let selector = '';
      switch (missingField) {
        case 'motivoConsulta':
          selector = '[name="motivoConsulta"]';
          break;
        case 'diagnostico':
          selector = '[name="diagnostico"]';
          break;
        case 'tratamiento':
          selector = '[name="tratamiento"]';
          break;
        case 'enfermedad_actual':
         selector = '[name="enfermedadActual"]';
          break;
        case 'examenFisico.peso':
          selector = '[name="examenFisico.peso"]';
          break;
        case 'examenFisico.altura':
          selector = '[name="examenFisico.altura"]';
          break;
        case 'examenFisico.presionArterial':
          selector = '[name="examenFisico.presionArterial"]';
          break;
        case 'examenFisico.frecuenciaCardiaca':
          selector = '[name="examenFisico.frecuenciaCardiaca"]';
          break;
        default:
          selector = '';
      }
      if (selector) {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if ('focus' in el) (el as any).focus();
        }
      }
      setSnackbar({ message: 'Por favor, completa todos los campos obligatorios.', type: 'error' });
      return;
    }
    const formData = getFormData();
    // Enviar antecedentes como objeto completo
    const antecedentesObj = formData.antecedentes;
    // Mapear tratamientos a objetos {medicamento, dosis, como_tomar}
    const tratamientosMapped = Array.isArray(formData.tratamiento)
      ? formData.tratamiento.map((t: any) => {
          if (typeof t === 'object' && t.medicamento) {
            // Ya es objeto correcto
            return t;
          } else if (typeof t === 'string') {
            // Formato antiguo: "omeprazol - 2 - cada 4 horas"
            const [medicamento, dosis, como_tomar] = t.split(' - ');
            return { medicamento: medicamento || '', dosis: dosis || '', como_tomar: como_tomar || '' };
          }
          return { medicamento: '', dosis: '', como_tomar: '' };
        })
      : [];
    // Mapear examenFisico a examen_fisico con propiedades en snake_case
    const examenFisico = formData.examenFisico || {};
    const examen_fisico = {
      peso: examenFisico.peso || '',
      altura: examenFisico.altura || '',
      presion_arterial: examenFisico.presionArterial || '',
      frecuencia_cardiaca: examenFisico.frecuenciaCardiaca || ''
    };
    // Usar pacienteId directamente como número
    const payload = {
      ...formData,
      persona_id: pacienteId,
      motivo_consulta: formData.motivoConsulta,
      antecedentes: antecedentesObj,
      diagnosticos: formData.diagnostico,
      tratamientos: tratamientosMapped,
      examen_fisico
    };
    // Eliminar los campos en singular y camelCase para evitar duplicidad
    delete (payload as any).motivoConsulta;
    delete (payload as any).diagnostico;
    delete (payload as any).tratamiento;
    delete (payload as any).examenFisico;
    try {
      let response;
      if (historiaExistente && historiaExistente.id) {
        // Actualizar historia existente
        response = await actualizarHistoriaClinica(Number(historiaExistente.id), payload);
      } else {
        // Crear nueva historia
        response = await crearHistoriaClinica(payload);
      }
      if (onGuardar) onGuardar(response);
    } catch (error) {
      setSnackbar({ message: 'Error al guardar la historia clínica.', type: 'error' });
      console.error(error);
    }
  };

  const handleAgregarTratamiento = () => {
    const { tratamientoMedicamento, tratamientoPresentacion, tratamientoDosis, tratamientoComoTomar, tratamiento } = form;
    if (!tratamientoMedicamento || !tratamientoPresentacion || !tratamientoDosis || !tratamientoComoTomar) return;
    // Evitar duplicados por medicamento, presentación, dosis y como_tomar
    const existe = (tratamiento || []).some((t: any) =>
      t.medicamento === tratamientoMedicamento &&
      t.presentacion === tratamientoPresentacion &&
      t.dosis === tratamientoDosis &&
      t.como_tomar === tratamientoComoTomar
    );
    if (existe) return;
    setForm((prev: any) => ({
      ...prev,
      tratamiento: [
        ...(prev.tratamiento || []),
        {
          medicamento: tratamientoMedicamento,
          presentacion: tratamientoPresentacion,
          dosis: tratamientoDosis,
          como_tomar: tratamientoComoTomar
        }
      ],
      tratamientoMedicamento: '',
      tratamientoPresentacion: '',
      tratamientoDosis: '',
      tratamientoComoTomar: ''
    }));
  };

  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl">
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
      <FormHeader isEdit={!!historiaExistente} tipo={form.tipo} />

      <form onSubmit={handleSubmit} className="px-7.5 py-6 space-y-7">
        <TipoHistoriaSelector value={form.tipo} onChange={handleChange} />

        <TextAreaField
          label="Motivo de Consulta"
          name="motivoConsulta"
          value={form.motivoConsulta}
          onChange={handleChange}
          placeholder="Describe el motivo principal de la consulta..."
          required
        />

        <AntecedentesSection
          form={form}
          setForm={setForm}
          isExpanded={isAntecedentesExpanded}
          setIsExpanded={setIsAntecedentesExpanded}
        />

        <TextAreaField
          label="Enfermedad Actual"
          name="enfermedadActual"
          value={form.enfermedadActual || ''}
          onChange={handleChange}
          placeholder="Describe los detalles de la enfermedad actual..."
          required
        />

        {/* EXAMEN FÍSICO */}
        <div className="space-y-3">
          <label className="block text-2sm font-semibold text-gray-900 mb-3">
            Examen Físico <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="relative">
              <input
                type="text"
                name="examenFisico.peso"
                value={form.examenFisico?.peso || ''}
                onChange={handleChange}
                placeholder="Peso"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kg</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="examenFisico.altura"
                value={form.examenFisico?.altura || ''}
                onChange={handleChange}
                placeholder="Altura"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">cm</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="examenFisico.presionArterial"
                value={form.examenFisico?.presionArterial || ''}
                onChange={handleChange}
                placeholder="Presión Arterial"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">mmHg</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="examenFisico.frecuenciaCardiaca"
                value={form.examenFisico?.frecuenciaCardiaca || ''}
                onChange={handleChange}
                placeholder="Frecuencia Cardíaca"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">lpm</span>
            </div>
          </div>
        </div>

        {/* DIAGNÓSTICO - Modo autocomplete simple */}
        <TagAutocomplete
          label="Diagnóstico"
          name="diagnostico"
          value={form.diagnostico}
          onChange={diagnosticos => setForm((prev: any) => ({ ...prev, diagnostico: diagnosticos }))}
          suggestions={cieDiagnosticos.map(cie => ({ codigo: cie.value, nombre: cie.label }))}
          placeholder="Busca por código CIE o nombre del diagnóstico..."
          required
          colorScheme="info"
        />

        {/* TRATAMIENTO - Modo multi-input (4 campos) */}
        <TagAutocomplete
          label="Tratamiento"
          name="tratamiento"
          value={(form.tratamiento || []).map((t: any) =>
            typeof t === 'object' && t.medicamento
              ? `${t.medicamento} - ${t.presentacion || ''} - ${t.dosis} - ${t.como_tomar}`
              : t
          )}
          onChange={tratamientos =>
            setForm((prev: any) => ({
              ...prev,
              tratamiento: tratamientos.map((t: string) => {
                const [medicamento, presentacion, dosis, como_tomar] = t.split(' - ');
                return {
                  medicamento: medicamento || '',
                  presentacion: presentacion || '',
                  dosis: dosis || '',
                  como_tomar: como_tomar || ''
                };
              })
            }))
          }
          required
          colorScheme="success"
          multiInputMode={true}
          inputFields={[
            {
              name: 'tratamientoMedicamento',
              placeholder: 'Medicamento',
              value: form.tratamientoMedicamento || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoMedicamento: val })),
              columns: 3
            },
            {
              name: 'tratamientoPresentacion',
              placeholder: 'Presentación',
              value: form.tratamientoPresentacion || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoPresentacion: val })),
              columns: 3
            },
            {
              name: 'tratamientoDosis',
              placeholder: 'Dosis',
              value: form.tratamientoDosis || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoDosis: val })),
              columns: 2
            },
            {
              name: 'tratamientoComoTomar',
              placeholder: '¿Cómo tomarla?',
              value: form.tratamientoComoTomar || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoComoTomar: val })),
              columns: 4
            }
          ]}
          onAddMultiInput={handleAgregarTratamiento}
        />

        <TextAreaField
          label="Observaciones Adicionales"
          name="observaciones"
          value={form.observaciones || ''}
          onChange={handleChange}
          placeholder="Notas adicionales, recomendaciones especiales, seguimiento..."
        />

        <InfoBanner />

        <FormActions isEdit={!!historiaExistente} onCancel={onCancelar} />
      </form>
    </div>
  );
};


