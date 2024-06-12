import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // gmail's smtp host
    port: 587, // gmail's smtp port
    secure: config.node_env === 'production',
    auth: {
      user: 'bakhtiarfahim360@gmail.com',
      pass: 'pzci rsmw kwex rewd', // ph-university's app password set in my gmail's security
    },
  });

  await transporter.sendMail({
    from: 'bakhtiarfahim360@gmail.com', // sender address
    to, // list of receivers
    subject: 'Change your password', // Subject line
    text: 'Reset password within 10 minutes!', // plain text body
    html, // html body
  });
};
