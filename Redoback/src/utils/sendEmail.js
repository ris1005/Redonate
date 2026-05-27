
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.BREVO_USER,
      to,
      subject,
      text,
    });

    console.log("Mail sent:", info.response);
  } catch (err) {
    console.error(err);
  }
};

module.exports = sendEmail;