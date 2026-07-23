const PRIORITY_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
const STATUS_LABELS = {
  abierto: 'Abierto',
  en_progreso: 'En progreso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>{PRIORITY_LABELS[priority] || priority}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export { PRIORITY_LABELS, STATUS_LABELS };
