export const validateFieldVehiculo = (name: string, value: string): string | null => {
  switch (name) {
    case 'numeroOrdenServicio':
      if (!value) return 'El número de orden de servicio es requerido';
      break;

    case 'placa':
      if (!value) return 'La placa es requerida';
      if (!/^[A-Za-z]{3}-\d{3}$/.test(value)) {
        return 'La placa debe tener el formato AAA-123 (tres letras, un guion y tres números)';
      }
      break;

    case 'chasis':
      if (!value) return 'El chasis es requerido';
      break;

       case 'motor':
      if (!value) return 'El número de motor es requerido';
      break;


    case 'tipoV':
      if (!value) return 'El tipo de vehículo es requerido';
      break;

    case 'idClaseVehiculo':
      if (!value) return 'La clase de vehículo es requerida';
      break;

    case 'tipoAfiliacion':
      if (!value) return 'El tipo de afiliación es requerido';
      break;

    case 'tipoCombustible':
      if (!value) return 'El tipo de combustible es requerido';
      break;

    case 'modelo':
      if (!value) return 'El modelo es requerido';
      break;

    case 'marca':
      if (!value) return 'La marca es requerida';
      break;

    case 'numPuestos':
      if (!value) return 'El número de puestos es requerido';
      if (!/^\d+$/.test(value)) {
        return 'El número de puestos solo debe contener números';
      }
      break;

    default:
      return null;
  }

  return null;
};
