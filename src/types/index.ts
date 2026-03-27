// TIPOS VERIFACTUS - Sistema de Facturación Multi-Rubro

// ============================================
// RUBROS / SECTORES DE ACTIVIDAD
// ============================================
export type RubroId = 
  | 'diseno' 
  | 'construccion' 
  | 'medico' 
  | 'consultoria' 
  | 'software'
  | 'marketing'
  | 'abogacia'
  | 'asesoria'
  | 'ingenieria'
  | 'educacion'
  | 'belleza'
  | 'automocion'
  | 'comercio'
  | 'hosteleria'
  | 'fotografia'
  | 'eventos'
  | 'servicios';

export interface Rubro {
  id: RubroId;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  gradiente: string;
  // Configuración específica del rubro
  terminologia: {
    factura: string;
    cliente: string;
    servicio: string;
  };
  camposEspecificos: CampoEspecifico[];
  plantillaPDF: string;
  coloresDefault: {
    primario: string;
    secundario: string;
    destacado: string;
  };
}

export interface CampoEspecifico {
  id: string;
  nombre: string;
  tipo: 'text' | 'number' | 'date' | 'select' | 'textarea';
  requerido: boolean;
  opciones?: string[];
}

// ============================================
// EMPRESA / PERFIL DE USUARIO
// ============================================
export interface Empresa {
  id: string;
  nombre: string;
  razonSocial?: string;
  nifCif: string;
  email: string;
  telefono?: string;
  
  // Dirección
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  provincia?: string;
  pais: string;
  
  // Rubro
  rubroPrincipal: RubroId;
  rubrosSecundarios?: RubroId[];
  
  // Branding
  logoUrl?: string;
  firmaUrl?: string;
  colorPrimario: string;
  colorSecundario: string;
  colorDestacado: string;
  
  // Configuración de facturación
  prefijoFactura: string;
  secuenciaFactura: number;
  ivaDefault: number;
  irpfDefault: number;
  moneda: 'EUR' | 'USD' | 'GBP';
  
  // Configuraciones
  verifactusQrEnabled: boolean;
  resetAnual: boolean;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CLIENTES
// ============================================
export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  nifCif?: string;
  
  // Dirección
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  provincia?: string;
  pais?: string;
  
  // Metadatos del rubro
  metadata?: Record<string, any>;
  
  // Tags
  tags?: string[];
  
  // Estadísticas
  totalFacturado: number;
  facturasCount: number;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SERVICIOS / CATÁLOGO
// ============================================
export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion?: number; // en minutos
  iva: number;
  irpf: number;
  categoria?: string;
  tags?: string[];
  usoCount: number;
  esPaquete: boolean;
  serviciosIncluidos?: string[]; // IDs de servicios si es paquete
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FACTURAS
// ============================================
export type EstadoFactura = 'borrador' | 'enviada' | 'vista' | 'pagada' | 'vencida' | 'anulada';

export interface LineaFactura {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  iva: number;
  irpf: number;
  total: number;
  servicioId?: string;
}

export interface Factura {
  id: string;
  numero: string;
  estado: EstadoFactura;
  
  // Relaciones
  clienteId: string;
  cliente?: Cliente;
  
  // Fechas
  fechaEmision: string;
  fechaVencimiento: string;
  fechaPago?: string;
  
  // Líneas
  lineas: LineaFactura[];
  
  // Totales
  subtotal: number;
  totalDescuento: number;
  totalIva: number;
  totalIrpf: number;
  total: number;
  
  // Notas y términos
  notas?: string;
  terminos?: string;
  
  // Campos específicos del rubro
  camposEspecificos?: Record<string, any>;
  
  // PDF
  pdfUrl?: string;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DASHBOARD / ESTADÍSTICAS
// ============================================
export interface DashboardStats {
  totalPendiente: number;
  totalPagadoMes: number;
  tasaConversion: number;
  ticketPromedio: number;
  facturasPendientes: number;
  facturasPagadas: number;
  facturasVencidas: number;
  clienteTop: string;
}

export interface IngresoMensual {
  mes: string;
  ingresos: number;
  facturas: number;
}

// ============================================
// CONFIGURACIÓN DE TEMA
// ============================================
export interface TemaConfig {
  primario: string;
  secundario: string;
  destacado: string;
}

// ============================================
// ESTADO DE LA APP
// ============================================
export interface AppState {
  // Onboarding
  onboardingCompletado: boolean;
  
  // Empresa
  empresa: Empresa | null;
  
  // Datos
  clientes: Cliente[];
  servicios: Servicio[];
  facturas: Factura[];
  
  // Factura actual (en creación)
  facturaActual: Partial<Factura>;
  
  // UI
  tema: 'light' | 'dark';
}
