import nodemailer from "nodemailer";
import 'dotenv/config';

/**
 * Função para enviar email (compatível com o padrão do projeto de referência)
 * @param {string} email - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} message - Conteúdo HTML do email
 * @returns {Promise<void>}
 */
export const sendEmail = async (email, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || process.env.HOST,
                pass: process.env.EMAIL_PASS || process.env.PASS
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER || process.env.HOST,
            to: email,
            subject: subject,
            html: message
        });
        
        return {
            success: true,
            message: 'Email enviado com sucesso'
        };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        throw new Error(`Falha no envio do email: ${error.message}`);
    }
};

/**
 * Template básico para emails HTML
 * @param {string} title - Título do email
 * @param {string} content - Conteúdo principal
 * @param {string} footerText - Texto do rodapé
 * @returns {string} - HTML do email
 */
export const createEmailTemplate = (title, content, footerText = '') => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .email-container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
            }
            .content {
                margin-bottom: 30px;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 0;
            }
            .button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>DressFy</h1>
                <p>Gerenciamento de Estoque</p>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                ${footerText || 'Este é um email automático, não responda a esta mensagem.'}
                <br>
                <strong>DressFy - Sistema de Gerenciamento de Estoque</strong>
            </div>
        </div>
    </body>
    </html>
  `;
};