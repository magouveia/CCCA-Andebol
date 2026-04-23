import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY não configurado.");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

async function startServer() {
  console.log("Iniciando o Servidor CCCA Backend...");
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Rota de Health Check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Rota de Envio de Email
  app.post("/api/send", async (req, res) => {
    try {
      const { name, email, contact, birthDate, observations } = req.body;
      if (!name || !email || !contact || !birthDate) {
        return res.status(400).json({ error: "Campos obrigatórios em falta." });
      }

      const resend = getResend();
      const recipientEnv = process.env.RECIPIENT_EMAIL || 'magouveia1982@gmail.com';
      const senderEmail = process.env.SENDER_EMAIL || 'inscricoes@migasapp.net';
      const recipients = recipientEnv.split(',').map(email => email.trim());

      const birthYear = new Date(birthDate).getFullYear();
      let category = "Não Definido";
      if (birthYear <= 2005) category = "Seniores";
      else if (birthYear <= 2007) category = "Sub-20";
      else if (birthYear <= 2009) category = "Sub-18";
      else if (birthYear <= 2011) category = "Sub-16";
      else if (birthYear <= 2013) category = "Sub-14";
      else category = "Sub-12";

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; padding: 20px; border-radius: 16px; color: #f1f1f1;">
          <div style="text-align: center; padding: 20px; border-bottom: 1px solid #1f1f23; margin-bottom: 30px;">
            <img src="https://imgur.com/CZrVcJj.png" alt="CCCA Logo" style="width: 150px; height: auto;" />
            <h1 style="margin: 15px 0 0 0; font-size: 24px; color: #ffffff; letter-spacing: -1px;">CCCA Andebol</h1>
            <p style="margin: 5px 0 0 0; color: #3b82f6; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Nova Inscrição Recebida</p>
          </div>
          
          <div style="background-color: #000000; padding: 30px; border-radius: 12px; border: 1px solid #27272a; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
            <div style="margin-bottom: 20px;">
              <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Atleta / Nome</label>
              <div style="color: #ffffff; font-size: 18px; font-weight: 600; margin-top: 4px;">${name}</div>
            </div>

            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Contacto</label>
                <div style="color: #ffffff; font-size: 16px; font-weight: 500; margin-top: 4px;">${contact}</div>
              </div>
              <div style="flex: 1;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Escalão</label>
                <div style="color: #3b82f6; font-size: 16px; font-weight: 700; margin-top: 4px;">${category}</div>
              </div>
            </div>

            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Email</label>
                <div style="margin-top: 4px;"><a href="mailto:${email}" style="color: #ffffff; text-decoration: none; font-size: 15px;">${email}</a></div>
              </div>
              <div style="flex: 1;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Nascimento</label>
                <div style="color: #ffffff; font-size: 16px; font-weight: 500; margin-top: 4px;">${new Date(birthDate).toLocaleDateString('pt-PT')}</div>
              </div>
            </div>

            ${observations ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #1f1f23;"><label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Observações</label><div style="color: #cccccc; font-size: 14px; margin-top: 8px; font-style: italic; background-color: #0c0c0e; padding: 15px; border-radius: 8px; line-height: 1.5;">${observations}</div></div>` : ''}
          </div>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: `CCCA Andebol <${senderEmail}>`,
        to: recipients,
        subject: `[CCCA Andebol] Inscrição: ${name}`,
        html: htmlContent,
      });

      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const distPath = path.resolve(__dirname, "dist");
  
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor CCCA a correr na porta ${PORT}`);
  });
}

startServer();
