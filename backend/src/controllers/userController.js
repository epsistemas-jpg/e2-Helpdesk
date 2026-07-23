const pool = require('../config/db');

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

module.exports = { listUsers, updateUser };
