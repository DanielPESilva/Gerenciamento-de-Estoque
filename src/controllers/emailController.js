import { sendEmail, createEmailTemplate } from "../utils/sendEmail.js";
import { sendError, sendResponse } from "../utils/messages.js";
import { ZodError } from 'zod';
import { APIError } from "../utils/wrapException.js";
import { 
  simpleEmailSchema, 
  saleNotificationSchema 
} from "../validators/emailValidators.js";

class EmailController {
  
  /**
   * Envia email simples
   */
  static async sendSimpleEmail(req, res) {
    try {
      // Validar dados de entrada
      const validatedData = simpleEmailSchema.parse(req.body);
      const { to, subject, message, isHtml } = validatedData;

      // Preparar conteúdo
      const content = isHtml ? message : createEmailTemplate(subject, `<p>${message}</p>`);
      
      // Enviar email
      const result = await sendEmail(to, subject, content);

      return sendResponse(res, 200, {
        data: result,
        message: 'Email enviado com sucesso'
      });

    } catch (err) {
      console.error('Erro ao enviar email:', err);
      
      if (err instanceof ZodError) {
        const errors = err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        return sendError(res, 400, errors);
      } else if (err instanceof APIError) {
        return sendError(res, err.statusCode, err.errors);
      }

      // Verificar se é erro de configuração de email
      if (err.message.includes('Invalid login') || err.message.includes('Authentication')) {
        return sendError(res, 500, `Erro de configuração de email: Credenciais inválidas. Verifique as configurações EMAIL_USER e EMAIL_PASS no arquivo .env`);
      }

      return sendError(res, 500, `Erro interno do servidor ao enviar email: ${err.message}`);
    }
  }





  /**
   * Envia notificação de nova venda
   */
  static async sendSaleNotification(req, res) {
    try {
      // Validar dados de entrada
      const validatedData = saleNotificationSchema.parse(req.body);
      const { to, clienteName, items, totalValue, saleDate } = validatedData;

      const subject = `Nova Venda Realizada - ${clienteName}`;
      
      // Formatear lista de itens
      const itemsList = items.map(item => 
        `<li><strong>${item.nome}</strong> - Qtd: ${item.quantidade} - R$ ${item.preco?.toFixed(2) || '0.00'}</li>`
      ).join('');

      const content = createEmailTemplate(
        'Nova Venda Registrada',
        `
          <h2>Nova Venda Realizada!</h2>
          <p><strong>Cliente:</strong> ${clienteName}</p>
          <p><strong>Data:</strong> ${saleDate || new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Valor Total:</strong> R$ ${totalValue.toFixed(2)}</p>
          
          <h3>Itens Vendidos:</h3>
          <ul>
            ${itemsList}
          </ul>
        `,
        'Notificação automática de nova venda'
      );

      const result = await sendEmail(to, subject, content);

      return sendResponse(res, 200, {
        data: result,
        message: 'Notificação de venda enviada com sucesso'
      });

    } catch (err) {
      console.error('Erro ao enviar notificação de venda:', err);
      
      if (err instanceof ZodError) {
        const errors = err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        return sendError(res, 400, errors);
      }
      
      // Verificar se é erro de configuração de email
      if (err.message.includes('Invalid login') || err.message.includes('Authentication')) {
        return sendError(res, 500, `Erro de configuração de email: Credenciais inválidas. Verifique as configurações EMAIL_USER e EMAIL_PASS no arquivo .env`);
      }
      
      return sendError(res, 500, `Erro interno do servidor ao enviar notificação: ${err.message}`);
    }
  }


}

export default EmailController;