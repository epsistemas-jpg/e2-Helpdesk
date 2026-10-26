const pool = require('../config/db');
const { answerHelpdeskQuestion } = require('./geminiService');

function cleanMessage(text) {
  return String(text || '').replace(/<users\/[^>]+>/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

async function handleGoogleChatEvent(event) {
  if (event.type === 'ADDED_TO_SPACE') {
    return { text: 'Hola. Soy el asistente de E2 HelpDesk. Pregúntame sobre soporte TI o consulta tus tickets.' };
  }
  if (event.type !== 'MESSAGE') return { text: 'Estoy listo para ayudarte con tus dudas de soporte TI.' };

  const question = cleanMessage(event.message?.text);
  if (!question) return { text: 'Escribe tu duda de soporte, por ejemplo: “¿Cómo reviso el estado de mi ticket?”' };

  const email = String(event.user?.email || '').trim().toLowerCase();
  if (!email) return { text: 'No pude identificar tu cuenta corporativa. Escríbeme desde tu cuenta @e2energiaeficiente.com.' };

  const [users] = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = ? AND active = 1 LIMIT 1',
    [email]
  );
  if (!users.length) return { text: 'Tu cuenta todavía no está registrada o activa en E2 HelpDesk. Solicita al administrador que la habilite.' };

  const [tickets] = await pool.query(
    `SELECT title, status, priority, sla_due_at
     FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 8`,
    [users[0].id]
  );

  const answer = await answerHelpdeskQuestion({ question, tickets });
  return { text: answer.reply };
}

module.exports = { handleGoogleChatEvent };
