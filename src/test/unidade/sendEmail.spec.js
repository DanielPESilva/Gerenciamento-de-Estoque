import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import nodemailer from 'nodemailer';
import { sendEmail, createEmailTemplate } from '../../utils/sendEmail.js';

// Mock do nodemailer
jest.mock('nodemailer');

describe('sendEmail Utils', () => {
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    mockSendMail = jest.fn();
    mockTransporter = {
      sendMail: mockSendMail
    };
    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);
    
    // Mock environment variables
    process.env.EMAIL_USER = 'test@email.com';
    process.env.EMAIL_PASS = 'testpass';
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('sendEmail', () => {
    test('should send email successfully', async () => {
      const email = 'recipient@test.com';
      const subject = 'Test Subject';
      const message = '<h1>Test Message</h1>';

      mockSendMail.mockResolvedValueOnce();

      const result = await sendEmail(email, subject, message);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@email.com',
          pass: 'testpass'
        }
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@email.com',
        to: email,
        subject: subject,
        html: message
      });

      expect(result).toEqual({
        success: true,
        message: 'Email enviado com sucesso'
      });
    });

    test('should use fallback environment variables', async () => {
      // Clear primary env vars
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
      
      // Set fallback env vars
      process.env.HOST = 'fallback@test.com';
      process.env.PASS = 'fallbackpass';

      const email = 'recipient@test.com';
      const subject = 'Test Subject';
      const message = 'Test Message';

      mockSendMail.mockResolvedValueOnce();

      await sendEmail(email, subject, message);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'fallback@test.com',
          pass: 'fallbackpass'
        }
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'fallback@test.com',
        to: email,
        subject: subject,
        html: message
      });
    });

    test('should handle email sending error', async () => {
      const email = 'recipient@test.com';
      const subject = 'Test Subject';
      const message = 'Test Message';

      const errorMessage = 'SMTP connection failed';
      mockSendMail.mockRejectedValueOnce(new Error(errorMessage));

      await expect(sendEmail(email, subject, message)).rejects.toThrow(`Falha no envio do email: ${errorMessage}`);
      
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@email.com',
        to: email,
        subject: subject,
        html: message
      });
    });

    test('should log error when sending fails', async () => {
      const email = 'recipient@test.com';
      const subject = 'Test Subject';
      const message = 'Test Message';

      console.error = jest.fn();
      const error = new Error('Network error');
      mockSendMail.mockRejectedValueOnce(error);

      try {
        await sendEmail(email, subject, message);
      } catch (e) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith('Erro ao enviar email:', error);
    });
  });

  describe('createEmailTemplate', () => {
    test('should create basic email template with all parameters', () => {
      const title = 'Test Title';
      const content = '<p>Test content</p>';
      const footerText = 'Test footer';

      const result = createEmailTemplate(title, content, footerText);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html lang="pt-BR">');
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain(title);
      expect(result).toContain(content);
      expect(result).toContain(footerText);
    });

    test('should create email template with default footer', () => {
      const title = 'Test Title';
      const content = '<p>Test content</p>';

      const result = createEmailTemplate(title, content);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html lang="pt-BR">');
      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain(title);
      expect(result).toContain(content);
      // Should have empty footer by default
      expect(result).toContain('');
    });

    test('should handle empty parameters', () => {
      const result = createEmailTemplate('', '');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html lang="pt-BR">');
      expect(result).toContain('<meta charset="UTF-8">');
    });

    test('should handle HTML content properly', () => {
      const title = 'HTML Test';
      const content = '<div><h2>HTML Content</h2><p>With <strong>formatting</strong></p></div>';
      const footerText = '<small>HTML Footer</small>';

      const result = createEmailTemplate(title, content, footerText);

      expect(result).toContain(title);
      expect(result).toContain('<div><h2>HTML Content</h2><p>With <strong>formatting</strong></p></div>');
      expect(result).toContain('<small>HTML Footer</small>');
    });
  });
});