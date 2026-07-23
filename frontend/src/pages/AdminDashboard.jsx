import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import TicketCard from '../components/TicketCard';
import api from '../api/client';

const STATUS_LABELS = { abierto: 'Abiertos', en_progreso: 'En progreso', resuelto: 'Resueltos', cerrado: 'Cerrados' };

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [statsData, setStatsData] = useState({ byStatus: [], byPriority: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const [ticketsRes, statsRes] = await Promise.all([
        api.get('/tickets', { params }),
        api.get('/tickets/stats'),
      ]);
      setTickets(ticketsRes.data.tickets);
      setStatsData(statsRes.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function countFor(status) {
    return statsData.byStatus.find((s) => s.status === status)?.total || 0;
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Panel de soporte TI</h1>
          <p>Todos los tickets reportados por el equipo, ordenados por prioridad.</p>
        </div>
      </div>

      <div className="stat-row">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div className="stat-box" key={key}>
            <div className="num">{countFor(key)}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </div>

      <div className="filters">
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_progreso">En progreso</option>
          <option value="resuelto">Resuelto</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          <option value="">Todas las prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {loading && <p>Cargando...</p>}
      {!loading && tickets.length === 0 && <div className="empty-state">No hay tickets con estos filtros.</div>}

      <div className="ticket-list">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </Layout>
  );
}
