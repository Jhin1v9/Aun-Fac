import type { Rubro } from '@/types';

export const rubros: Rubro[] = [
  {
    id: 'diseno',
    nombre: 'Diseño y Creativo',
    descripcion: 'Diseño gráfico, UI/UX, branding y publicidad',
    icono: 'Palette',
    color: 'bg-purple-500',
    gradiente: 'from-purple-500/10 via-purple-500/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Servicio'
    },
    camposEspecificos: [
      { id: 'revisiones', nombre: 'Revisiones incluidas', tipo: 'number', requerido: false },
      { id: 'entregables', nombre: 'Archivos entregables', tipo: 'textarea', requerido: false },
      { id: 'licencia', nombre: 'Tipo de licencia', tipo: 'select', requerido: false, opciones: ['Uso personal', 'Comercial', 'Exclusiva'] }
    ],
    plantillaPDF: 'diseno',
    coloresDefault: {
      primario: '#8b5cf6',
      secundario: '#a855f7',
      destacado: '#d946ef'
    }
  },
  {
    id: 'construccion',
    nombre: 'Construcción y Reformas',
    descripcion: 'Obras, reformas, proyectos de construcción',
    icono: 'HardHat',
    color: 'bg-orange-500',
    gradiente: 'from-orange-500/10 via-orange-500/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Contratante',
      servicio: 'Obra/Servicio'
    },
    camposEspecificos: [
      { id: 'direccionObra', nombre: 'Dirección de la obra', tipo: 'text', requerido: true },
      { id: 'plazoEjecucion', nombre: 'Plazo de ejecución (días)', tipo: 'number', requerido: false },
      { id: 'retencionGarantia', nombre: 'Retención de garantía (%)', tipo: 'number', requerido: false },
      { id: 'certificacion', nombre: 'Nº de certificación', tipo: 'text', requerido: false }
    ],
    plantillaPDF: 'construccion',
    coloresDefault: {
      primario: '#f97316',
      secundario: '#fb923c',
      destacado: '#fdba74'
    }
  },
  {
    id: 'medico',
    nombre: 'Médico y Salud',
    descripcion: 'Consultas médicas, procedimientos, salud',
    icono: 'Stethoscope',
    color: 'bg-red-500',
    gradiente: 'from-red-500/10 via-red-500/5 to-transparent',
    terminologia: {
      factura: 'Recibo',
      cliente: 'Paciente',
      servicio: 'Procedimiento'
    },
    camposEspecificos: [
      { id: 'convenio', nombre: 'Convenio', tipo: 'text', requerido: false },
      { id: 'procedimientoCID', nombre: 'Procedimiento CID', tipo: 'text', requerido: false },
      { id: 'fechaAtencion', nombre: 'Fecha de atención', tipo: 'date', requerido: true }
    ],
    plantillaPDF: 'medico',
    coloresDefault: {
      primario: '#ef4444',
      secundario: '#f87171',
      destacado: '#fca5a5'
    }
  },
  {
    id: 'consultoria',
    nombre: 'Consultoría',
    descripcion: 'Consultoría empresarial, estrategia, negocios',
    icono: 'LineChart',
    color: 'bg-blue-500',
    gradiente: 'from-blue-500/10 via-blue-500/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Consultoría'
    },
    camposEspecificos: [
      { id: 'horasContratadas', nombre: 'Horas contratadas', tipo: 'number', requerido: false },
      { id: 'objetivo', nombre: 'Objetivo del proyecto', tipo: 'textarea', requerido: false }
    ],
    plantillaPDF: 'consultoria',
    coloresDefault: {
      primario: '#3b82f6',
      secundario: '#60a5fa',
      destacado: '#93c5fd'
    }
  },
  {
    id: 'software',
    nombre: 'Desarrollo de Software',
    descripcion: 'Desarrollo web, móvil y sistemas',
    icono: 'Code2',
    color: 'bg-indigo-500',
    gradiente: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Desarrollo'
    },
    camposEspecificos: [
      { id: 'proyecto', nombre: 'Nombre del proyecto', tipo: 'text', requerido: false },
      { id: 'sprints', nombre: 'Sprints incluidos', tipo: 'number', requerido: false },
      { id: 'tecnologias', nombre: 'Tecnologías', tipo: 'textarea', requerido: false }
    ],
    plantillaPDF: 'software',
    coloresDefault: {
      primario: '#6366f1',
      secundario: '#818cf8',
      destacado: '#a5b4fc'
    }
  },
  {
    id: 'marketing',
    nombre: 'Marketing Digital',
    descripcion: 'Marketing digital, SEO, redes sociales',
    icono: 'Megaphone',
    color: 'bg-pink-500',
    gradiente: 'from-pink-500/10 via-pink-500/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Campaña/Servicio'
    },
    camposEspecificos: [
      { id: 'campaña', nombre: 'Nombre de campaña', tipo: 'text', requerido: false },
      { id: 'plataformas', nombre: 'Plataformas', tipo: 'textarea', requerido: false },
      { id: 'periodo', nombre: 'Periodo', tipo: 'text', requerido: false }
    ],
    plantillaPDF: 'marketing',
    coloresDefault: {
      primario: '#ec4899',
      secundario: '#f472b6',
      destacado: '#fbcfe8'
    }
  },
  {
    id: 'abogacia',
    nombre: 'Abogacía',
    descripcion: 'Servicios legales, asesoramiento jurídico',
    icono: 'Scale',
    color: 'bg-slate-600',
    gradiente: 'from-slate-600/10 via-slate-600/5 to-transparent',
    terminologia: {
      factura: 'Factura de Honorarios',
      cliente: 'Cliente',
      servicio: 'Servicio Legal'
    },
    camposEspecificos: [
      { id: 'expediente', nombre: 'Nº Expediente', tipo: 'text', requerido: false },
      { id: 'materia', nombre: 'Materia', tipo: 'select', requerido: false, opciones: ['Civil', 'Penal', 'Laboral', 'Mercantil', 'Administrativo'] },
      { id: 'procurador', nombre: 'Procurador', tipo: 'text', requerido: false }
    ],
    plantillaPDF: 'abogacia',
    coloresDefault: {
      primario: '#475569',
      secundario: '#64748b',
      destacado: '#94a3b8'
    }
  },
  {
    id: 'asesoria',
    nombre: 'Asesoría Fiscal',
    descripcion: 'Asesoramiento fiscal, contable, laboral',
    icono: 'Calculator',
    color: 'bg-emerald-600',
    gradiente: 'from-emerald-600/10 via-emerald-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Asesoría'
    },
    camposEspecificos: [
      { id: 'ejercicio', nombre: 'Ejercicio fiscal', tipo: 'text', requerido: false },
      { id: 'trimestre', nombre: 'Trimestre', tipo: 'select', requerido: false, opciones: ['1T', '2T', '3T', '4T', 'Anual'] }
    ],
    plantillaPDF: 'asesoria',
    coloresDefault: {
      primario: '#059669',
      secundario: '#10b981',
      destacado: '#6ee7b7'
    }
  },
  {
    id: 'ingenieria',
    nombre: 'Ingeniería',
    descripcion: 'Proyectos de ingeniería, industrial, civil',
    icono: 'Cog',
    color: 'bg-cyan-600',
    gradiente: 'from-cyan-600/10 via-cyan-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Proyecto/Servicio'
    },
    camposEspecificos: [
      { id: 'proyecto', nombre: 'Nombre del proyecto', tipo: 'text', requerido: false },
      { id: 'numeroProyecto', nombre: 'Nº Proyecto', tipo: 'text', requerido: false },
      { id: 'fase', nombre: 'Fase', tipo: 'select', requerido: false, opciones: ['Estudio', 'Proyecto', 'Ejecución', 'Finalizado'] }
    ],
    plantillaPDF: 'ingenieria',
    coloresDefault: {
      primario: '#0891b2',
      secundario: '#06b6d4',
      destacado: '#67e8f9'
    }
  },
  {
    id: 'educacion',
    nombre: 'Educación',
    descripcion: 'Formación, cursos, academias, enseñanza',
    icono: 'GraduationCap',
    color: 'bg-yellow-500',
    gradiente: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Alumno/Estudiante',
      servicio: 'Curso/Formación'
    },
    camposEspecificos: [
      { id: 'curso', nombre: 'Nombre del curso', tipo: 'text', requerido: false },
      { id: 'horas', nombre: 'Horas lectivas', tipo: 'number', requerido: false },
      { id: 'nivel', nombre: 'Nivel', tipo: 'select', requerido: false, opciones: ['Básico', 'Intermedio', 'Avanzado'] }
    ],
    plantillaPDF: 'educacion',
    coloresDefault: {
      primario: '#eab308',
      secundario: '#facc15',
      destacado: '#fde047'
    }
  },
  {
    id: 'belleza',
    nombre: 'Belleza y Estética',
    descripcion: 'Peluquería, estética, spa, belleza',
    icono: 'Sparkles',
    color: 'bg-rose-500',
    gradiente: 'from-rose-500/10 via-rose-500/5 to-transparent',
    terminologia: {
      factura: 'Ticket',
      cliente: 'Cliente',
      servicio: 'Tratamiento/Servicio'
    },
    camposEspecificos: [
      { id: 'tratamiento', nombre: 'Tipo de tratamiento', tipo: 'text', requerido: false },
      { id: 'sesiones', nombre: 'Nº de sesiones', tipo: 'number', requerido: false }
    ],
    plantillaPDF: 'belleza',
    coloresDefault: {
      primario: '#f43f5e',
      secundario: '#fb7185',
      destacado: '#fda4af'
    }
  },
  {
    id: 'automocion',
    nombre: 'Automoción',
    descripcion: 'Talleres, concesionarios, mecánica',
    icono: 'Car',
    color: 'bg-red-600',
    gradiente: 'from-red-600/10 via-red-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Reparación/Servicio'
    },
    camposEspecificos: [
      { id: 'matricula', nombre: 'Matrícula', tipo: 'text', requerido: true },
      { id: 'vehiculo', nombre: 'Vehículo', tipo: 'text', requerido: false },
      { id: 'km', nombre: 'Kilometraje', tipo: 'number', requerido: false },
      { id: 'garantia', nombre: 'Garantía (meses)', tipo: 'number', requerido: false }
    ],
    plantillaPDF: 'automocion',
    coloresDefault: {
      primario: '#dc2626',
      secundario: '#ef4444',
      destacado: '#fca5a5'
    }
  },
  {
    id: 'comercio',
    nombre: 'Comercio',
    descripcion: 'Tiendas, retail, comercio minorista',
    icono: 'ShoppingBag',
    color: 'bg-teal-500',
    gradiente: 'from-teal-500/10 via-teal-500/5 to-transparent',
    terminologia: {
      factura: 'Ticket/Factura',
      cliente: 'Cliente',
      servicio: 'Producto/Servicio'
    },
    camposEspecificos: [
      { id: 'pedido', nombre: 'Nº Pedido', tipo: 'text', requerido: false },
      { id: 'envio', nombre: 'Método de envío', tipo: 'select', requerido: false, opciones: ['Recogida', 'Envío estándar', 'Envío express'] }
    ],
    plantillaPDF: 'comercio',
    coloresDefault: {
      primario: '#14b8a6',
      secundario: '#2dd4bf',
      destacado: '#5eead4'
    }
  },
  {
    id: 'hosteleria',
    nombre: 'Hostelería',
    descripcion: 'Restaurantes, bares, hoteles, turismo',
    icono: 'UtensilsCrossed',
    color: 'bg-orange-600',
    gradiente: 'from-orange-600/10 via-orange-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente/Huésped',
      servicio: 'Servicio/Consumición'
    },
    camposEspecificos: [
      { id: 'habitacion', nombre: 'Habitación/Mesa', tipo: 'text', requerido: false },
      { id: 'fechaEntrada', nombre: 'Fecha entrada', tipo: 'date', requerido: false },
      { id: 'fechaSalida', nombre: 'Fecha salida', tipo: 'date', requerido: false },
      { id: 'noches', nombre: 'Noches', tipo: 'number', requerido: false }
    ],
    plantillaPDF: 'hosteleria',
    coloresDefault: {
      primario: '#ea580c',
      secundario: '#f97316',
      destacado: '#fdba74'
    }
  },
  {
    id: 'fotografia',
    nombre: 'Fotografía',
    descripcion: 'Servicios fotográficos, video, audiovisual',
    icono: 'Camera',
    color: 'bg-violet-600',
    gradiente: 'from-violet-600/10 via-violet-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Sesión/Servicio'
    },
    camposEspecificos: [
      { id: 'tipoSesion', nombre: 'Tipo de sesión', tipo: 'select', requerido: false, opciones: ['Retrato', 'Evento', 'Producto', 'Inmobiliaria', 'Moda'] },
      { id: 'horas', nombre: 'Horas de sesión', tipo: 'number', requerido: false },
      { id: 'entregables', nombre: 'Fotos entregables', tipo: 'number', requerido: false }
    ],
    plantillaPDF: 'fotografia',
    coloresDefault: {
      primario: '#7c3aed',
      secundario: '#8b5cf6',
      destacado: '#c4b5fd'
    }
  },
  {
    id: 'eventos',
    nombre: 'Eventos',
    descripcion: 'Organización de eventos, celebraciones',
    icono: 'Calendar',
    color: 'bg-pink-600',
    gradiente: 'from-pink-600/10 via-pink-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Evento/Servicio'
    },
    camposEspecificos: [
      { id: 'tipoEvento', nombre: 'Tipo de evento', tipo: 'select', requerido: false, opciones: ['Boda', 'Cumpleaños', 'Corporativo', 'Concierto', 'Otro'] },
      { id: 'fechaEvento', nombre: 'Fecha del evento', tipo: 'date', requerido: true },
      { id: 'invitados', nombre: 'Nº de invitados', tipo: 'number', requerido: false },
      { id: 'lugar', nombre: 'Lugar', tipo: 'text', requerido: false }
    ],
    plantillaPDF: 'eventos',
    coloresDefault: {
      primario: '#db2777',
      secundario: '#ec4899',
      destacado: '#fbcfe8'
    }
  },
  {
    id: 'servicios',
    nombre: 'Servicios Generales',
    descripcion: 'Servicios profesionales varios',
    icono: 'Briefcase',
    color: 'bg-blue-600',
    gradiente: 'from-blue-600/10 via-blue-600/5 to-transparent',
    terminologia: {
      factura: 'Factura',
      cliente: 'Cliente',
      servicio: 'Servicio'
    },
    camposEspecificos: [],
    plantillaPDF: 'default',
    coloresDefault: {
      primario: '#2563eb',
      secundario: '#3b82f6',
      destacado: '#93c5fd'
    }
  }
];

export const getRubroById = (id: string): Rubro | undefined => {
  return rubros.find(r => r.id === id);
};

export const temasPredefinidos = {
  azul: { nombre: 'Azul Profesional', primario: '#3b82f6', secundario: '#60a5fa', destacado: '#93c5fd' },
  morado: { nombre: 'Morado Creativo', primario: '#8b5cf6', secundario: '#a855f7', destacado: '#d946ef' },
  cian: { nombre: 'Cian Moderno', primario: '#06b6d4', secundario: '#22d3ee', destacado: '#67e8f9' },
  rosa: { nombre: 'Rosa Vibrante', primario: '#ec4899', secundario: '#f472b6', destacado: '#fbcfe8' },
  verde: { nombre: 'Verde Natural', primario: '#10b981', secundario: '#34d399', destacado: '#6ee7b7' },
  ambar: { nombre: 'Ámbar Cálido', primario: '#f59e0b', secundario: '#fbbf24', destacado: '#fcd34d' }
};
