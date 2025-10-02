import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import AuthController from '../../controllers/authController.js';
import AuthServices from '../../services/authService.js';
import AuthSchema from '../../validators/authValidators.js';
import { sendResponse, sendError } from '../../utils/messages.js';
import { ZodError } from 'zod';
import { APIError } from '../../utils/wrapException.js';

// Mock dos módulos
jest.mock('../../services/authService.js');
jest.mock('../../validators/authValidators.js');
jest.mock('../../utils/messages.js');

describe('AuthController', () => {
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
  });

  describe('register', () => {
    test('should register user successfully', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };
      const serviceResponse = {
        usuario: { id: 1, nome: 'João Silva', email: 'joao@teste.com' },
        token: 'jwt-token',
        refreshToken: 'refresh-token'
      };

      req.body = userData;
      AuthSchema.register = { parse: jest.fn().mockReturnValue(userData) };
      AuthServices.register.mockResolvedValue(serviceResponse);

      await AuthController.register(req, res);

      expect(AuthSchema.register.parse).toHaveBeenCalledWith(userData);
      expect(AuthServices.register).toHaveBeenCalledWith(userData);
      expect(sendResponse).toHaveBeenCalledWith(res, 201, {
        data: serviceResponse,
        message: "Usuário registrado com sucesso!"
      });
    });

    test('should handle validation errors', async () => {
      const invalidData = { email: 'invalid-email' };
      const zodError = new ZodError([
        {
          path: ['email'],
          message: 'Email inválido'
        }
      ]);

      req.body = invalidData;
      AuthSchema.register = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await AuthController.register(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { path: 'email', message: 'Email inválido' }
      ]);
    });

    test('should handle API errors', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };
      const apiError = new APIError('Email já existe', 400);

      req.body = userData;
      AuthSchema.register = { parse: jest.fn().mockReturnValue(userData) };
      AuthServices.register.mockRejectedValue(apiError);

      await AuthController.register(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, 'Email já existe');
    });

    test('should handle generic errors', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };

      req.body = userData;
      AuthSchema.register = { parse: jest.fn().mockReturnValue(userData) };
      AuthServices.register.mockRejectedValue(new Error('Database error'));

      await AuthController.register(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'joao@teste.com',
        senha: '123456'
      };
      const serviceResponse = {
        usuario: { id: 1, nome: 'João Silva', email: 'joao@teste.com' },
        token: 'jwt-token',
        refreshToken: 'refresh-token'
      };

      req.body = loginData;
      AuthSchema.login = { parse: jest.fn().mockReturnValue(loginData) };
      AuthServices.login.mockResolvedValue(serviceResponse);

      await AuthController.login(req, res);

      expect(AuthSchema.login.parse).toHaveBeenCalledWith(loginData);
      expect(AuthServices.login).toHaveBeenCalledWith(loginData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: serviceResponse });
    });

    test('should handle validation errors', async () => {
      const invalidData = { email: '' };
      const zodError = new ZodError([
        {
          path: ['email'],
          message: 'Email é obrigatório'
        }
      ]);

      req.body = invalidData;
      AuthSchema.login = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await AuthController.login(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { path: 'email', message: 'Email é obrigatório' }
      ]);
    });

    test('should handle API errors', async () => {
      const loginData = {
        email: 'joao@teste.com',
        senha: '123456'
      };
      const apiError = new APIError('Credenciais inválidas', 401);

      req.body = loginData;
      AuthSchema.login = { parse: jest.fn().mockReturnValue(loginData) };
      AuthServices.login.mockRejectedValue(apiError);

      await AuthController.login(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 401, 'Credenciais inválidas');
    });

    test('should handle generic errors', async () => {
      const loginData = {
        email: 'joao@teste.com',
        senha: '123456'
      };

      req.body = loginData;
      AuthSchema.login = { parse: jest.fn().mockReturnValue(loginData) };
      AuthServices.login.mockRejectedValue(new Error('Database error'));

      await AuthController.login(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('forgotPassword', () => {
    test('should handle forgot password successfully', async () => {
      const emailData = { email: 'joao@teste.com' };
      const serviceResponse = { message: 'Email de recuperação enviado' };

      req.body = emailData;
      AuthSchema.forgotPassword = { parse: jest.fn().mockReturnValue(emailData) };
      AuthServices.forgotPassword.mockResolvedValue(serviceResponse);

      await AuthController.forgotPassword(req, res);

      expect(AuthSchema.forgotPassword.parse).toHaveBeenCalledWith(emailData);
      expect(AuthServices.forgotPassword).toHaveBeenCalledWith('joao@teste.com');
      expect(sendResponse).toHaveBeenCalledWith(res, 200, serviceResponse);
    });

    test('should handle validation errors', async () => {
      const invalidData = { email: 'invalid-email' };
      const zodError = new ZodError([
        {
          path: ['email'],
          message: 'Email inválido'
        }
      ]);

      req.body = invalidData;
      AuthSchema.forgotPassword = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await AuthController.forgotPassword(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { path: 'email', message: 'Email inválido' }
      ]);
    });

    test('should handle API errors', async () => {
      const emailData = { email: 'joao@teste.com' };
      const apiError = new APIError('Email não encontrado', 404);

      req.body = emailData;
      AuthSchema.forgotPassword = { parse: jest.fn().mockReturnValue(emailData) };
      AuthServices.forgotPassword.mockRejectedValue(apiError);

      await AuthController.forgotPassword(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, 'Email não encontrado');
    });

    test('should handle generic errors', async () => {
      const emailData = { email: 'joao@teste.com' };

      req.body = emailData;
      AuthSchema.forgotPassword = { parse: jest.fn().mockReturnValue(emailData) };
      AuthServices.forgotPassword.mockRejectedValue(new Error('Email service error'));

      await AuthController.forgotPassword(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      const resetData = {
        email: 'joao@teste.com',
        code: '123456',
        senha: 'nova-senha'
      };
      const serviceResponse = { message: 'Senha alterada com sucesso' };

      req.body = resetData;
      AuthSchema.resetPassword = { parse: jest.fn().mockReturnValue(resetData) };
      AuthServices.resetPassword.mockResolvedValue(serviceResponse);

      await AuthController.resetPassword(req, res);

      expect(AuthSchema.resetPassword.parse).toHaveBeenCalledWith(resetData);
      expect(AuthServices.resetPassword).toHaveBeenCalledWith('joao@teste.com', '123456', 'nova-senha');
      expect(sendResponse).toHaveBeenCalledWith(res, 200, serviceResponse);
    });

    test('should handle validation errors', async () => {
      const invalidData = { email: 'joao@teste.com', code: '', senha: '123' };
      const zodError = new ZodError([
        {
          path: ['code'],
          message: 'Código é obrigatório'
        },
        {
          path: ['senha'],
          message: 'Senha deve ter no mínimo 6 caracteres'
        }
      ]);

      req.body = invalidData;
      AuthSchema.resetPassword = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await AuthController.resetPassword(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { path: 'code', message: 'Código é obrigatório' },
        { path: 'senha', message: 'Senha deve ter no mínimo 6 caracteres' }
      ]);
    });

    test('should handle API errors', async () => {
      const resetData = {
        email: 'joao@teste.com',
        code: '123456',
        senha: 'nova-senha'
      };
      const apiError = new APIError('Código inválido ou expirado', 400);

      req.body = resetData;
      AuthSchema.resetPassword = { parse: jest.fn().mockReturnValue(resetData) };
      AuthServices.resetPassword.mockRejectedValue(apiError);

      await AuthController.resetPassword(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, 'Código inválido ou expirado');
    });

    test('should handle generic errors', async () => {
      const resetData = {
        email: 'joao@teste.com',
        code: '123456',
        senha: 'nova-senha'
      };

      req.body = resetData;
      AuthSchema.resetPassword = { parse: jest.fn().mockReturnValue(resetData) };
      AuthServices.resetPassword.mockRejectedValue(new Error('Database error'));

      await AuthController.resetPassword(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('refresh', () => {
    test('should refresh token successfully', async () => {
      const refreshData = { refreshToken: 'valid-refresh-token' };
      const serviceResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token'
      };

      req.body = refreshData;
      AuthSchema.refreshToken = { parse: jest.fn().mockReturnValue(refreshData) };
      AuthServices.refreshAccessToken.mockResolvedValue(serviceResponse);

      await AuthController.refresh(req, res);

      expect(AuthSchema.refreshToken.parse).toHaveBeenCalledWith(refreshData);
      expect(AuthServices.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: serviceResponse });
    });

    test('should handle validation errors', async () => {
      const invalidData = { refreshToken: '' };
      const zodError = new ZodError([
        {
          path: ['refreshToken'],
          message: 'Refresh token é obrigatório'
        }
      ]);

      req.body = invalidData;
      AuthSchema.refreshToken = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await AuthController.refresh(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { path: 'refreshToken', message: 'Refresh token é obrigatório' }
      ]);
    });

    test('should handle API errors', async () => {
      const refreshData = { refreshToken: 'invalid-refresh-token' };
      const apiError = new APIError('Refresh token inválido', 401);

      req.body = refreshData;
      AuthSchema.refreshToken = { parse: jest.fn().mockReturnValue(refreshData) };
      AuthServices.refreshAccessToken.mockRejectedValue(apiError);

      await AuthController.refresh(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 401, 'Refresh token inválido');
    });

    test('should handle generic errors', async () => {
      const refreshData = { refreshToken: 'valid-refresh-token' };

      req.body = refreshData;
      AuthSchema.refreshToken = { parse: jest.fn().mockReturnValue(refreshData) };
      AuthServices.refreshAccessToken.mockRejectedValue(new Error('Token service error'));

      await AuthController.refresh(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });
});
