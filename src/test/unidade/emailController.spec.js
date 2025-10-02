import request from 'supertest';
import express from 'express';
import emailController from '../../controllers/emailController.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { sendError, sendResponse } from '../../utils/messages.js';
import { ZodError } from 'zod';

jest.mock('../../utils/sendEmail.js');
jest.mock('../../utils/messages.js');

const app = express();
app.use(express.json());
app.post('/send', emailController.sendEmail);
app.post('/sale-notification', emailController.saleNotification);

describe('emailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should return 200 and success message on successful email send', async () => {
      const mockEmailData = {
        to: 'cliente@teste.com',
        subject: 'Teste',
        message: 'Mensagem de teste'
      };

      sendEmail.mockResolvedValue({ success: true, messageId: 'mock-id' });
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/send')
        .send(mockEmailData);

      expect(response.status).toBe(200);
      expect(sendEmail).toHaveBeenCalledWith(mockEmailData);
    });

    it('should return 400 for validation errors', async () => {
      const zodError = new ZodError([
        { path: ['to'], message: 'Email inválido' }
      ]);

      sendError.mockImplementation((res, status, errors) => 
        res.status(status).json({ error: true, errors })
      );

      const response = await request(app)
        .post('/send')
        .send({ to: 'invalid-email', subject: '', message: '' });

      expect(response.status).toBe(400);
    });

    it('should return 500 for email service error', async () => {
      sendEmail.mockRejectedValue(new Error('Email service error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/send')
        .send({
          to: 'cliente@teste.com',
          subject: 'Teste',
          message: 'Mensagem de teste'
        });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });

  describe('saleNotification', () => {
    it('should return 200 and success message on successful sale notification', async () => {
      const mockSaleData = {
        customerEmail: 'cliente@teste.com',
        customerName: 'João Silva',
        saleId: 1,
        items: [
          { nome: 'Camisa', quantidade: 2, preco: 50.00 }
        ],
        total: 100.00
      };

      sendEmail.mockResolvedValue({ success: true, messageId: 'mock-id' });
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/sale-notification')
        .send(mockSaleData);

      expect(response.status).toBe(200);
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      const zodError = new ZodError([
        { path: ['customerEmail'], message: 'Email inválido' }
      ]);

      sendError.mockImplementation((res, status, errors) => 
        res.status(status).json({ error: true, errors })
      );

      const response = await request(app)
        .post('/sale-notification')
        .send({ customerEmail: 'invalid-email' });

      expect(response.status).toBe(400);
    });

    it('should return 500 for email service error', async () => {
      sendEmail.mockRejectedValue(new Error('Email service error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/sale-notification')
        .send({
          customerEmail: 'cliente@teste.com',
          customerName: 'João Silva',
          saleId: 1,
          items: [],
          total: 0
        });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });

  describe('emailController direct method testing', () => {
    let req, res;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });

    test('should handle sendEmail method directly', async () => {
      req.body = {
        to: 'teste@email.com',
        subject: 'Assunto Teste',
        message: 'Mensagem de teste'
      };

      sendEmail.mockResolvedValue({ success: true });
      sendResponse.mockImplementation((res, status, data) => {
        res.status(status).json(data);
      });

      await emailController.sendEmail(req, res);

      expect(sendEmail).toHaveBeenCalledWith(req.body);
    });

    test('should handle saleNotification method directly', async () => {
      req.body = {
        customerEmail: 'cliente@teste.com',
        customerName: 'João Silva',
        saleId: 1,
        items: [{ nome: 'Produto', quantidade: 1, preco: 50 }],
        total: 50
      };

      sendEmail.mockResolvedValue({ success: true });
      sendResponse.mockImplementation((res, status, data) => {
        res.status(status).json(data);
      });

      await emailController.saleNotification(req, res);

      expect(sendEmail).toHaveBeenCalled();
    });

    test('should return error 500 if unknown error occurs in sendEmail', async () => {
      req.body = {
        to: 'teste@email.com',
        subject: 'Assunto Teste',
        message: 'Mensagem de teste'
      };

      sendEmail.mockRejectedValue(new Error('Unknown error'));
      sendError.mockImplementation((res, status, message) => {
        res.status(status).json({ error: message });
      });

      await emailController.sendEmail(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });
});