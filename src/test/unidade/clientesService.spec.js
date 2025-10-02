import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import ClientesService from '../../services/clientesService.js';
import ClientesRepository from '../../repository/clientesRepository.js';

jest.mock('../../repository/clientesRepository.js');

describe('ClientesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllClientes', () => {
    test('should return all clients with filters and pagination', async () => {
      const filters = { nome: 'João' };
      const pagination = { page: 1, limit: 10 };
      const mockResult = {
        data: [{ id: 1, nome: 'João Silva', email: 'joao@test.com' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      ClientesRepository.findAll.mockResolvedValue(mockResult);

      const result = await ClientesService.getAllClientes(filters, pagination);

      expect(ClientesRepository.findAll).toHaveBeenCalledWith(filters, pagination);
      expect(result).toEqual(mockResult);
    });

    test('should handle empty filters and pagination', async () => {
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 }
      };

      ClientesRepository.findAll.mockResolvedValue(mockResult);

      const result = await ClientesService.getAllClientes({}, {});

      expect(ClientesRepository.findAll).toHaveBeenCalledWith({}, {});
      expect(result).toEqual(mockResult);
    });
  });

  describe('getClienteById', () => {
    test('should return client by id', async () => {
      const clientId = 1;
      const mockClient = { id: 1, nome: 'João Silva', email: 'joao@test.com' };

      ClientesRepository.findById.mockResolvedValue(mockClient);

      const result = await ClientesService.getClienteById(clientId);

      expect(ClientesRepository.findById).toHaveBeenCalledWith(clientId);
      expect(result).toEqual(mockClient);
    });

    test('should return null for non-existent client', async () => {
      const clientId = 999;

      ClientesRepository.findById.mockResolvedValue(null);

      const result = await ClientesService.getClienteById(clientId);

      expect(ClientesRepository.findById).toHaveBeenCalledWith(clientId);
      expect(result).toBeNull();
    });
  });

  describe('createCliente', () => {
    test('should create a new client', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@test.com',
        cpf: '123.456.789-00'
      };
      const mockClient = { id: 1, ...clientData };

      ClientesRepository.create.mockResolvedValue(mockClient);

      const result = await ClientesService.createCliente(clientData);

      expect(ClientesRepository.create).toHaveBeenCalledWith(clientData);
      expect(result).toEqual(mockClient);
    });
  });

  describe('updateCliente', () => {
    test('should update existing client', async () => {
      const clientId = 1;
      const updateData = { nome: 'João Silva Updated' };
      const mockUpdatedClient = { id: 1, nome: 'João Silva Updated', email: 'joao@test.com' };

      ClientesRepository.update.mockResolvedValue(mockUpdatedClient);

      const result = await ClientesService.updateCliente(clientId, updateData);

      expect(ClientesRepository.update).toHaveBeenCalledWith(clientId, updateData);
      expect(result).toEqual(mockUpdatedClient);
    });

    test('should return null for non-existent client', async () => {
      const clientId = 999;
      const updateData = { nome: 'Test' };

      ClientesRepository.update.mockResolvedValue(null);

      const result = await ClientesService.updateCliente(clientId, updateData);

      expect(ClientesRepository.update).toHaveBeenCalledWith(clientId, updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteCliente', () => {
    test('should delete existing client', async () => {
      const clientId = 1;
      const mockDeletedClient = { id: 1, nome: 'João Silva', email: 'joao@test.com' };

      ClientesRepository.delete.mockResolvedValue(mockDeletedClient);

      const result = await ClientesService.deleteCliente(clientId);

      expect(ClientesRepository.delete).toHaveBeenCalledWith(clientId);
      expect(result).toEqual(mockDeletedClient);
    });

    test('should return null for non-existent client', async () => {
      const clientId = 999;

      ClientesRepository.delete.mockResolvedValue(null);

      const result = await ClientesService.deleteCliente(clientId);

      expect(ClientesRepository.delete).toHaveBeenCalledWith(clientId);
      expect(result).toBeNull();
    });
  });
});