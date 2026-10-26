const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, office, active FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );
    if (!rows.length || !rows[0].active) {
      return res.status(401).json({ error: 'La sesión ya no está activa.' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Error validando sesión:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tienes permisos para esta acción."
      });
    }

    next();
  };
}
module.exports = { requireAuth, requireRole };
