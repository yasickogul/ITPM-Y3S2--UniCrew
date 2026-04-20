const nodemailer = require("nodemailer");

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS in Backend/.env"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

exports.sendUniversityAdminCredentialsEmail = async ({
  to,
  fullName,
  universityName,
  temporaryPassword,
}) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const subject = "UniCrew University Admin Account Credentials";
  const text = `Hello ${fullName},

Your University Admin account has been created for ${universityName}.

Login email: ${to}
Temporary password: ${temporaryPassword}

Please log in and change your password immediately.

Regards,
UniCrew`;

  const html = `
    <p>Hello <strong>${fullName}</strong>,</p>
    <p>Your University Admin account has been created for <strong>${universityName}</strong>.</p>
    <p>
      <strong>Login email:</strong> ${to}<br/>
      <strong>Temporary password:</strong> <code>${temporaryPassword}</code>
    </p>
    <p>Please log in and change your password immediately.</p>
    <p>Regards,<br/>UniCrew</p>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
