import { useState, useEffect, ChangeEvent } from 'react';
import { HistoriaClinica, Antecedentes, AntecedenteItem } from '../types';

type DynamicForm = {
  [key: string]: any;
};

export const useHistoriaClinicaForm = (historiaExistente?: HistoriaClinica) => {
  const [form, setForm] = useState<DynamicForm>(
    historiaExistente
      ? {
          tipo: historiaExistente.tipo,
          motivoConsulta: historiaExistente.motivoConsulta,
          enfermedad_actual: historiaExistente.enfermedad_actual || '',
          examenFisico: typeof historiaExistente.examenFisico === 'object'
            ? historiaExistente.examenFisico
            : { peso: '', altura: '', presionArterial: '', frecuenciaCardiaca: '' },
          diagnosticos: Array.isArray(historiaExistente.diagnosticos) ? historiaExistente.diagnosticos : (historiaExistente.diagnosticos ? [Number(historiaExistente.diagnosticos)] : []),
          tratamiento: Array.isArray(historiaExistente.tratamiento)
            ? historiaExistente.tratamiento.map((t: any) => ({
                medicamento: t.medicamento || '',
                presentacion: t.presentacion || '',
                dosis: t.dosis || '',
                como_tomar: t.como_tomar || ''
              }))
            : (historiaExistente.tratamiento ? [historiaExistente.tratamiento] : []),
          observaciones: historiaExistente.observaciones || '',
          ...antecedentesToForm(historiaExistente.antecedentes)
        }
      : {
          tipo: 'medica',
          motivoConsulta: '',
          enfermedad_actual: '',
          examenFisico: { peso: '', altura: '', presionArterial: '', frecuenciaCardiaca: '' },
          diagnosticos: [],
          tratamiento: [],
          tratamientoPresentacion: '',
          observaciones: '',
        }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Soporte para subcampos: examenFisico.peso, etc.
    if (name.startsWith('examenFisico.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        examenFisico: {
          ...prev.examenFisico,
          [field]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Returns the name/key of the first missing required field, or null if all are filled.
   * Possible keys: 'motivoConsulta', 'diagnostico', 'tratamiento', 'enfermedad_actual',
   * 'examenFisico.peso', 'examenFisico.altura', 'examenFisico.presionArterial', 'examenFisico.frecuenciaCardiaca'
   */
  const validateForm = (): string | null => {
    if (!form.motivoConsulta) return 'motivoConsulta';
    if (!form.diagnosticos || form.diagnosticos.length === 0) return 'diagnostico';
    if (!form.tratamiento || form.tratamiento.length === 0) return 'tratamiento';
    // Validar campos de tratamiento multi-input si están presentes
    if ((form.tratamientoMedicamento || form.tratamientoPresentacion || form.tratamientoDosis || form.tratamientoComoTomar) &&
      (!form.tratamientoMedicamento || !form.tratamientoPresentacion || !form.tratamientoDosis || !form.tratamientoComoTomar)) {
      return 'tratamiento';
    }
    if (!form.enfermedadActual) return 'enfermedadActual';
    if (!form.examenFisico?.peso) return 'examenFisico.peso';
    if (!form.examenFisico?.altura) return 'examenFisico.altura';
    if (!form.examenFisico?.presionArterial) return 'examenFisico.presionArterial';
    if (!form.examenFisico?.frecuenciaCardiaca) return 'examenFisico.frecuenciaCardiaca';
    return null;
  };

  const getFormData = (): HistoriaClinica & { antecedentes: any[] } => {
    return {
      id: historiaExistente?.id || '',
      persona_id: historiaExistente?.persona_id || '',
      tipo: form.tipo,
      fechaCreacion: historiaExistente?.fechaCreacion || new Date().toISOString(),
      motivoConsulta: form.motivoConsulta,
      enfermedad_actual: form.enfermedadActual || form.enfermedad_actual || '',
      examenFisico: {
        peso: form.examenFisico?.peso || '',
        altura: form.examenFisico?.altura || '',
        presionArterial: form.examenFisico?.presionArterial || '',
        frecuenciaCardiaca: form.examenFisico?.frecuenciaCardiaca || ''
      },
      diagnosticos: form.diagnosticos,
      tratamiento: (form.tratamiento || []).map((t: any) => ({
        medicamento: t.medicamento || '',
        presentacion: t.presentacion || '',
        dosis: t.dosis || '',
        como_tomar: t.como_tomar || ''
      })),
      observaciones: form.observaciones,
      antecedentes: formToAntecedentes(form),
      historialCambios: historiaExistente?.historialCambios ?? [],
      adjuntos: historiaExistente?.adjuntos ?? [],
      evoluciones: historiaExistente?.evoluciones ?? []
    };
  };

  return {
    form,
    setForm,
    handleChange,
    validateForm,
    getFormData
  };
};


// Mapeo de keys del formulario a subcategorías de la base de datos
const keyToSubcategoria: Record<string, string> = {
  'Patológicos-Enfermedades previas-check': 'Enfermedades previas',
  'Patológicos-Hospitalizaciones-check': 'Hospitalizaciones',
  'Patológicos-Cirugías-check': 'Cirugías',
  'Familiares-Enfermedades hereditarias-check': 'Enfermedades hereditarias',
  'Alergias-Medicamentos-check': 'Medicamentos',
  'Alergias-Alimentos-check': 'Alimentos',
  'Alergias-Sustancias-check': 'Sustancias',
  'Tóxicos y Farmacológicos-Consumo de tabaco-check': 'Consumo de tabaco',
  'Tóxicos y Farmacológicos-Consumo de alcohol-check': 'Consumo de alcohol',
  'Tóxicos y Farmacológicos-Consumo de drogas-check': 'Consumo de drogas',
  'Tóxicos y Farmacológicos-Medicamentos habituales-check': 'Medicamentos habituales',
  'Vacunación-check': 'Vacunación'
  // Agrega más si tienes más antecedentes
};

function formToAntecedentes(formData: any): AntecedenteItem[] {
  return Object.keys(keyToSubcategoria)
    .map(key => {
      const check = formData[key];
      if (check === 'si' || check === 'no') {
        let descripcion = formData[key.replace('-check', '-description')];
        if (check === 'no' && !descripcion) {
          descripcion = 'No presenta';
        }
        const item: AntecedenteItem = {
          subcategoria: keyToSubcategoria[key],
          tiene: check === 'si',
          descripcion
        };
        return item;
      }
      return undefined;
    })
    .filter((item): item is AntecedenteItem => !!item);
}


function antecedentesToForm(antecedentes: Antecedentes): any {
  const formData: any = {};
  if (!Array.isArray(antecedentes)) return formData;

  // Mapeo inverso: subcategoría -> key del formulario
  const subcategoriaToKey: Record<string, string> = {
    'Enfermedades previas': 'Patológicos-Enfermedades previas',
    'Hospitalizaciones': 'Patológicos-Hospitalizaciones',
    'Cirugías': 'Patológicos-Cirugías',
    'Enfermedades hereditarias': 'Familiares-Enfermedades hereditarias',
    'Medicamentos': 'Alergias-Medicamentos',
    'Alimentos': 'Alergias-Alimentos',
    'Sustancias': 'Alergias-Sustancias',
    'Consumo de tabaco': 'Tóxicos y Farmacológicos-Consumo de tabaco',
    'Consumo de alcohol': 'Tóxicos y Farmacológicos-Consumo de alcohol',
    'Consumo de drogas': 'Tóxicos y Farmacológicos-Consumo de drogas',
    'Medicamentos habituales': 'Tóxicos y Farmacológicos-Medicamentos habituales',
    'Vacunación': 'Vacunación'
  };

  antecedentes.forEach(item => {
    const baseKey = subcategoriaToKey[item.subcategoria];
    if (baseKey) {
      formData[baseKey + '-check'] = item.tiene ? 'si' : 'no';
      if (item.tiene && item.descripcion) {
        formData[baseKey + '-description'] = item.descripcion;
      }
    }
  });
  return formData;
}