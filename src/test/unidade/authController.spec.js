import request from 'supertest';
import express from 'express';
import authController from '../../controllers/authController.js';
import authService from '../../services/authService.js';
import { sendError, sendResponse } from '../../utils/messages.js';
import { ZodError } from 'zod';

jest.mock('../../services/authService.js');
jest.mock('../../utils/messages.js');

const app = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/forgot-password', authController.forgotPassword);
app.post('/reset-password', authController.resetPassword);
app.post('/refresh-token', authController.refreshToken);

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 201 and user data on successful registration', async () => {
      const mockUser = { 
        user: { id: 1, nome: 'João Silva', email: 'joao@test.com' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token'
      };
      
      authService.register.mockResolvedValue(mockUser);
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/register')
        .send({ nome: 'João Silva', email: 'joao@test.com', senha: '123456' });

      expect(response.status).toBe(201);
      expect(authService.register).toHaveBeenCalledWith({ 
        nome: 'João Silva', 
        email: 'joao@test.com', 
        senha: '123456' 
      });
    });

    it('should return 400 for validation errors', async () => {
      const zodError = new ZodError([
        { path: ['email'], message: 'Email inválido' }
      ]);
      
      sendError.mockImplementation((res, status, errors) => 
        res.status(status).json({ error: true, errors })
      );

      // Mock do parse para lançar erro de validação
      jest.doMock('../../validators/authValidators.js', () => ({
        default: {
          register: {
            parse: jest.fn().mockImplementation(() => {
              throw zodError;
            })
          }
        }
      }));

      const response = await request(app)
        .post('/register')
        .send({ nome: '', email: 'invalid-email', senha: '123' });

      expect(response.status).toBe(400);
      expect(sendError).toHaveBeenCalled();
    });

    it('should return 500 for internal server error', async () => {
      authService.register.mockRejectedValue(new Error('Internal server error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/register')
        .send({ nome: 'João Silva', email: 'joao@test.com', senha: '123456' });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });

  describe('login', () => {
    it('should return 200 and user data on successful login', async () => {
      const mockUser = { 
        user: { id: 1, nome: 'João Silva', email: 'joao@test.com' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token'
      };
      
      authService.login.mockResolvedValue(mockUser);
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/login')
        .send({ email: 'joao@test.com', senha: '123456' });

      expect(response.status).toBe(200);
      expect(authService.login).toHaveBeenCalledWith({ 
        email: 'joao@test.com', 
        senha: '123456' 
      });
    });

    it('should return 400 for invalid credentials', async () => {
      const apiError = new Error('Credenciais inválidas');
      apiError.statusCode = 400;
      apiError.errors = ['Email ou senha incorretos'];
      
      authService.login.mockRejectedValue(apiError);
      sendError.mockImplementation((res, status, errors) => 
        res.status(status).json({ error: true, errors })
      );

      const response = await request(app)
        .post('/login')
        .send({ email: 'joao@test.com', senha: 'wrong-password' });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalled();
    });

    it('should return 500 for internal server error', async () => {
      authService.login.mockRejectedValue(new Error('Internal server error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/login')
        .send({ email: 'joao@test.com', senha: '123456' });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });

  describe('forgotPassword', () => {
    it('should return 200 on successful forgot password request', async () => {
      const mockResponse = { message: 'Email de recuperação enviado' };
      
      authService.forgotPassword.mockResolvedValue(mockResponse);
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/forgot-password')
        .send({ email: 'joao@test.com' });

      expect(response.status).toBe(200);
      expect(authService.forgotPassword).toHaveBeenCalledWith({ 
        email: 'joao@test.com' 
      });
    });

    it('should return 500 for internal server error', async () => {
      authService.forgotPassword.mockRejectedValue(new Error('Internal server error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/forgot-password')
        .send({ email: 'joao@test.com' });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });

  describe('resetPassword', () => {
    it('should return 200 on successful password reset', async () => {
      const mockResponse = { message: 'Senha alterada com sucesso' };
      
      authService.resetPassword.mockResolvedValue(mockResponse);
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/reset-password')
        .send({ 
          email: 'joao@test.com', 
          code: '123456', 
          senha: 'newPassword123' 
        });

      expect(response.status).toBe(200);
      expect(authService.resetPassword).toHaveBeenCalledWith({ 
        email: 'joao@test.com', 
        code: '123456', 
        senha: 'newPassword123' 
      });
    });

    it('should return 500 for internal server error', async () => {
      authService.resetPassword.mockRejectedValue(new Error('Internal server error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/reset-password')
        .send({ 
          email: 'joao@test.com', 
          code: '123456', 
          senha: 'newPassword123' 
        });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });

  describe('refreshToken', () => {
    it('should return 200 and new tokens on successful refresh', async () => {
      const mockTokens = { 
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };
      
      authService.refreshToken.mockResolvedValue(mockTokens);
      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const response = await request(app)
        .post('/refresh-token')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(authService.refreshToken).toHaveBeenCalledWith({ 
        refreshToken: 'valid-refresh-token' 
      });
    });

    it('should return 500 for internal server error', async () => {
      authService.refreshToken.mockRejectedValue(new Error('Internal server error'));
      sendError.mockImplementation((res, status, message) => 
        res.status(status).json({ error: message })
      );

      const response = await request(app)
        .post('/refresh-token')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(500);
      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');
    });
  });
});