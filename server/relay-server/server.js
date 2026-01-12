import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  const { from, to, subject, html, text, apiKey } = req.body;

  // Simple Security: API Key check karein taaki koi bhi aapka service use na kar sake
  if (apiKey !== process.env.EMAIL_SERVICE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Basic fallback
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT, () => console.log('Email Service running on port 3001'));
