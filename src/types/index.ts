// Tipos VERIFACTUS - Sistema de Facturación España 2025

export interface Empresa {
  id: string;
  nombre: string;
  nifCif: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  pais: string;
  telefono: string;
  email: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  logoUrl?: string;
  firmaUrl?: string;
  moneda: 'EUR' | 'USD' | 'MXN' | 'ARS' | 'COP' | 'CLP' | 'PEN';
  ivaPorDefecto: number;
  irpfPorDefecto: number;
  prefijoFactura: string;
  secuenciaFactura: number;
  verifactusQrEnabled: boolean;
  faceEnabled: boolean;
  sectorActividad?: string;
  colorPrimario: string;
  colorSecundario: string;
  colorDestacado: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  nifCif?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  provincia?: string;
  pais: string;
  telefono?: string;
  email?: string;
  tipoIva: 'general' | 'recargo' | 'equivalencia';
  metodoPago: 'transferencia' | 'domiciliacion' | 'tarjeta' | 'metalico';
  diasPago: number;
  iban?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precioPorDefecto: number;
  ivaRate: number;
  irpfAplicable: boolean;
  categoria?: string;
  tags?: string[];
  usoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LineaFactura {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  ivaRate: number;
  ivaAmount: number;
  irpfRate: number;
  irpfAmount: number;
  descuentoPercent: number;
  totalLinea: number;
}

export type EstadoFactura = 'borrador' | 'enviada' | 'vista' | 'pagada' | 'vencida' | 'anulada';
export type TipoFactura = 'completa' | 'simplificada' | 'correctiva';

export interface Factura {
  id: string;
  numero: string;
  tipo: TipoFactura;
  estado: EstadoFactura;
  clienteId: string;
  cliente?: Cliente;
  fechaEmision: string;
  fechaVencimiento: string;
  fechaServicio?: string;
  lineas: LineaFactura[];
  subtotal: number;
  totalIva: number;
  totalIrpf: number;
  totalDescuento: number;
  totalAmount: number;
  notas?: string;
  terminos?: string;
  verifactusQrCode?: string;
  verifactusValidationUrl?: string;
  faceTrackingCode?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectorActividad {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  gradiente: string;
}

export interface DashboardStats {
  totalPendiente: number;
  tasaCobro: number;
  clienteTop: string;
  ticketMedio: number;
  facturasPendientes: number;
  facturasPagadas: number;
  facturasVencidas: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
}

export interface IngresosMensuales {
  mes: string;
  ingresos: number;
  facturas: number;
}

export type TemaColor = 'azul' | 'morado' | 'cian' | 'rosa' | 'verde' | 'ambar' | 'personalizado';
