import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [events, setEvents] = useState([]);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isStaff = user.role === 'admin' || user.role === 'support';

  const load = useCallback(async () => {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
    setEvents(data.events);
    setStatus(data.ticket.status);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/tickets/${id}/status`, { status, note, assigned_to: user.id });
      setNote('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar el ticket.');
    } finally {
      setSaving(false);
    }
  }

  if (!ticket) {
    return (
      <Layout>
        <p>Cargando ticket...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to={isStaff ? '/admin' : '/mis-tickets'} className="back-link">← Volver</Link>

      <div className="grid-2">
        <div className="card">
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div>
              <h2 style={{ marginBottom: 4 }}>#{ticket.id} · {ticket.title}</h2>
              <div className="ticket-meta">
                <span>{ticket.office}</span>
                {!!ticket.is_remote && <span>🖥️ AnyDesk: {ticket.anydesk_code}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p><strong>Reportado por:</strong> {ticket.reporter_name} ({ticket.reporter_email})</p>
          <p><strong>Categoría:</strong> {ticket.category}</p>
          <p><strong>Descripción:</strong></p>
          <p className="ticket-desc">{ticket.description}</p>
          {ticket.assigned_name && <p><strong>Asignado a:</strong> {ticket.assigned_name}</p>}

          <h2 style={{ marginTop: 24 }}>Historial</h2>
          {events.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Sin actividad todavía.</p>}
          {events.map((ev) => (
            <div className="event-item" key={ev.id}>
              {ev.note && <div>{ev.note}</div>}
              {ev.status && <div>Estado cambiado a: <StatusBadge status={ev.status} /></div>}
              <div className="event-meta">{ev.user_name || 'Sistema'} · {new Date(ev.created_at).toLocaleString('es-CO')}</div>
            </div>
          ))}
        </div>

        {isStaff && (
          <div className="card">
            <h2>Actualizar ticket</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label>Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
              <div className="field">
                <label>Nota / comentario interno</label>
                <textarea
                  placeholder="Ej: Me conecté por AnyDesk, reinicié el servicio de correo..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
