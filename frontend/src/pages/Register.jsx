import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [offices, setOffices] = useState(['América 2']);
  const [form, setForm] = useState({ name: '', email: '', password: '', office: 'América 2' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/offices').then(({ data }) => {
      if (data.offices?.length) setOffices(data.offices);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await register(form);
    if (res.ok) navigate('/');
    else setError(res.error);
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Crea tu cuenta</h1>
        <p className="subtitle">Regístrate para poder reportar problemas técnicos</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Correo</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="field">
            <label>Sede</label>
            <select value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })}>
              {offices.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
