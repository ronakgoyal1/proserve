import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export const sendEmailNotification = async (to_email, to_name, subject, message) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Mocking email send to:', to_email);
    console.log(`[EMAIL SEND MOCK] Subject: ${subject}\nMessage: ${message}`);
    return Promise.resolve({ text: 'OK' });
  }

  try {
    const templateParams = {
      to_email,
      to_name,
      subject,
      message,
    };
    
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};
