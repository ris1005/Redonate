
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

// Verify SMTP connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("VERIFY ERROR:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"ReDonate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
