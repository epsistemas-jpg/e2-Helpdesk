import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import TicketForm from '../components/TicketForm';
import TicketCard from '../components/TicketCard';
import api from '../api/client';

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tickets', { params: { mine: true } });
      setTickets(data.tickets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Reportar un problema</h1>
          <p>Cuéntanos qué está pasando y el equipo de soporte TI recibirá una notificación al instante.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Nuevo ticket</h2>
          <TicketForm onCreated={loadTickets} />
        </div>

        <div className="card">
          <h2>Mis tickets</h2>
          {loading && <p>Cargando...</p>}
          {!loading && tickets.length === 0 && (
            <div className="empty-state">Todavía no has reportado ningún problema.</div>
          )}
          <div className="ticket-list">
            {tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
