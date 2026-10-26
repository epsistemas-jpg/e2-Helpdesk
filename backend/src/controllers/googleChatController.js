const { handleGoogleChatEvent } = require('../services/googleChatBotService');
const { verifyGoogleChatRequest } = require('../services/googleChatAuthService');

async function googleChatEvent(req, res) {
  try {
    if (!await verifyGoogleChatRequest(req)) {
      return res.status(401).json({ error: 'Solicitud de Google Chat no verificada.' });
    }
    return res.json(await handleGoogleChatEvent(req.body || {}));
  } catch (error) {
    console.error('Error procesando evento de Google Chat:', error.message);
    return res.status(401).json({ error: 'No se pudo verificar la solicitud de Google Chat.' });
  }
}

module.exports = { googleChatEvent };
