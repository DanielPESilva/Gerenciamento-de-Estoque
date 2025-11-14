import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import UsuariosService from '../../services/usuariosService.js';
import UsuariosRepository from '../../repository/usuariosRepository.js';

jest.mock('../../repository/usuariosRepository.js');

describe('UsuariosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsuarios', () => {
    test('should return all users with filters and pagination', async () => {
      const filters = { nome: 'João' };
      const pagination = { page: 1, limit: 10 };
      const mockResult = {
        data: [{ id: 1, nome: 'João Silva', email: 'joao@test.com' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      UsuariosRepository.findAll.mockResolvedValue(mockResult);

      const result = await UsuariosService.getAllUsuarios(filters, pagination);

      expect(UsuariosRepository.findAll).toHaveBeenCalledWith(filters, pagination);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUsuarioById', () => {
    test('should return user by id', async () => {
      const userId = 1;
      const mockUser = { id: 1, nome: 'João Silva', email: 'joao@test.com' };

      UsuariosRepository.findById.mockResolvedValue(mockUser);

      const result = await UsuariosService.getUsuarioById(userId);

      expect(UsuariosRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUsuario', () => {
    test('should create a new user', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@test.com',
        senha: 'password123'
      };
      const mockUser = { id: 1, ...userData };

      UsuariosRepository.create.mockResolvedValue(mockUser);

      const result = await UsuariosService.createUsuario(userData);

      expect(UsuariosRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUsuario', () => {
    test('should update existing user', async () => {
      const userId = 1;
      const updateData = { nome: 'João Silva Updated' };
      const mockUpdatedUser = { id: 1, nome: 'João Silva Updated', email: 'joao@test.com' };

      UsuariosRepository.update.mockResolvedValue(mockUpdatedUser);

      const result = await UsuariosService.updateUsuario(userId, updateData);

      expect(UsuariosRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUsuario', () => {
    test('should delete existing user', async () => {
      const userId = 1;
      const mockDeletedUser = { id: 1, nome: 'João Silva', email: 'joao@test.com' };

      UsuariosRepository.delete.mockResolvedValue(mockDeletedUser);

      const result = await UsuariosService.deleteUsuario(userId);

      expect(UsuariosRepository.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDeletedUser);
    });
  });
});