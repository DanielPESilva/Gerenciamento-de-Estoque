import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import { sendResponse, sendError } from '../../utils/messages.js';

describe('messages', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('sendResponse', () => {
    test('should send success response with data', () => {
      const data = { message: 'Success', data: { id: 1, name: 'Test' } };
      
      sendResponse(res, 200, data);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...data
      });
    });

    test('should send response with different status code', () => {
      const data = { message: 'Created', data: { id: 2, name: 'New Item' } };
      
      sendResponse(res, 201, data);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...data
      });
    });

    test('should handle empty data', () => {
      sendResponse(res, 200, {});
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true
      });
    });
  });

  describe('sendError', () => {
    test('should send error response with message string', () => {
      const errorMessage = 'Something went wrong';
      
      sendError(res, 400, errorMessage);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });

    test('should send error response with errors array', () => {
      const errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 6 characters' }
      ];
      
      sendError(res, 422, errors);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: errors
      });
    });

    test('should handle different error status codes', () => {
      const errorMessage = 'Not found';
      
      sendError(res, 404, errorMessage);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });

    test('should handle server errors', () => {
      const errorMessage = 'Internal server error';
      
      sendError(res, 500, errorMessage);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });

    test('should handle empty error message', () => {
      sendError(res, 400, '');
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: ''
      });
    });
  });
});