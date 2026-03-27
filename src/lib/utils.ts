import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formato de moneda español
export function formatCurrency(amount: number, moneda: string = 'EUR'): string {
  const simbolos: Record<string, string> = {
    EUR: '€',
    USD: '$',
    MXN: '$',
    ARS: '$',
    COP: '$',
    CLP: '$',
    PEN: 'S/',
  };
  
  const simbolo = simbolos[moneda] || '€';
  
  // Formato español: separador de miles con punto, decimal con coma
  const formateado = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${simbolo} ${formateado}`;
}

// Formato de fecha español
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Formato de fecha completa
export function formatDateFull(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Generar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validar NIF/CIF español
export function validarNIFCIF(nif: string): boolean {
  const nifLimpio = nif.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // NIF para personas físicas (8 dígitos + letra)
  if (/^[0-9]{8}[A-Z]$/.test(nifLimpio)) {
    const numero = parseInt(nifLimpio.substring(0, 8), 10);
    const letra = nifLimpio.charAt(8);
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return letras[numero % 23] === letra;
  }
  
  // CIF para empresas (letra + 7 dígitos + dígito de control)
  if (/^[A-HJNP-SW][0-9]{7}[0-9A-J]$/.test(nifLimpio)) {
    return true; // Simplificado para el ejemplo
  }
  
  // NIE (X/Y/Z + 7 dígitos + letra)
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(nifLimpio)) {
    return true;
  }
  
  return false;
}

// Generar número de factura
export function generarNumeroFactura(prefijo: string, secuencia: number, ano?: number): string {
  const year = ano || new Date().getFullYear();
  const seq = String(secuencia).padStart(5, '0');
  return `${prefijo}-${year}-${seq}`;
}

// Calcular fecha de vencimiento
export function calcularFechaVencimiento(fechaEmision: string, diasPago: number): string {
  const fecha = new Date(fechaEmision);
  fecha.setDate(fecha.getDate() + diasPago);
  return fecha.toISOString().split('T')[0];
}

// Meses en español abreviados
export const mesesAbreviados = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Meses en español completos
export const mesesCompletos = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Estados de factura con colores y etiquetas
export const estadosFactura = {
  borrador: { label: 'Borrador', color: 'bg-gray-500', textColor: 'text-gray-500' },
  enviada: { label: 'Enviada', color: 'bg-blue-500', textColor: 'text-blue-500' },
  vista: { label: 'Vista', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
  pagada: { label: 'Pagada', color: 'bg-green-500', textColor: 'text-green-500' },
  vencida: { label: 'Vencida', color: 'bg-red-500', textColor: 'text-red-500' },
  anulada: { label: 'Anulada', color: 'bg-gray-400', textColor: 'text-gray-400' },
};

// Tipos de factura
export const tiposFactura = {
  completa: { label: 'Completa' },
  simplificada: { label: 'Simplificada' },
  correctiva: { label: 'Correctiva' },
};

// Métodos de pago
export const metodosPago = {
  transferencia: { label: 'Transferencia bancaria' },
  domiciliacion: { label: 'Domiciliación bancaria' },
  tarjeta: { label: 'Tarjeta' },
  metalico: { label: 'Metálico' },
};

// Países
export const paises = [
  { codigo: 'ES', nombre: 'España' },
  { codigo: 'PT', nombre: 'Portugal' },
  { codigo: 'MX', nombre: 'México' },
  { codigo: 'AR', nombre: 'Argentina' },
  { codigo: 'CO', nombre: 'Colombia' },
  { codigo: 'CL', nombre: 'Chile' },
  { codigo: 'PE', nombre: 'Perú' },
  { codigo: 'OTRO', nombre: 'Otro' },
];

// Monedas
export const monedas = [
  { codigo: 'EUR', nombre: 'Euro (España/Europa)', simbolo: '€' },
  { codigo: 'USD', nombre: 'Dólar (USA)', simbolo: '$' },
  { codigo: 'MXN', nombre: 'Peso Mexicano', simbolo: '$' },
  { codigo: 'ARS', nombre: 'Peso Argentino', simbolo: '$' },
  { codigo: 'COP', nombre: 'Peso Colombiano', simbolo: '$' },
  { codigo: 'CLP', nombre: 'Peso Chileno', simbolo: '$' },
  { codigo: 'PEN', nombre: 'Sol Peruano', simbolo: 'S/' },
];

// Tasas de IVA españolas
export const tasasIVA = [
  { valor: 21, label: '21% - General' },
  { valor: 10, label: '10% - Reducido' },
  { valor: 4, label: '4% - Superreducido' },
  { valor: 0, label: '0% - Exento' },
];

// Tasas de IRPF
export const tasasIRPF = [
  { valor: 0, label: '0% - Sin retención' },
  { valor: 7, label: '7% - Primeros 2 años' },
  { valor: 15, label: '15% - General' },
  { valor: 20, label: '20% - Profesionales' },
];
