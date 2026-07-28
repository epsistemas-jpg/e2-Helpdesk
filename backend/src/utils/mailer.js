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

        to: Array.isArray(to)
          ? to.map(email => ({ email }))
          : [{ email: to }],

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

function ticketCreatedEmail(ticket, user) {

    return `

    <table align="center" width="620" cellpadding="0" cellspacing="0"
        style="
            background:#141414;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #262626;
            font-family:Arial,sans-serif;
        ">

        <tr>

            <td align="center" style="padding:35px 30px 15px;">

                <img
                    src="https://e2-helpdesk.vercel.app/images/logo-E2.png"
                    width="170"
                    alt="e2 Energía">

            </td>

        </tr>

        <tr>

            <td style="padding:15px 40px;">

                <h2 style="
                    margin:0;
                    color:#ffffff;
                    text-align:center;
                    font-size:28px;
                ">
                    🎫 Nuevo Ticket Registrado
                </h2>

                <p style="
                    color:#b6b6b6;
                    font-size:16px;
                    line-height:28px;
                    text-align:center;
                    margin-top:18px;
                ">

                    Se ha registrado una nueva solicitud de soporte en el
                    <strong style="color:#9fc82c;">
                        HelpDesk e2 Energía Eficiente
                    </strong>.

                </p>

            </td>

        </tr>

        <tr>

            <td style="padding:0 40px;">

                <table width="100%"
                    cellpadding="12"
                    cellspacing="0"
                    style="
                        background:#0f0f0f;
                        border:1px solid #262626;
                        border-radius:12px;
                    ">

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;width:170px;">
                            Ticket
                        </td>

                        <td style="color:#ffffff;">
                            #${ticket.id}
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;">
                            Solicitante
                        </td>

                        <td style="color:#ffffff;">
                            ${user.name}
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;">
                            Oficina
                        </td>

                        <td style="color:#ffffff;">
                            ${ticket.office}
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;">
                            Categoría
                        </td>

                        <td style="color:#ffffff;">
                            ${ticket.category}
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;">
                            Prioridad
                        </td>

                        <td style="color:#ffffff;">
                            ${ticket.priority.toUpperCase()}
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;">
                            Estado
                        </td>

                        <td style="color:#ffffff;">
                            ${ticket.status.replace("_"," ").toUpperCase()}
                        </td>
                    </tr>

                    <tr>
                        <td style="color:#9fc82c;font-weight:bold;">
                            Título
                        </td>

                        <td style="color:#ffffff;">
                            ${ticket.title}
                        </td>
                    </tr>

                </table>

            </td>

        </tr>

        <tr>

            <td style="padding:30px 40px;">

                <div style="
                    background:#0b0b0b;
                    border-left:4px solid #9fc82c;
                    padding:18px;
                    color:#d6d6d6;
                    line-height:28px;
                    border-radius:8px;
                ">

                    <strong style="color:#ffffff;">
                        Descripción del incidente
                    </strong>

                    <br><br>

                    ${ticket.description}

                </div>

            </td>

        </tr>

        <tr>

            <td style="padding:0 40px 35px;">

                <p style="
                    color:#b6b6b6;
                    font-size:15px;
                    line-height:28px;
                    text-align:center;
                ">

                    El equipo de Tecnología fue notificado automáticamente
                    y atenderá esta solicitud lo antes posible.

                </p>

            </td>

        </tr>

        <tr>

            <td style="
                background:#111111;
                border-top:1px solid #262626;
                padding:25px 35px;
            ">

                <p style="
                    margin:0;
                    color:#888;
                    font-size:13px;
                    line-height:24px;
                    text-align:center;
                ">

                    Este correo fue generado automáticamente por el
                    <strong>HelpDesk e2</strong>.

                    <br><br>

                    © ${new Date().getFullYear()} e2 Energía Eficiente

                </p>

            </td>

        </tr>

    </table>

    `;

}
function otpEmail(code) {
  return `
  <div style="
      margin:0;
      padding:40px 0;
      background:#0b0b0b;
      font-family:Arial,Helvetica,sans-serif;
      color:#ffffff;
  ">

      <table align="center" width="600" cellpadding="0" cellspacing="0"
          style="
              background:#141414;
              border-radius:18px;
              overflow:hidden;
              border:1px solid #262626;
          ">

          <tr>
              <td align="center" style="padding:35px 30px 15px;">

                  <img
                      src="https://e2-helpdesk.vercel.app/images/logo-E2.png"
                      width="170"
                      alt="e2 Energía"
                  >

              </td>
          </tr>

          <tr>
              <td style="padding:15px 40px;">

                  <h2 style="
                      margin:0;
                      color:#ffffff;
                      text-align:center;
                      font-size:28px;
                  ">
                      Verificación de inicio de sesión
                  </h2>

                  <p style="
                      color:#b6b6b6;
                      font-size:16px;
                      text-align:center;
                      line-height:28px;
                      margin-top:20px;
                  ">
                      Hemos recibido un intento de inicio de sesión en tu cuenta del
                      <strong style="color:#9fc82c;">HelpDesk e2 Energía Eficiente</strong>.
                  </p>

              </td>
          </tr>

          <tr>

              <td align="center" style="padding:10px 40px 25px;">

                  <div style="
                      display:inline-block;
                      background:#0b0b0b;
                      border:2px dashed #9fc82c;
                      border-radius:16px;
                      padding:18px 35px;
                  ">

                      <div style="
                          color:#9fc82c;
                          font-size:42px;
                          font-weight:bold;
                          letter-spacing:12px;
                      ">
                          ${code}
                      </div>

                  </div>

              </td>

          </tr>

          <tr>

              <td style="padding:0 40px 35px;">

                  <p style="
                      color:#b6b6b6;
                      font-size:15px;
                      line-height:28px;
                      text-align:center;
                  ">
                      Este código es válido durante
                      <strong style="color:#ffffff;">5 minutos</strong>.
                  </p>

                  <p style="
                      color:#b6b6b6;
                      font-size:15px;
                      line-height:28px;
                      text-align:center;
                  ">
                      Nunca compartas este código con otra persona.
                  </p>

              </td>

          </tr>

          <tr>

              <td style="
                  background:#111111;
                  padding:25px 35px;
                  border-top:1px solid #262626;
              ">

                  <p style="
                      margin:0;
                      color:#888;
                      font-size:13px;
                      text-align:center;
                      line-height:24px;
                  ">

                      Si no intentaste iniciar sesión, puedes ignorar este mensaje.
                      <br><br>

                      © ${new Date().getFullYear()} e2 Energía Eficiente<br>
                      HelpDesk · Departamento de Tecnología

                  </p>

              </td>

          </tr>

      </table>

  </div>
  `;
}
module.exports = {
  sendMail,
  otpEmail,
  ticketCreatedEmail

};