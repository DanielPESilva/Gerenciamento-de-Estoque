import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import AuthServices from '../../services/authService.js';
import UsuariosRepository from '../../repository/usuariosRepository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/sendEmail.js';
import { APIError } from '../../utils/wrapException.js';

jest.mock('../../repository/usuariosRepository.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/sendEmail.js');

describe('AuthServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    test('should generate access and refresh tokens', () => {
      const userId = 1;
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      jwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = AuthServices.generateTokens(userId);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      });

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };

      const hashedPassword = 'hashed-password';
      const newUser = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: hashedPassword
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      UsuariosRepository.getByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      UsuariosRepository.create.mockResolvedValue(newUser);
      jwt.sign
        .mockReturnValueOnce(tokens.accessToken)
        .mockReturnValueOnce(tokens.refreshToken);

      const result = await AuthServices.register(userData);

      expect(result).toEqual({
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email
        },
        ...tokens
      });

      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.senha, 10);
      expect(UsuariosRepository.create).toHaveBeenCalledWith({
        nome: userData.nome,
        email: userData.email,
        senha: hashedPassword
      });
    });

    test('should throw error if user already exists', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };

      const existingUser = { id: 1, email: 'joao@teste.com' };
      UsuariosRepository.getByEmail.mockResolvedValue(existingUser);

      await expect(AuthServices.register(userData)).rejects.toThrow(APIError);
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(UsuariosRepository.create).not.toHaveBeenCalled();
    });

    test('should handle database error during registration', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };

      UsuariosRepository.getByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      UsuariosRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(AuthServices.register(userData)).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    test('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'joao@teste.com',
        senha: '123456'
      };

      const user = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'hashed-password'
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      UsuariosRepository.getByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce(tokens.accessToken)
        .mockReturnValueOnce(tokens.refreshToken);

      const result = await AuthServices.login(loginData);

      expect(result).toEqual({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email
        },
        ...tokens
      });

      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.senha, user.senha);
    });

    test('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'inexistente@teste.com',
        senha: '123456'
      };

      UsuariosRepository.getByEmail.mockResolvedValue(null);

      await expect(AuthServices.login(loginData)).rejects.toThrow(APIError);
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('should throw error for invalid password', async () => {
      const loginData = {
        email: 'joao@teste.com',
        senha: 'senha-errada'
      };

      const user = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: 'hashed-password'
      };

      UsuariosRepository.getByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await expect(AuthServices.login(loginData)).rejects.toThrow(APIError);
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.senha, user.senha);
    });
  });

  describe('forgotPassword', () => {
    test('should send reset email successfully', async () => {
      const email = 'joao@teste.com';
      const user = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com'
      };

      const resetCode = '123456';
      const mockCrypto = {
        randomBytes: jest.fn().mockReturnValue({
          toString: jest.fn().mockReturnValue(resetCode)
        })
      };

      UsuariosRepository.getByEmail.mockResolvedValue(user);
      UsuariosRepository.update.mockResolvedValue(true);
      sendEmail.mockResolvedValue({ success: true });

      // Mock crypto.randomInt
      const originalRandomInt = crypto.randomInt;
      crypto.randomInt = jest.fn().mockReturnValue(123456);

      const result = await AuthServices.forgotPassword(email);

      expect(result).toEqual({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });

      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(email);
      expect(UsuariosRepository.update).toHaveBeenCalledWith(user.id, expect.objectContaining({
        reset_code: expect.any(String),
        reset_code_expires: expect.any(Date)
      }));
      expect(sendEmail).toHaveBeenCalled();
    });

    test('should return message even for non-existent user', async () => {
      const email = 'inexistente@teste.com';

      UsuariosRepository.getByEmail.mockResolvedValue(null);

      const result = await AuthServices.forgotPassword(email);

      expect(result).toEqual({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(email);
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully with valid code', async () => {
      const email = 'joao@teste.com';
      const code = '123456';
      const novaSenha = 'novaSenha123';

      const user = {
        id: 1,
        email: 'joao@teste.com',
        reset_code: '123456',
        reset_code_expires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      };

      const hashedPassword = 'new-hashed-password';

      UsuariosRepository.getByEmail.mockResolvedValue(user);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      UsuariosRepository.update.mockResolvedValue(true);

      const result = await AuthServices.resetPassword(email, code, novaSenha);

      expect(result).toEqual({
        message: 'Senha redefinida com sucesso'
      });

      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(novaSenha, 10);
      expect(UsuariosRepository.update).toHaveBeenCalledWith(user.id, expect.objectContaining({
        senha: hashedPassword,
        reset_code: null,
        reset_code_expires: null
      }));
    });

    test('should throw error for invalid or expired code', async () => {
      const email = 'joao@teste.com';
      const code = '123456';
      const novaSenha = 'novaSenha123';

      UsuariosRepository.getByEmail.mockResolvedValue(null);

      await expect(AuthServices.resetPassword(email, code, novaSenha)).rejects.toThrow(APIError);
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(UsuariosRepository.update).not.toHaveBeenCalled();
    });

    test('should throw error for expired code', async () => {
      const email = 'joao@teste.com';
      const code = '123456';
      const novaSenha = 'novaSenha123';

      const user = {
        id: 1,
        email: 'joao@teste.com',
        reset_code: '123456',
        reset_code_expires: new Date(Date.now() - 10 * 60 * 1000) // expired 10 minutes ago
      };

      UsuariosRepository.getByEmail.mockResolvedValue(user);

      await expect(AuthServices.resetPassword(email, code, novaSenha)).rejects.toThrow(APIError);
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(email);
    });

    test('should throw error for wrong code', async () => {
      const email = 'joao@teste.com';
      const code = '654321';
      const novaSenha = 'novaSenha123';

      const user = {
        id: 1,
        email: 'joao@teste.com',
        reset_code: '123456',
        reset_code_expires: new Date(Date.now() + 10 * 60 * 1000)
      };

      UsuariosRepository.getByEmail.mockResolvedValue(user);

      await expect(AuthServices.resetPassword(email, code, novaSenha)).rejects.toThrow(APIError);
      
      expect(UsuariosRepository.getByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('refreshToken', () => {
    test('should refresh tokens successfully with valid refresh token', async () => {
      const refreshTokenData = {
        refreshToken: 'valid-refresh-token'
      };

      const decodedToken = {
        userId: 1,
        type: 'refresh'
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      jwt.verify.mockReturnValue(decodedToken);
      jwt.sign
        .mockReturnValueOnce(newTokens.accessToken)
        .mockReturnValueOnce(newTokens.refreshToken);

      const user = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com'
      };

      UsuariosRepository.getById.mockResolvedValue(user);

      const result = await AuthServices.refreshAccessToken(refreshTokenData.refreshToken);

      expect(result).toEqual(newTokens);

      expect(jwt.verify).toHaveBeenCalledWith(refreshTokenData.refreshToken, process.env.JWT_SECRET);
      expect(UsuariosRepository.getById).toHaveBeenCalledWith(decodedToken.userId);
    });

    test('should throw error for invalid refresh token', async () => {
      const refreshTokenData = {
        refreshToken: 'invalid-refresh-token'
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(AuthServices.refreshAccessToken(refreshTokenData.refreshToken)).rejects.toThrow(APIError);
      
      expect(jwt.verify).toHaveBeenCalledWith(refreshTokenData.refreshToken, process.env.JWT_SECRET);
    });

    test('should throw error for non-refresh token type', async () => {
      const refreshTokenData = {
        refreshToken: 'access-token-not-refresh'
      };

      const decodedToken = {
        userId: 1,
        type: 'access' // Wrong type
      };

      jwt.verify.mockReturnValue(decodedToken);

      await expect(AuthServices.refreshAccessToken(refreshTokenData.refreshToken)).rejects.toThrow(APIError);
    });

    test('should throw error for non-existent user', async () => {
      const refreshToken = 'valid-refresh-token';

      const decodedToken = {
        userId: 999,
        type: 'refresh'
      };

      jwt.verify.mockReturnValue(decodedToken);
      UsuariosRepository.getById.mockResolvedValue(null);

      await expect(AuthServices.refreshAccessToken(refreshToken)).rejects.toThrow(APIError);
      
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_SECRET);
      expect(UsuariosRepository.getById).toHaveBeenCalledWith(decodedToken.userId);
    });
  });
});