import { describe, expect, test } from '@jest/globals';
import { wrapException, APIError } from '../../utils/wrapException.js';

describe('wrapException', () => {
  describe('APIError', () => {
    test('should create APIError with message and status code', () => {
      const message = 'Test error message';
      const statusCode = 400;
      
      const error = new APIError(message, statusCode);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.errors).toEqual([message]);
    });

    test('should create APIError with array of messages', () => {
      const messages = ['Error 1', 'Error 2', 'Error 3'];
      const statusCode = 422;
      
      const error = new APIError(messages, statusCode);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(messages[0]);
      expect(error.statusCode).toBe(statusCode);
      expect(error.errors).toEqual(messages);
    });

    test('should use default status code 500', () => {
      const message = 'Internal error';
      
      const error = new APIError(message);
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe(message);
      expect(error.errors).toEqual([message]);
    });

    test('should handle empty message', () => {
      const error = new APIError('');
      
      expect(error.message).toBe('');
      expect(error.statusCode).toBe(500);
      expect(error.errors).toEqual(['']);
    });

    test('should handle empty array', () => {
      const error = new APIError([]);
      
      expect(error.message).toBe('');
      expect(error.statusCode).toBe(500);
      expect(error.errors).toEqual([]);
    });
  });

  describe('wrapException', () => {
    test('should wrap async function and handle success', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue('success');
      const mockReq = { body: { test: 'data' } };
      const mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      
      const wrappedFn = wrapException(mockAsyncFn);
      await wrappedFn(mockReq, mockRes);
      
      expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes);
    });

    test('should wrap async function and handle APIError', async () => {
      const apiError = new APIError('Custom API Error', 400);
      const mockAsyncFn = jest.fn().mockRejectedValue(apiError);
      const mockReq = { body: { test: 'data' } };
      const mockRes = { 
        json: jest.fn(), 
        status: jest.fn().mockReturnThis() 
      };
      
      const wrappedFn = wrapException(mockAsyncFn);
      await wrappedFn(mockReq, mockRes);
      
      expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Custom API Error']
      });
    });

    test('should wrap async function and handle generic error', async () => {
      const genericError = new Error('Generic error');
      const mockAsyncFn = jest.fn().mockRejectedValue(genericError);
      const mockReq = { body: { test: 'data' } };
      const mockRes = { 
        json: jest.fn(), 
        status: jest.fn().mockReturnThis() 
      };
      
      const wrappedFn = wrapException(mockAsyncFn);
      await wrappedFn(mockReq, mockRes);
      
      expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Generic error'
      });
    });

    test('should handle non-Error objects', async () => {
      const mockAsyncFn = jest.fn().mockRejectedValue('String error');
      const mockReq = { body: { test: 'data' } };
      const mockRes = { 
        json: jest.fn(), 
        status: jest.fn().mockReturnThis() 
      };
      
      const wrappedFn = wrapException(mockAsyncFn);
      await wrappedFn(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'String error'
      });
    });
  });
});