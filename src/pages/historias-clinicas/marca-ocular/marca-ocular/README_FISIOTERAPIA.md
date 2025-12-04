# Módulo de Marca de Fisioterapia - Cuerpo Humano

## Descripción
Este módulo permite a los fisioterapeutas registrar y visualizar marcas en una imagen del cuerpo humano completo del paciente, indicando áreas de dolor, lesiones, puntos de tratamiento y más.

## Características

### 1. Visualización Interactiva
- **Imagen real del cuerpo humano** completo (vista frontal)
- Aspect ratio 1:2 para proporciones naturales
- Diseño responsivo que se adapta a diferentes pantallas
- Overlay sutil para mejorar la visibilidad de las marcas
- Border hover con transición suave al pasar el cursor

### 2. Tipos de Marcas
El sistema soporta 8 tipos diferentes de marcas:
- **Dolor** (Rojo - #ef4444)
- **Lesión** (Naranja - #f59e0b)
- **Inflamación** (Rosa - #ec4899)
- **Contractura** (Morado - #8b5cf6)
- **Tensión** (Azul - #3b82f6)
- **Punto de Tratamiento** (Verde - #10b981)
- **Cicatriz** (Índigo - #6366f1)
- **Otro** (Gris - #64748b)

### 3. Niveles de Intensidad
Cada marca puede tener un nivel de intensidad que afecta su tamaño visual:
- **Leve (1)**: Marca pequeña (4x4px)
- **Moderado (2)**: Marca mediana (6x6px) - Por defecto
- **Severo (3)**: Marca grande (8x8px)

### 4. Funcionalidades Principales

#### Marcar Puntos
1. Selecciona el tipo de marca (dolor, lesión, etc.)
2. Elige el nivel de intensidad (1-3)
3. (Opcional) Agrega una descripción del área o tratamiento
4. Haz clic en la ubicación exacta del cuerpo
5. La marca se registra automáticamente con:
   - Posición exacta (coordenadas X, Y en %)
   - Tipo de marca
   - Color asociado
   - Nivel de intensidad
   - Descripción (opcional)
   - Fecha y hora del registro

#### Gestión de Marcas
- **Seleccionar**: Haz clic sobre una marca para seleccionarla (se resalta con un anillo azul)
- **Eliminar**: Usa el botón de basura junto a cada marca en la lista
- **Limpiar todo**: Elimina todas las marcas con un solo clic (con confirmación)

#### Visualización de Marcas
- Las marcas aparecen como puntos circulares de colores sobre el cuerpo
- El tamaño varía según la intensidad (1, 2 o 3)
- Efecto de pulsación (ping) en cada marca para mejor visibilidad
- Indicador numérico de intensidad en la esquina de cada marca
- Hover effect con aumento de tamaño
- Tooltip con información al pasar el cursor
- Lista detallada con todas las marcas registradas

## Estructura de Datos

```typescript
interface MarcaFisioterapia {
  id: string;              // ID único generado automáticamente
  x: number;               // Posición X en porcentaje (0-100)
  y: number;               // Posición Y en porcentaje (0-100)
  tipo: string;            // Tipo de marca (dolor, lesion, etc.)
  color: string;           // Color hexadecimal asociado
  intensidad: 'leve' | 'moderado' | 'severo';  // Nivel de intensidad
  descripcion?: string;    // Descripción opcional
  fecha: string;           // Fecha y hora de registro
}
```

## Integración con Backend

### Endpoints Necesarios

#### Guardar Marcas de Fisioterapia
```
POST /api/marcas-fisioterapia
```

**Body:**
```json
{
  "pacienteId": "PAC-12345",
  "consultaId": "CONS-67890",
  "marcas": [
    {
      "id": "marca-1732800000000",
      "x": 45.5,
      "y": 52.3,
      "tipo": "dolor",
      "color": "#ef4444",
      "intensidad": "severo",
      "descripcion": "Dolor intenso en zona lumbar",
      "fecha": "28/11/2025, 10:30:45"
    }
  ],
  "tipo": "fisioterapia",
  "fechaActualizacion": "2025-11-28T10:30:45.000Z"
}
```

#### Cargar Marcas de Fisioterapia
```
GET /api/marcas-fisioterapia/:pacienteId?consultaId=CONS-67890
```

**Respuesta:**
```json
{
  "id": "REGISTRO-12345",
  "pacienteId": "PAC-12345",
  "consultaId": "CONS-67890",
  "marcas": [ /* array de marcas */ ],
  "tipo": "fisioterapia",
  "fechaCreacion": "2025-11-28T10:30:45.000Z",
  "fechaActualizacion": "2025-11-28T10:35:20.000Z"
}
```

## Uso en Tabs

El componente está integrado en un sistema de tabs junto con el componente de Oftalmología:

```tsx
<Tabs defaultValue={1}>
  <TabsList>
    <Tab value={1}>Oftalmología</Tab>
    <Tab value={2}>Fisioterapia</Tab>
  </TabsList>

  <TabPanel value={1}>
    <MarcaOcularContent />
  </TabPanel>

  <TabPanel value={2}>
    <MarcaFisioterapiaContent />
  </TabPanel>
</Tabs>
```

## Props del Componente

```typescript
interface FisioterapiaProps {
  reload?: boolean;      // Forzar recarga del componente
  pacienteId?: string;   // ID del paciente (requerido para guardar/cargar)
  consultaId?: string;   // ID de la consulta médica (opcional)
}
```

## Ejemplo de Uso

```tsx
import MarcaFisioterapiaContent from '@/pages/marca-ocular/MarcaFisioterapiaContent';

<MarcaFisioterapiaContent 
  pacienteId="PAC-12345"
  consultaId="CONS-67890"
  reload={false}
/>
```

## Diferencias con Marca Ocular

| Característica | Marca Ocular | Marca Fisioterapia |
|----------------|--------------|-------------------|
| **Imagen** | Dos ojos separados | Un cuerpo humano completo |
| **Tipos de marcas** | 6 tipos (anomalía, lesión, etc.) | 8 tipos (dolor, contractura, etc.) |
| **Intensidad** | No aplica | 3 niveles (leve, moderado, severo) |
| **Tamaño de marcas** | Fijo | Variable según intensidad |
| **Uso** | Oftalmólogos | Fisioterapeutas |
| **Backend** | /api/marcas-oculares | /api/marcas-fisioterapia |

## Estilos

El componente utiliza:
- Clases de Tailwind CSS para el diseño
- Estilos inline para posicionamiento dinámico de marcas
- Imagen del cuerpo humano desde assets local
- Aspect ratio 1:2 para proporciones naturales del cuerpo
- Animaciones CSS (ping, scale, transitions)
- Box-shadow avanzado para destacar marcas
- Badges de intensidad con colores distintivos (success, warning, danger)

## Mejoras Futuras

1. **Vista Posterior**: Agregar imagen del cuerpo humano de espalda
2. **Vistas Laterales**: Agregar vistas laterales izquierda y derecha
3. **Zoom por Área**: Sistema de zoom para ver áreas específicas (hombro, rodilla, etc.)
4. **Conexiones entre Puntos**: Líneas para conectar áreas relacionadas
5. **Mapas de Calor**: Visualizar intensidad por zonas
6. **Animación del Dolor**: Efecto pulsante según intensidad
7. **Plan de Tratamiento**: Asociar marcas con sesiones de tratamiento
8. **Evolución Temporal**: Comparar marcas entre sesiones
9. **Notas de Voz**: Agregar notas de audio a cada marca
10. **Impresión de Reportes**: Generar PDF con imágenes y marcas

## Consideraciones Médicas

- Las marcas son una representación visual aproximada
- No reemplaza un diagnóstico médico profesional
- Debe usarse como complemento de la evaluación clínica
- Las coordenadas son relativas a la imagen, no medidas anatómicas exactas
- Se recomienda documentar con fotografías reales del paciente cuando sea posible

## Archivo de Imagen

La imagen del cuerpo humano se encuentra en:
```
/public/media/images/cuerpoHumano.png
```

Se puede reemplazar por otra imagen manteniendo proporciones similares (1:2).
