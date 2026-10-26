const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const ROLES = ['employee', 'support', 'admin'];
const CORPORATE_DOMAIN = (process.env.GOOGLE_ALLOWED_DOMAIN || 'e2energiaeficiente.com').toLowerCase();

function isCorporateEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(`@${CORPORATE_DOMAIN}`);
}

async function listUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, role, office, phone, active, last_login, created_at
       FROM users ORDER BY name ASC`
    );
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error listando los usuarios.' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, active } = req.body;
    const roles = ['employee', 'support', 'admin'];
    if (role !== undefined && !roles.includes(role)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }
    if (Number(id) === req.user.id && active === false) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta.' });
    }
    const fields = [];
    const values = [];
    if (role !== undefined) { fields.push('role = ?'); values.push(role); }
    if (active !== undefined) { fields.push('active = ?'); values.push(active ? 1 : 0); }
    if (!fields.length) return res.status(400).json({ error: 'No hay cambios para guardar.' });
    values.push(id);
    const [result] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ message: 'Usuario actualizado.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error actualizando el usuario.' });
  }
}

async function createUser(req, res) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const office = typeof req.body?.office === 'string' ? req.body.office.trim() : '';
    const role = typeof req.body?.role === 'string' ? req.body.role : 'employee';

    if (name.length < 2 || name.length > 150) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 150 caracteres.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isCorporateEmail(email)) {
      return res.status(400).json({ error: `El correo debe pertenecer a @${CORPORATE_DOMAIN}.` });
    }
    if (!office || office.length > 100) {
      return res.status(400).json({ error: 'La oficina es obligatoria y no puede superar 100 caracteres.' });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Rol inválido.' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });

    // Google será el método de acceso; este hash aleatorio solo satisface el esquema legado.
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, office, active) VALUES (?, ?, ?, ?, ?, 1)',
      [name, email, passwordHash, role, office]
    );
    return res.status(201).json({ user: { id: result.insertId, name, email, role, office, active: 1 } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error creando el usuario.' });
  }
}

module.exports = { listUsers, updateUser, createUser };
