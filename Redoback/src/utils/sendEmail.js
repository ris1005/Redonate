
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      text,
    });

    console.log("Email sent:", data);
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendEmail;

