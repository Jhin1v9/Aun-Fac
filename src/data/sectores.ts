import type { SectorActividad } from '@/types';

export const sectoresActividad: SectorActividad[] = [
  {
    id: 'diseno',
    nombre: 'Diseño y Creativo',
    descripcion: 'Diseño gráfico, UI/UX, branding y publicidad',
    icono: 'Palette',
    color: 'bg-purple-500',
    gradiente: 'from-purple-500/10 via-purple-500/5 to-transparent'
  },
  {
    id: 'construccion',
    nombre: 'Construcción y Reformas',
    descripcion: 'Obras, reformas, proyectos de construcción',
    icono: 'HardHat',
    color: 'bg-orange-500',
    gradiente: 'from-orange-500/10 via-orange-500/5 to-transparent'
  },
  {
    id: 'medico',
    nombre: 'Médico y Salud',
    descripcion: 'Consultas médicas, procedimientos, salud',
    icono: 'Stethoscope',
    color: 'bg-red-500',
    gradiente: 'from-red-500/10 via-red-500/5 to-transparent'
  },
  {
    id: 'consultoria',
    nombre: 'Consultoría',
    descripcion: 'Consultoría empresarial, estrategia, negocios',
    icono: 'LineChart',
    color: 'bg-blue-500',
    gradiente: 'from-blue-500/10 via-blue-500/5 to-transparent'
  },
  {
    id: 'software',
    nombre: 'Desarrollo de Software',
    descripcion: 'Desarrollo web, móvil y sistemas',
    icono: 'Code2',
    color: 'bg-indigo-500',
    gradiente: 'from-indigo-500/10 via-indigo-500/5 to-transparent'
  },
  {
    id: 'marketing',
    nombre: 'Marketing Digital',
    descripcion: 'Marketing digital, SEO, redes sociales',
    icono: 'Megaphone',
    color: 'bg-pink-500',
    gradiente: 'from-pink-500/10 via-pink-500/5 to-transparent'
  },
  {
    id: 'abogacia',
    nombre: 'Abogacía',
    descripcion: 'Servicios legales, asesoramiento jurídico',
    icono: 'Scale',
    color: 'bg-slate-600',
    gradiente: 'from-slate-600/10 via-slate-600/5 to-transparent'
  },
  {
    id: 'asesoria',
    nombre: 'Asesoría Fiscal',
    descripcion: 'Asesoramiento fiscal, contable, laboral',
    icono: 'Calculator',
    color: 'bg-emerald-600',
    gradiente: 'from-emerald-600/10 via-emerald-600/5 to-transparent'
  },
  {
    id: 'ingenieria',
    nombre: 'Ingeniería',
    descripcion: 'Proyectos de ingeniería, industrial, civil',
    icono: 'Cog',
    color: 'bg-cyan-600',
    gradiente: 'from-cyan-600/10 via-cyan-600/5 to-transparent'
  },
  {
    id: 'educacion',
    nombre: 'Educación',
    descripcion: 'Formación, cursos, academias, enseñanza',
    icono: 'GraduationCap',
    color: 'bg-yellow-500',
    gradiente: 'from-yellow-500/10 via-yellow-500/5 to-transparent'
  },
  {
    id: 'belleza',
    nombre: 'Belleza y Estética',
    descripcion: 'Peluquería, estética, spa, belleza',
    icono: 'Sparkles',
    color: 'bg-rose-500',
    gradiente: 'from-rose-500/10 via-rose-500/5 to-transparent'
  },
  {
    id: 'automocion',
    nombre: 'Automoción',
    descripcion: 'Talleres, concesionarios, mecánica',
    icono: 'Car',
    color: 'bg-red-600',
    gradiente: 'from-red-600/10 via-red-600/5 to-transparent'
  },
  {
    id: 'comercio',
    nombre: 'Comercio',
    descripcion: 'Tiendas, retail, comercio minorista',
    icono: 'ShoppingBag',
    color: 'bg-teal-500',
    gradiente: 'from-teal-500/10 via-teal-500/5 to-transparent'
  },
  {
    id: 'hosteleria',
    nombre: 'Hostelería',
    descripcion: 'Restaurantes, bares, hoteles, turismo',
    icono: 'UtensilsCrossed',
    color: 'bg-orange-600',
    gradiente: 'from-orange-600/10 via-orange-600/5 to-transparent'
  },
  {
    id: 'fotografia',
    nombre: 'Fotografía',
    descripcion: 'Servicios fotográficos, video, audiovisual',
    icono: 'Camera',
    color: 'bg-violet-600',
    gradiente: 'from-violet-600/10 via-violet-600/5 to-transparent'
  },
  {
    id: 'eventos',
    nombre: 'Eventos',
    descripcion: 'Organización de eventos, celebraciones',
    icono: 'Calendar',
    color: 'bg-pink-600',
    gradiente: 'from-pink-600/10 via-pink-600/5 to-transparent'
  },
  {
    id: 'servicios',
    nombre: 'Servicios Generales',
    descripcion: 'Servicios profesionales varios',
    icono: 'Briefcase',
    color: 'bg-blue-600',
    gradiente: 'from-blue-600/10 via-blue-600/5 to-transparent'
  }
];

export const temasPredefinidos: Record<string, { nombre: string; primario: string; secundario: string; destacado: string }> = {
  azul: {
    nombre: 'Azul Profesional',
    primario: '#3b82f6',
    secundario: '#6366f1',
    destacado: '#8b5cf6',
  },
  morado: {
    nombre: 'Morado Creativo',
    primario: '#8b5cf6',
    secundario: '#a855f7',
    destacado: '#d946ef',
  },
  cian: {
    nombre: 'Cian Moderno',
    primario: '#06b6d4',
    secundario: '#0ea5e9',
    destacado: '#3b82f6',
  },
  rosa: {
    nombre: 'Rosa Vibrante',
    primario: '#ec4899',
    secundario: '#f43f5e',
    destacado: '#fb7185',
  },
  verde: {
    nombre: 'Verde Natural',
    primario: '#10b981',
    secundario: '#22c55e',
    destacado: '#84cc16',
  },
  ambar: {
    nombre: 'Ámbar Cálido',
    primario: '#f59e0b',
    secundario: '#f97316',
    destacado: '#fb923c',
  },
};
