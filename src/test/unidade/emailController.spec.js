import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import EmailController from '../../controllers/emailController.js';
import { sendEmail, createEmailTemplate } from '../../utils/sendEmail.js';
import { sendError, sendResponse } from '../../utils/messages.js';
import { simpleEmailSchema, saleNotificationSchema } from '../../validators/emailValidators.js';
import { ZodError } from 'zod';
import { APIError } from '../../utils/wrapException.js';

// Mock dos módulos
jest.mock('../../utils/sendEmail.js');
jest.mock('../../utils/messages.js');
jest.mock('../../validators/emailValidators.js');

describe('EmailController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    
    // Mock do console.error para evitar logs nos testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('sendSimpleEmail', () => {
    test('should send simple email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Teste',
        message: 'Mensagem de teste',
        isHtml: false
      };
      const emailResult = { messageId: '123', accepted: ['test@example.com'] };

      req.body = emailData;
      simpleEmailSchema.parse = jest.fn().mockReturnValue(emailData);
      createEmailTemplate.mockReturnValue('<html>Template</html>');
      sendEmail.mockResolvedValue(emailResult);

      await EmailController.sendSimpleEmail(req, res);

      expect(simpleEmailSchema.parse).toHaveBeenCalledWith(emailData);
      expect(createEmailTemplate).toHaveBeenCalledWith('Teste', '<p>Mensagem de teste</p>');
      expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Teste', '<html>Template</html>');
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: emailResult,
        message: 'Email enviado com sucesso'
      });
    });

    test('should send HTML email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Teste',
        message: '<h1>Mensagem HTML</h1>',
        isHtml: true
      };
      const emailResult = { messageId: '123', accepted: ['test@example.com'] };

      req.body = emailData;
      simpleEmailSchema.parse = jest.fn().mockReturnValue(emailData);
      sendEmail.mockResolvedValue(emailResult);

      await EmailController.sendSimpleEmail(req, res);

      expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Teste', '<h1>Mensagem HTML</h1>');
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: emailResult,
        message: 'Email enviado com sucesso'
      });
    });

    test('should handle validation errors', async () => {
      const zodError = new ZodError([{
        path: ['to'],
        message: 'Email inválido'
      }]);

      req.body = { to: 'invalid-email' };
      simpleEmailSchema.parse = jest.fn().mockImplementation(() => {
        throw zodError;
      });

      await EmailController.sendSimpleEmail(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        path: 'to',
        message: 'Email inválido'
      }]);
    });

    test('should handle API errors', async () => {
      const apiError = new APIError('Email configuration error', 500);
      req.body = { to: 'test@example.com', subject: 'Test', message: 'Test' };

      simpleEmailSchema.parse = jest.fn().mockReturnValue(req.body);
      sendEmail.mockRejectedValue(apiError);

      await EmailController.sendSimpleEmail(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, apiError.errors);
    });

    test('should handle authentication errors', async () => {
      const authError = new Error('Invalid login credentials');
      req.body = { to: 'test@example.com', subject: 'Test', message: 'Test' };

      simpleEmailSchema.parse = jest.fn().mockReturnValue(req.body);
      sendEmail.mockRejectedValue(authError);

      await EmailController.sendSimpleEmail(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 
        'Erro de configuração de email: Credenciais inválidas. Verifique as configurações EMAIL_USER e EMAIL_PASS no arquivo .env'
      );
    });

    test('should handle generic errors', async () => {
      const genericError = new Error('Generic error');
      req.body = { to: 'test@example.com', subject: 'Test', message: 'Test' };

      simpleEmailSchema.parse = jest.fn().mockReturnValue(req.body);
      sendEmail.mockRejectedValue(genericError);

      await EmailController.sendSimpleEmail(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 
        'Erro interno do servidor ao enviar email: Generic error'
      );
    });
  });

  describe('sendSaleNotification', () => {
    test('should send sale notification successfully', async () => {
      const saleData = {
        to: 'customer@example.com',
        clienteName: 'João Silva',
        totalValue: 500.00,
        items: [{ nome: 'Produto A', quantidade: 2, preco: 250.00 }]
      };
      const emailResult = { messageId: '456', accepted: ['customer@example.com'] };

      req.body = saleData;
      saleNotificationSchema.parse = jest.fn().mockReturnValue(saleData);
      createEmailTemplate.mockReturnValue('<html>Sale Template</html>');
      sendEmail.mockResolvedValue(emailResult);

      await EmailController.sendSaleNotification(req, res);

      expect(saleNotificationSchema.parse).toHaveBeenCalledWith(saleData);
      expect(sendEmail).toHaveBeenCalledWith(
        'customer@example.com',
        'Nova Venda Realizada - João Silva',
        '<html>Sale Template</html>'
      );
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: emailResult,
        message: 'Notificação de venda enviada com sucesso'
      });
    });

    test('should handle validation errors in sale notification', async () => {
      const zodError = new ZodError([{
        path: ['customerEmail'],
        message: 'Email inválido'
      }]);

      req.body = { customerEmail: 'invalid-email' };
      saleNotificationSchema.parse = jest.fn().mockImplementation(() => {
        throw zodError;
      });

      await EmailController.sendSaleNotification(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        path: 'customerEmail',
        message: 'Email inválido'
      }]);
    });

    test('should handle service errors in sale notification', async () => {
      const error = new Error('Email service error');
      const validData = {
        to: 'customer@example.com',
        clienteName: 'João Silva',
        totalValue: 500.00,
        items: [{ nome: 'Produto A', quantidade: 2, preco: 250.00 }]
      };
      req.body = validData;

      saleNotificationSchema.parse = jest.fn().mockReturnValue(validData);
      sendEmail.mockRejectedValue(error);

      await EmailController.sendSaleNotification(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 
        'Erro interno do servidor ao enviar notificação: Email service error'
      );
    });

    test('should handle email configuration errors in sale notification (line 110)', async () => {
      const authError = new Error('Invalid login credentials');
      const validData = {
        to: 'customer@example.com',
        clienteName: 'João Silva',
        totalValue: 500.00,
        items: [{ nome: 'Produto A', quantidade: 2, preco: 250.00 }]
      };
      req.body = validData;

      saleNotificationSchema.parse = jest.fn().mockReturnValue(validData);
      sendEmail.mockRejectedValue(authError);

      await EmailController.sendSaleNotification(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 
        'Erro de configuração de email: Credenciais inválidas. Verifique as configurações EMAIL_USER e EMAIL_PASS no arquivo .env'
      );
    });
  });
});
