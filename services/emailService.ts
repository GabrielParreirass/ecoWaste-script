import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gabrielparreiras72@gmail.com", // Definido no .env
    pass: "dobp lhvb tewp mdqi" // Definido no .env (senha de app)
  },
});

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: '"Gabriel" <gabrielparreiras72@gmail.com>',
      to,
      subject,
      text,
    });
    console.log("E-mail enviado: " + info.response);
  } catch (error) {
    console.error("Erro ao enviar e-mail: ", error);
    throw error;
  }
}
