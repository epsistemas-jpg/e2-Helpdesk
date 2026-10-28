const pool = require('../config/db');
const { answerHelpdeskQuestion } = require('../services/geminiService');

async function askAssistant(req, res) {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim().slice(0, 2000) : '';
    if (question.length < 2) return res.status(400).json({ error: 'Escribe una pregunta.' });
    const history = Array.isArray(req.body?.history)
      ? req.body.history
        .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.text === 'string')
        .slice(-6)
        .map(item => ({ role: item.role, text: item.text.trim().slice(0, 800) }))
      : [];
    const [tickets] = await pool.query(
      `SELECT title, status, priority, sla_due_at FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 8`,
      [req.user.id]
    );
    const answer = await answerHelpdeskQuestion({ question, tickets, history });
    return res.json({ reply: answer.reply, source: answer.source, needsTicket: Boolean(answer.needsTicket) });
  } catch (error) {
    console.error('Error respondiendo desde el asistente:', error.message);
    return res.status(500).json({ error: 'No fue posible responder en este momento.' });
  }
}

module.exports = { askAssistant };
