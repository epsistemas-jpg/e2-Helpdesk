const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const pool = require('../config/db');
require('dotenv').config();

function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 64 &&
    /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, office: user.office };
}

const OFFICES = ['Oficina 205', 'Oficina 204', 'Oficina 206', 'Oficina 1107', 'Oficina 1109', 'Otra'];
const LEGACY_OFFICES = ['América 2', 'Sede Norte', 'Sede Centro', 'Sede Sur', 'Otra / Remoto'];

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

function frontendUrl() {
  return (process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production'
    ? (process.env.HOSTINGER === 'true' ? 'https://e2tickets.e2energiaeficiente.com' : 'https://e2-helpdesk-frontend.onrender.com')
    : 'http://localhost:5173')).replace(/\/$/, '');
}

function googleRedirectUri() {
  const isHostinger = process.env.HOSTINGER === 'true' || Boolean(process.env.PORT);
  if (isHostinger) return 'https://e2tickets.e2energiaeficiente.com/api/auth/google/callback';
  return process.env.GOOGLE_REDIRECT_URI || (process.env.NODE_ENV === 'production'
    ? (process.env.HOSTINGER === 'true' ? 'https://e2tickets.e2energiaeficiente.com/api/auth/google/callback' : 'https://e2-helpdesk-1.onrender.com/api/auth/google/callback')
    : 'http://localhost:4000/api/auth/google/callback');
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function isCorporateEmail(email) {
  const domain = (process.env.GOOGLE_ALLOWED_DOMAIN || 'e2energiaeficiente.com').toLowerCase();
  return typeof email === 'string' && email.toLowerCase().endsWith(`@${domain}`);
}

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

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error iniciando sesión.' });
  }
}

function startGoogleLogin(req, res) {
  if (!googleConfigured()) {
    return res.status(503).json({ error: 'Google OAuth no está configurado en el backend.' });
  }

  const state = crypto.randomBytes(24).toString('hex');
  const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `oauth_state=${encodeURIComponent(state)}; HttpOnly; SameSite=Lax; Max-Age=600; Path=/${secureCookie}`);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account'
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

async function googleCallback(req, res) {
  const fail = message => res.redirect(`${frontendUrl()}/pages/auth/login.html#google_error=${encodeURIComponent(message)}`);

  try {
    if (!googleConfigured()) return fail('Google OAuth no está configurado.');
    if (req.query.error) return fail('Autenticación cancelada.');
    if (!req.query.code || !req.query.state || req.query.state !== readCookie(req, 'oauth_state')) {
      return fail('La sesión de Google no es válida o expiró.');
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: googleRedirectUri(),
        grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) return fail('Google no pudo validar la cuenta.');

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email || profile.email_verified === false) {
      return fail('Google no devolvió un correo verificado.');
    }
    if (!isCorporateEmail(profile.email)) {
      return fail('Solo se permiten cuentas corporativas de e2energiaeficiente.com.');
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [profile.email]);
    let user = rows[0];
    if (user && !user.active) return fail('La cuenta está desactivada.');

    if (!user) {
      const temporaryPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      const name = String(profile.name || profile.email.split('@')[0]).slice(0, 100);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, office) VALUES (?, ?, ?, ?, ?)',
        [name, profile.email, passwordHash, 'employee', 'América 2']
      );
      user = { id: result.insertId, name, email: profile.email, role: 'employee', office: 'América 2' };
    }

    const token = signToken(user);
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/');
    return res.redirect(`${frontendUrl()}/pages/auth/login.html#google_token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Error en Google OAuth:', err);
    return fail('No fue posible iniciar sesión con Google.');
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const office = typeof req.body.office === 'string' ? req.body.office.trim() : '';
    if (name.length < 2 || name.length > 150 || ![...OFFICES, ...LEGACY_OFFICES].includes(office)) {
      return res.status(400).json({ error: 'El nombre u oficina no son válidos.' });
    }
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
      return res.status(400).json({ error: 'La contraseña nueva debe tener 8-64 caracteres, mayúscula, minúscula, número y símbolo.' });
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

module.exports = { register, login, startGoogleLogin, googleCallback, me, offices, updateProfile, updatePassword, OFFICES, getTechnicians };
