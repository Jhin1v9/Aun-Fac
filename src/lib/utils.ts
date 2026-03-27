import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear fecha
export function formatearFecha(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatearFechaCompleta(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Validar NIF/CIF español
export function validarNIFCIF(nif: string): boolean {
  const nifLimpio = nif.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // NIF para personas físicas
  if (/^[0-9]{8}[A-Z]$/.test(nifLimpio)) {
    const numero = parseInt(nifLimpio.substring(0, 8), 10);
    const letra = nifLimpio.charAt(8);
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return letras[numero % 23] === letra;
  }
  
  // CIF para empresas
  if (/^[A-HJNP-SW][0-9]{7}[0-9A-J]$/.test(nifLimpio)) {
    return true;
  }
  
  // NIE
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(nifLimpio)) {
    return true;
  }
  
  return false;
}

// Calcular fecha de vencimiento
export function calcularVencimiento(fechaEmision: string, dias: number): string {
  const fecha = new Date(fechaEmision);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split('T')[0];
}

// Estados de factura con colores
export const estadosFactura = {
  borrador: { label: 'Borrador', color: 'bg-gray-500', textColor: 'text-gray-500', bg: 'bg-gray-100' },
  enviada: { label: 'Enviada', color: 'bg-blue-500', textColor: 'text-blue-500', bg: 'bg-blue-100' },
  vista: { label: 'Vista', color: 'bg-indigo-500', textColor: 'text-indigo-500', bg: 'bg-indigo-100' },
  pagada: { label: 'Pagada', color: 'bg-green-500', textColor: 'text-green-500', bg: 'bg-green-100' },
  vencida: { label: 'Vencida', color: 'bg-red-500', textColor: 'text-red-500', bg: 'bg-red-100' },
  anulada: { label: 'Anulada', color: 'bg-gray-400', textColor: 'text-gray-400', bg: 'bg-gray-100' }
};

// Tasas de IVA
export const tasasIVA = [
  { valor: 21, label: '21% - General' },
  { valor: 10, label: '10% - Reducido' },
  { valor: 4, label: '4% - Superreducido' },
  { valor: 0, label: '0% - Exento' }
];

// Tasas de IRPF
export const tasasIRPF = [
  { valor: 0, label: '0% - Sin retención' },
  { valor: 7, label: '7% - Primeros 2 años' },
  { valor: 15, label: '15% - General' },
  { valor: 20, label: '20% - Profesionales' }
];

// Países
export const paises = [
  { codigo: 'ES', nombre: 'España' },
  { codigo: 'PT', nombre: 'Portugal' },
  { codigo: 'FR', nombre: 'Francia' },
  { codigo: 'DE', nombre: 'Alemania' },
  { codigo: 'IT', nombre: 'Italia' },
  { codigo: 'GB', nombre: 'Reino Unido' },
  { codigo: 'US', nombre: 'Estados Unidos' },
  { codigo: 'MX', nombre: 'México' },
  { codigo: 'AR', nombre: 'Argentina' },
  { codigo: 'CO', nombre: 'Colombia' },
  { codigo: 'CL', nombre: 'Chile' },
  { codigo: 'PE', nombre: 'Perú' },
  { codigo: 'OTRO', nombre: 'Otro' }
];

// Monedas
export const monedas = [
  { codigo: 'EUR', nombre: 'Euro (€)', simbolo: '€' },
  { codigo: 'USD', nombre: 'Dólar ($)', simbolo: '$' },
  { codigo: 'GBP', nombre: 'Libra (£)', simbolo: '£' }
];

// Meses abreviados
export const mesesAbreviados = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Generar número de factura
export function generarNumeroFactura(prefijo: string, secuencia: number, anio?: number): string {
  const year = anio || new Date().getFullYear();
  const seq = String(secuencia).padStart(5, '0');
  return `${prefijo}-${year}-${seq}`;
}
