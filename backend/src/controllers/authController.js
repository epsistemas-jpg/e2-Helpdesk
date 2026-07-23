const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendMail, otpEmail } = require('../utils/mailer');
require('dotenv').config();
const { v4: uuidv4 } = require("uuid");

const pendingLogins = new Map();

function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 64 &&
    /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, office: user.office };
}

const OFFICES = ['América 2', 'Sede Norte', 'Sede Centro', 'Sede Sur', 'Otra / Remoto'];

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, office: user.office },
    process.env.JWT_SECRET,
    { expiresIn: '15d' }
  );
}

// Registro abierto para empleados. Los roles support/admin se asignan manualmente en la BD.
async function register(req, res) {
  try {
    const { name, email, password, office } = req.body;
    if (!name || name.length > 100 || !email || email.length > 254 || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
    }
    if (!validPassword(password)) {
      return res.status(400).json({ error: 'Contraseña inválida: usa 8-64 caracteres con mayúscula, minúscula, número y símbolo.' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, office) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, 'employee', office || 'América 2']
    );
    const user = { id: result.insertId, name, email, role: 'employee', office: office || 'América 2' };
    if (!validPassword(password)) {
      return res.status(400).json({ error: 'La contraseÃ±a debe tener 8-64 caracteres, mayÃºscula, minÃºscula, nÃºmero y sÃ­mbolo.' });
    }
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando la cuenta.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || email.length > 254 || !password || password.length > 64) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND active = 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const user = rows[0];

    console.log("Email recibido:", email);
    console.log("Password recibida:", password);
    console.log("Hash guardado:", user.password_hash);

    const match = await bcrypt.compare(password, user.password_hash);

    console.log("¿Coincide la contraseña?:", match);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    console.log("Headers:", req.headers);
    console.log("Trusted Device:", req.headers["x-trusted-device"]);
    // Revisar si el dispositivo ya es de confianza
    const trustedDevice = req.headers["x-trusted-device"];

    if (trustedDevice) {

      const hash = crypto
        .createHash("sha256")
        .update(trustedDevice)
        .digest("hex");

      const [devices] = await pool.query(
        `SELECT *
         FROM trusted_devices
         WHERE user_id = ?
         AND device_token = ?
         AND expires_at > NOW()`,
        [user.id, hash]
      );
      console.log("Dispositivos encontrados:", devices);

      if (devices.length) {

        return res.json({
          token: signToken(user),
          user: publicUser(user)
        });

      }

    }
    const challengeId = crypto.randomUUID();
    const code = String(crypto.randomInt(100000, 1000000));
    pendingLogins.set(challengeId, { codeHash: crypto.createHash('sha256').update(code).digest('hex'), user: publicUser(user), expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
    await sendMail({ to: user.email, subject: 'Código de verificación de HelpDesk', html: otpEmail(code) });
    res.json({ requiresOtp: true, challengeId, message: 'Enviamos un código de verificación a tu correo.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error iniciando sesión.' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { challengeId, code } = req.body;
    const challenge = pendingLogins.get(challengeId);
    if (!challenge || Date.now() > challenge.expiresAt) {
      pendingLogins.delete(challengeId);
      return res.status(401).json({ error: 'El código expiró. Inicia sesión nuevamente.' });
    }
    if (!/^\d{6}$/.test(String(code || ''))) return res.status(400).json({ error: 'El código debe tener 6 dígitos.' });
    challenge.attempts += 1;
    const hash = crypto.createHash('sha256').update(String(code)).digest('hex');
    if (challenge.attempts > 5 || hash !== challenge.codeHash) {
      if (challenge.attempts > 5) pendingLogins.delete(challengeId);
      return res.status(401).json({ error: 'Código de verificación incorrecto.' });
    }
    pendingLogins.delete(challengeId);

    // Crear identificador único para este dispositivo
    const deviceToken = uuidv4();

    // Guardarlo como hash por seguridad
    const deviceHash = crypto
      .createHash("sha256")
      .update(deviceToken)
      .digest("hex");

    // Expira en 15 días
    await pool.query(
      `INSERT INTO trusted_devices
    (user_id, device_token, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 DAY))`,
      [
        challenge.user.id,
        deviceHash
      ]
    );

    return res.json({
      token: signToken(challenge.user),
      trustedDevice: deviceToken,
      user: challenge.user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error verificando el código.' });
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const office = typeof req.body.office === 'string' ? req.body.office.trim() : '';
    if (!name || !office) return res.status(400).json({ error: 'Nombre y oficina son obligatorios.' });
    await pool.query('UPDATE users SET name = ?, office = ? WHERE id = ?', [name, office, req.user.id]);
    const [rows] = await pool.query('SELECT id, name, email, role, office FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando el perfil.' });
  }
}

async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !validPassword(newPassword)) {
      return res.status(400).json({ error: 'La contraseña nueva debe tener al menos 6 caracteres.' });
    }
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
    }
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 10), req.user.id]);
    res.json({ message: 'Contraseña actualizada.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando la contraseña.' });
  }
}

function offices(req, res) {
  res.json({ offices: OFFICES });
}

async function getTechnicians(req, res) {
    try {

        const [rows] = await pool.query(`
            SELECT
                id,
                name
            FROM users
            WHERE role IN ('support','admin')
              AND active = 1
            ORDER BY name
        `);

        res.json({
            technicians: rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Error obteniendo técnicos."
        });

    }
}

module.exports = { register, login, verifyOtp, me, offices, updateProfile, updatePassword, OFFICES, getTechnicians };
