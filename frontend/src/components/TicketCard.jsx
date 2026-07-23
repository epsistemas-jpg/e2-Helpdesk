import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from './Badges';

export default function TicketCard({ ticket }) {
  return (
    <Link to={`/ticket/${ticket.id}`} className="ticket-card">
      <div className="ticket-card-top">
        <div>
          <div className="ticket-title">#{ticket.id} · {ticket.title}</div>
          <div className="ticket-meta">
            <span>{ticket.office}</span>
            {!!ticket.is_remote && <span>🖥️ AnyDesk: {ticket.anydesk_code}</span>}
            {ticket.reporter_name && <span>👤 {ticket.reporter_name}</span>}
            {ticket.assigned_name && <span>🛠️ Asignado a {ticket.assigned_name}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="ticket-desc">{ticket.description}</div>
    </Link>
  );
}
