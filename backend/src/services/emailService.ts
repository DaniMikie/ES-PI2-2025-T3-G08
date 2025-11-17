/**
 * Autor: Gustavo Alves 
 * Projeto: Projeto NotaDez
 * Arquivo: emailService.ts
 * Data: 18/09/2025
 * 
 * Serviço de Envio de Emails
 * Utiliza Nodemailer com Gmail SMTP para enviar emails de verificação
 */

import nodemailer from 'nodemailer';

// Configuração do transporter do Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Servidor SMTP do Gmail
  port: 587, // Porta TLS
  secure: false, // true para porta 465, false para outras portas
  auth: {
    user: process.env.GMAIL_USER, // Email do remetente
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') // Senha de app do Gmail (remove espaços)
  },
  tls: {
    rejectUnauthorized: false // Aceita certificados auto-assinados
  }
});

/**
 * Envia email com código de verificação para cadastro
 * email - Email do destinatário
 * code - Código de 6 dígitos
 * name - Nome do usuário
 * Retorna informações do email enviado
 */
export async function sendVerificationEmail(email: string, code: string, name: string) {
  try {
    const mailOptions = {
      from: `"NotaDez" <${process.env.GMAIL_USER}>`, // Remetente
      to: email, // Destinatário
      subject: 'Código de Verificação - NotaDez', // Assunto
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              background-color: #0d6efd;
              color: white;
              width: 60px;
              height: 60px;
              border-radius: 10px;
              display: inline-block;
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
              line-height: 60px;
              text-align: center;
            }
            .code-box {
              background-color: #fff;
              border: 2px dashed #0d6efd;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #0d6efd;
              letter-spacing: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">10</div>
              <h1 style="color: #0d6efd; margin: 0;">NotaDez</h1>
            </div>
            
            <p>Olá, <strong>${name}</strong>!</p>
            
            <p>Obrigado por se cadastrar no NotaDez. Para completar seu cadastro, use o código de verificação abaixo:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p><strong>Este código expira em 15 minutos.</strong></p>
            
            <p>Se você não solicitou este cadastro, ignore este email.</p>
            
            <div class="footer">
              <p>© 2025 NotaDez - Sistema de Gerenciamento de Notas</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificação enviado para: ${email}`);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Falha ao enviar email de verificação');
  }
}

/**
 * Envia email com código de recuperação de senha
 * email - Email do destinatário
 * code - Código de 6 dígitos
 * name - Nome do usuário
 * Retorna informações do email enviado
 */
export async function sendPasswordResetEmail(email: string, code: string, name: string) {
  try {
    const mailOptions = {
      from: `"NotaDez" <${process.env.GMAIL_USER}>`, // Remetente
      to: email, // Destinatário
      subject: 'Recuperação de Senha - NotaDez', // Assunto
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              background-color: #0d6efd;
              color: white;
              width: 60px;
              height: 60px;
              border-radius: 10px;
              display: inline-block;
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
              line-height: 60px;
              text-align: center;
            }
            .code-box {
              background-color: #fff;
              border: 2px dashed #dc3545;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #dc3545;
              letter-spacing: 8px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">10</div>
              <h1 style="color: #0d6efd; margin: 0;">NotaDez</h1>
            </div>
            
            <p>Olá, <strong>${name}</strong>!</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para continuar:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p><strong>Este código expira em 15 minutos.</strong></p>
            
            <div class="warning">
              <strong>⚠️ Atenção:</strong> Se você não solicitou a recuperação de senha, ignore este email e sua senha permanecerá inalterada.
            </div>
            
            <div class="footer">
              <p>© 2025 NotaDez - Sistema de Gerenciamento de Notas</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperação enviado para: ${email}`);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Falha ao enviar email de recuperação');
  }
}
