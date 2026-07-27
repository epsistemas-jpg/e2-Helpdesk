const axios = require("axios");

async function sendMail({ to, subject, html }) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "HelpDesk E2",
          email: "epsistemas@e2energiaeficiente.com"
        },

        to: [
          {
            email: to
          }
        ],

        subject,

        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Correo enviado con Brevo");
    return response.data;

  } catch (err) {
    console.error(
      "Error Brevo:",
      err.response?.data || err.message
    );

    throw err;
  }
}

function otpEmail(code) {
  return `
    <div style="font-family:Arial,sans-serif">

      <h2>Verificación de inicio de sesión</h2>

      <p>Tu código de verificación es:</p>

      <h1 style="
        letter-spacing:6px;
        color:#9fc82c;
      ">
        ${code}
      </h1>

      <p>
        Este código expira en 5 minutos.
      </p>

      <p>
        Si no intentaste iniciar sesión,
        ignora este correo.
      </p>

    </div>
  `;
}

module.exports = {
  sendMail,
  otpEmail
};