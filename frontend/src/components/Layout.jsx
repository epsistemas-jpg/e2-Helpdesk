import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  employee: 'Empleado',
  support: 'Soporte',
  admin: 'Administrador',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">TI</span>
          Soporte TI · Tickets
        </Link>
        {user && (
          <div className="topbar-actions">
            {(user.role === 'admin' || user.role === 'support') && (
              <Link to="/admin" className="btn btn-ghost btn-sm">Panel de tickets</Link>
            )}
            <Link to="/mis-tickets" className="btn btn-ghost btn-sm">Mis tickets</Link>
            <span className="user-chip">{user.name} · {roleLabels[user.role]}</span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Salir</button>
          </div>
        )}
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
