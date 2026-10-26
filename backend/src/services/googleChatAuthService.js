const { OAuth2Client } = require('google-auth-library');

const verifier = new OAuth2Client();

async function verifyGoogleChatRequest(req) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const audience = String(process.env.GOOGLE_CHAT_ENDPOINT_URL || '').trim();
  const serviceAccount = String(process.env.GOOGLE_CHAT_SERVICE_ACCOUNT_EMAIL || '').trim();
  if (!token || !audience || !serviceAccount) return null;

  const ticket = await verifier.verifyIdToken({ idToken: token, audience });
  const payload = ticket.getPayload();
  if (!payload || payload.email !== serviceAccount || payload.email_verified !== true) return null;
  return payload;
}

module.exports = { verifyGoogleChatRequest };
