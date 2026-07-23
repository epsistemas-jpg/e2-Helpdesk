const axios = require("axios");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function enviarNuevoTicket(ticket, usuario) {
    try {

        console.log("TOKEN:", TOKEN);
        console.log("CHAT_ID:", CHAT_ID);

        const mensaje = `
🔔 *NUEVO REPORTE TI*

━━━━━━━━━━━━━━━━━━

🎫 *Ticket:* #${ticket.id}

👤 *Empleado:*
${usuario.name}

📧 *Correo:*
${usuario.email}

🏢 *Oficina:*
${ticket.office}

📂 *Categoría:*
${ticket.category}

⚠️ *Prioridad:*
${ticket.priority.toUpperCase()}

📝 *Título:*
${ticket.title}

📄 *Descripción:*
${ticket.description}

💻 *Remoto:*
${ticket.is_remote ? "Sí" : "No"}

${ticket.anydesk_code ? `🖥️ *AnyDesk:* ${ticket.anydesk_code}` : ""}

🕒 ${new Date().toLocaleString("es-CO")}

━━━━━━━━━━━━━━━━━━
`;

        await axios.post(
            `https://api.telegram.org/bot${TOKEN}/sendMessage`,
            {
                chat_id: CHAT_ID,
                text: mensaje,
                parse_mode: "Markdown"
            }
        );

        console.log("✅ Mensaje enviado a Telegram");

    } catch (error) {

        console.error("❌ Error enviando mensaje a Telegram:");

        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }

    }
}

module.exports = {
    enviarNuevoTicket
};