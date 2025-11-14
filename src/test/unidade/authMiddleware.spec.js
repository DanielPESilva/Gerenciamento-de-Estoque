import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { sendError } from '../../utils/messages.js';

jest.mock('jsonwebtoken');
jest.mock('../../utils/messages.js');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('should authenticate valid token', () => {
    const token = 'valid-token';
    const decodedToken = { userId: 1, email: 'test@example.com' };

    req.header.mockReturnValue(`Bearer ${token}`);
    jwt.verify.mockReturnValue(decodedToken);

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.userId).toEqual(decodedToken.userId);
    expect(next).toHaveBeenCalled();
  });

  test('should return error when no authorization header', () => {
    req.header.mockReturnValue(null);
    
    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(sendError).toHaveBeenCalledWith(res, 401, 'Token não fornecido ou malformado');
    expect(next).not.toHaveBeenCalled();
  });

  test('should return error when authorization header is malformed', () => {
    req.header.mockReturnValue('InvalidFormat token');

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(sendError).toHaveBeenCalledWith(res, 401, 'Token não fornecido ou malformado');
    expect(next).not.toHaveBeenCalled();
  });

  test('should return error when token is missing after Bearer', () => {
    req.header.mockReturnValue('Bearer ');
    
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(sendError).toHaveBeenCalledWith(res, 401, 'Token inválido ou expirado');
    expect(next).not.toHaveBeenCalled();
  });

  test('should return error when token is invalid', () => {
    const token = 'invalid-token';
    req.header.mockReturnValue(`Bearer ${token}`);
    
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(sendError).toHaveBeenCalledWith(res, 401, 'Token inválido ou expirado');
    expect(next).not.toHaveBeenCalled();
  });

  test('should return error when token is expired', () => {
    const token = 'expired-token';
    req.header.mockReturnValue(`Bearer ${token}`);
    
    const expiredError = new Error('Token expired');
    expiredError.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => {
      throw expiredError;
    });

    authMiddleware(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(sendError).toHaveBeenCalledWith(res, 401, 'Token inválido ou expirado');
    expect(next).not.toHaveBeenCalled();
  });
});