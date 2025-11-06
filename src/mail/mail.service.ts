/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
@Injectable()
export class MailService {
  async sendMail({ to, subject, html }) {
    try {
      await axios.post(
        `${process.env.RELAY_URL}/mail/send`,
        { to, subject, html },
        { headers: { 'x-api-key': process.env.RELAY_SECRET } },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendVerificationEmail({ name, email, verificationToken, origin }) {
    const link = `${origin}/verify-email?token=${verificationToken}&email=${email}`;

    const message = `
    <p>Thank you for signing up, ${name}!</p>
    <p>
      To complete your registration and activate your account, please verify your email address by clicking the button below.
    </p>
    <p style="margin: 20px 0;">
      <a 
        href="${link}" 
        style="
          background-color: #4CAF50; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px;
        "
      >
        Verify Email
      </a>
    </p>
    <p>
      If the button above doesn’t work, you can also copy and paste the link below into your browser:
    </p>
    <p><a href="${link}">${link}</a></p>
    <p>
      This verification link will expire in 24 hours for security reasons.
      If you did not create an account with us, please ignore this email.
    </p>
    <p>Best regards</p>
  `;

    return this.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      html: message,
    });
  }

  sendResetPasswordEmail({ name, email, token, origin }) {
    const link = `${origin}/reset-password?token=${token}&email=${email}`;

    const message = `
    <p>We received a request to reset the password for your account associated with this email address.</p>
    <p>
      If you made this request, please click the button below to reset your password:
    </p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="${link}" target="_blank" rel="noopener noreferrer"
        style="
          background-color: #4f46e5;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
        ">
        Reset Password
      </a>
    </p>
    <p>
      This link will expire in <strong>10 minutes</strong> for security reasons. If it expires, you’ll need to request a new password reset.
    </p>
    <p>
      If you did not request a password reset, you can safely ignore this email. Your account will remain secure, and no changes will be made.
    </p>
    <hr />
    <p style="font-size: 13px; color: #6b7280;">
      Thank you
    </p>
  `;

    return this.sendMail({
      to: email,
      subject: 'Reset Password',
      html: `<h4>Hello, ${name}</h4> ${message}`,
    });
  }
}
