// Constantes y funciones compartidas de Laburamos

export const ALL_CITIES = 'Toda la zona';
export const CITIES = ['Bragado', "O'Brien", 'Mechita', 'Alberti', '9 de Julio'];

export const JOB_CATEGORIES = ['Comercio', 'Gastronomía', 'Agro / Campo', 'Oficios / Técnico', 'Administración', 'Salud y cuidados', 'Transporte', 'Otros'];
export const JOB_TYPES = ['Full-time', 'Part-time', 'Por horas', 'Temporal', 'Changa'];
export const SERVICE_CATEGORIES = ['Oficios', 'Profesionales', 'Clases particulares', 'Cuidados', 'Limpieza', 'Tecnología', 'Eventos', 'Otros'];
export const AVAILABILITY = ['Jornada completa', 'Media jornada', 'Turno mañana', 'Turno tarde', 'Fines de semana', 'Por horas / changas'];

// Color de cada rubro (clases t-* definidas en index.css)
const TONES = {
  Comercio: 'ultra',
  Gastronomía: 'tomato',
  'Agro / Campo': 'field',
  'Oficios / Técnico': 'sun',
  Administración: 'violet',
  'Salud y cuidados': 'pink',
  Transporte: 'sky',
  Oficios: 'sun',
  Profesionales: 'ultra',
  'Clases particulares': 'violet',
  Cuidados: 'pink',
  Limpieza: 'sky',
  Tecnología: 'field',
  Eventos: 'tomato',
};
export const toneOf = (category) => `t-${TONES[category] || 'stone'}`;

const NAME_TONES = ['ultra', 'sun', 'tomato', 'field', 'violet', 'pink', 'sky'];
export function toneFromName(name = '') {
  const n = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return `t-${NAME_TONES[n % NAME_TONES.length]}`;
}

export function initials(name = '') {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ''))
    .join('');
  return letters || '?';
}

export const cityLabel = (city) => (city === ALL_CITIES ? 'toda la zona' : city);
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Deja solo los 10 dígitos nacionales: sin +54, sin 9, sin 0 inicial y sin el 15.
// Ej: "0 2342 15-112233" -> "2342112233"
export function cleanPhone(raw = '') {
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  d = d.replace(/^0+/, '');
  if (d.length === 12) {
    for (const area of [4, 3, 2]) {
      if (d.slice(area, area + 2) === '15') {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return d;
}

export const isValidPhone = (raw) => /^\d{10}$/.test(cleanPhone(raw));

// Enlace de WhatsApp con el texto correctamente codificado
export function waLink(phone, text = '') {
  return `https://wa.me/549${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
}

export function cityOrDefault(city) {
  return !city || city === ALL_CITIES ? 'Bragado' : city;
}

export function timeAgo(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return 'hace un rato';
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ayer';
  if (d < 30) return `hace ${d} días`;
  const m = Math.floor(d / 30);
  return `hace ${m} ${m === 1 ? 'mes' : 'meses'}`;
}

export function daysLeft(iso) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

// Traduce errores técnicos a mensajes claros
export function friendlyError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Tenés que confirmar tu email antes de ingresar. Revisá tu bandeja de entrada y el spam.';
  if (m.includes('already registered')) return 'Ese email ya está registrado. Probá iniciar sesión.';
  if (m.includes('at least 6')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
  if (m.includes('permission denied')) return 'La base de datos no tiene permisos configurados. Ejecutá el archivo supabase_permisos.sql en Supabase.';
  if (m.includes('row-level security')) return 'Tu cuenta no tiene permiso para hacer esto.';
  if (m.includes('phone')) return 'Revisá el número de WhatsApp.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sin conexión. Revisá tu internet e intentá de nuevo.';
  return message || 'Ocurrió un error inesperado.';
}
