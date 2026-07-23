import { useState, useEffect } from 'react';
import api from '../api/client';

const CATEGORIES = [
  { value: 'hardware', label: 'Hardware (equipo, periféricos)' },
  { value: 'software', label: 'Software / instalación' },
  { value: 'red_internet', label: 'Red / Internet' },
  { value: 'correo', label: 'Correo electrónico' },
  { value: 'impresora', label: 'Impresora / escáner' },
  { value: 'acceso_permisos', label: 'Accesos / permisos' },
  { value: 'otro', label: 'Otro' },
];

export default function TicketForm({ onCreated }) {
  const [offices, setOffices] = useState(['América 2']);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'otro',
    priority: 'media',
    office: 'América 2',
    is_remote: false,
    anydesk_code: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/auth/offices').then(({ data }) => {
      if (data.offices?.length) setOffices(data.offices);
    }).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.is_remote && !form.anydesk_code.trim()) {
      setError('Ingresa tu código de AnyDesk, es obligatorio para soporte remoto.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/tickets', form);
      setSuccess('¡Ticket creado! Ya se notificó a soporte TI.');
      setForm({
        title: '',
        description: '',
        category: 'otro',
        priority: 'media',
        office: form.office,
        is_remote: false,
        anydesk_code: '',
      });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el ticket.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-info">{success}</div>}

      <div className="field">
        <label>¿Cuál es el problema? (título corto)</label>
        <input
          type="text"
          placeholder="Ej: No enciende el computador"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Descripción detallada</label>
        <textarea
          placeholder="Cuéntanos qué pasó, desde cuándo, y cualquier detalle que ayude a resolverlo más rápido."
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Categoría</label>
        <select value={form.category} onChange={(e) => update('category', e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Prioridad</label>
        <select value={form.priority} onChange={(e) => update('priority', e.target.value)}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>

      <div className="field">
        <label>Sede</label>
        <select value={form.office} onChange={(e) => update('office', e.target.value)}>
          {offices.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="checkbox-field">
        <input
          type="checkbox"
          id="is_remote"
          checked={form.is_remote}
          onChange={(e) => update('is_remote', e.target.checked)}
        />
        <label htmlFor="is_remote">Estoy fuera de la oficina (necesito soporte remoto)</label>
      </div>

      {form.is_remote && (
        <div className="field">
          <label>Código de AnyDesk</label>
          <input
            type="text"
            placeholder="Ej: 123 456 789"
            value={form.anydesk_code}
            onChange={(e) => update('anydesk_code', e.target.value)}
            required
          />
        </div>
      )}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Reportar problema'}
      </button>
    </form>
  );
}
