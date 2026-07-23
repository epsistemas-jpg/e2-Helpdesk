const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    console.log('[mailer] SMTP no configurado. Asunto:', subject);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"HelpDesk TI" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('[mailer] Error enviando correo:', err.message);
  }
}

function emailLayout({ eyebrow, title, intro, body, footer = 'HelpDesk TI · Gestión de soporte interno' }) {
  return `<!doctype html><html><body style="margin:0;background:#f3f6f8;font-family:Arial,Helvetica,sans-serif;color:#17212b">
  <div style="max-width:640px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(20,40,60,.10)">
    <div style="padding:24px 32px;background:#0b1726;color:#fff"><div style="font-size:13px;letter-spacing:1px;color:#c2d500;font-weight:bold">${eyebrow}</div><div style="font-size:24px;font-weight:bold;margin-top:8px">HelpDesk TI</div></div>
    <div style="padding:32px"><h1 style="font-size:24px;margin:0 0 12px;color:#17212b">${title}</h1><p style="font-size:15px;line-height:1.6;color:#5b6875">${intro}</p>${body}</div>
    <div style="padding:18px 32px;background:#f7f9fa;color:#7a8792;font-size:12px">${footer}</div>
  </div></body></html>`;
}

function ticketCreatedEmail(ticket, reporter) {
  const remote = ticket.is_remote ? `Sí · Código AnyDesk: ${ticket.anydesk_code || 'No proporcionado'}` : 'No';
  return emailLayout({
    eyebrow: 'NUEVO TICKET',
    title: `Ticket #${ticket.id} · ${ticket.title}`,
    intro: `Se registró una nueva solicitud de soporte por parte de <strong>${reporter.name}</strong>.`,
    body: `<div style="margin:24px 0;padding:18px;border:1px solid #e6ebef;border-radius:12px"><p><strong>Solicitante:</strong> ${reporter.name} (${reporter.email})</p><p><strong>Oficina:</strong> ${ticket.office}</p><p><strong>Categoría:</strong> ${ticket.category}</p><p><strong>Prioridad:</strong> <span style="color:#b45309;font-weight:bold">${ticket.priority.toUpperCase()}</span></p><p><strong>Trabajo remoto:</strong> ${remote}</p><p><strong>Descripción:</strong><br>${ticket.description}</p></div><p style="font-size:14px;color:#5b6875">Ingresa al sistema para asignarte el ticket y comenzar la atención.</p>`,
  });
}

function statusUpdatedEmail(ticket) {
  return emailLayout({
    eyebrow: 'ACTUALIZACIÓN DE TICKET',
    title: `El ticket #${ticket.id} cambió de estado`,
    intro: `La solicitud <strong>${ticket.title}</strong> tiene una nueva actualización.`,
    body: `<div style="margin:24px 0;padding:18px;border-radius:12px;background:#f3f8df;text-align:center"><div style="font-size:12px;color:#66720a;text-transform:uppercase;letter-spacing:1px">Nuevo estado</div><div style="font-size:22px;font-weight:bold;color:#455000;margin-top:8px">${ticket.status.replace('_', ' ').toUpperCase()}</div></div><p style="font-size:14px;color:#5b6875">Consulta el detalle en HelpDesk para revisar el historial y las respuestas del equipo de soporte.</p>`,
  });
}

function otpEmail(code) {
  return emailLayout({
    eyebrow: 'VERIFICACIÓN DE ACCESO',
    title: 'Confirma tu inicio de sesión',
    intro: 'Usa el siguiente código para completar tu acceso a HelpDesk:',
    body: `<div style="margin:24px 0;padding:20px;border-radius:12px;background:#f3f8df;text-align:center;font-size:34px;font-weight:bold;letter-spacing:10px;color:#455000">${code}</div><p style="font-size:13px;color:#7a8792">Este código caduca en 5 minutos. Si no solicitaste este acceso, puedes ignorar este mensaje.</p>`,
  });
}

module.exports = { sendMail, ticketCreatedEmail, statusUpdatedEmail, otpEmail };
