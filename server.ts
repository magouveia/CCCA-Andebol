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
  const PORT = process.env.CUSTOM_PORT ? parseInt(process.env.CUSTOM_PORT, 10) : 3000;

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
      const recipients = ['formscccaandebol@gmail.com'];
      const senderEmail = process.env.SENDER_EMAIL || 'inscricoes@migasapp.net';

      const birthYear = new Date(birthDate).getFullYear();
      let category = "Não Definido";
      if (birthYear <= 2005) category = "Seniores";
      else if (birthYear <= 2007) category = "Sub-20";
      else if (birthYear <= 2009) category = "Sub-18";
      else if (birthYear <= 2011) category = "Sub-16";
      else if (birthYear <= 2013) category = "Sub-14";
      else category = "Sub-12";

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; padding: 40px 20px; color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://imgur.com/ZztTy4C.png" alt="CCCA Logo" style="width: 80px; height: auto; margin-bottom: 20px;" />
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">CCCA Andebol</h1>
            <p style="margin: 10px 0 0 0; color: #3b82f6; font-weight: 700; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">NOVA INSCRIÇÃO RECEBIDA</p>
          </div>
          
          <div style="border-top: 1px solid #1f1f23; margin-bottom: 30px; opacity: 0.5;"></div>

          <!-- Card -->
          <div style="border: 1px solid #1f1f23; border-radius: 12px; padding: 30px; background-color: #050505;">
            <!-- Atleta -->
            <div style="margin-bottom: 35px;">
              <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 8px;">ATLETA / NOME</label>
              <div style="color: #ffffff; font-size: 24px; font-weight: 700;">${name}</div>
            </div>

            <!-- Row 1 -->
            <div style="display: table; width: 100%; margin-bottom: 35px;">
              <div style="display: table-cell; width: 50%; vertical-align: top;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 8px;">CONTACTO</label>
                <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${contact}</div>
              </div>
              <div style="display: table-cell; width: 50%; vertical-align: top;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 8px;">ESCALÃO</label>
                <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${category}</div>
              </div>
            </div>

            <!-- Row 2 -->
            <div style="display: table; width: 100%; margin-bottom: 10px;">
              <div style="display: table-cell; width: 50%; vertical-align: top;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 8px;">EMAIL</label>
                <div style="color: #ffffff; font-size: 16px;">${email}</div>
              </div>
              <div style="display: table-cell; width: 50%; vertical-align: top;">
                <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 8px;">NASCIMENTO</label>
                <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${new Date(birthDate).toLocaleDateString('pt-PT')}</div>
              </div>
            </div>

            <div style="border-top: 1px solid #1f1f23; margin: 25px 0; opacity: 0.5;"></div>

            <!-- Observações -->
            <div>
              <label style="color: #6a6a6d; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 12px;">OBSERVAÇÕES</label>
              <div style="background-color: #0c0c0e; padding: 20px; border-radius: 8px; border: 1px solid #1f1f23;">
                <div style="color: #cccccc; font-size: 14px; font-style: italic; line-height: 1.5;">
                  ${observations || 'Nenhuma observação registada.'}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; color: #52525b; font-size: 11px;">
            <p style="margin: 0;">Este é um e-mail automático do CCCA Andebol.</p>
            <p style="margin: 6px 0 0 0;">Submetido em: ${new Date().toLocaleString('pt-PT')}</p>
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
