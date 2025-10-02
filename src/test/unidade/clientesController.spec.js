import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import * as ClientesController from '../../controllers/clientesController.js';
import ClientesService from '../../services/clientesService.js';
import ClientesSchema from '../../schemas/clientesSchema.js';
import { sendResponse, sendError } from '../../utils/messages.js';

jest.mock('../../services/clientesService.js');
jest.mock('../../schemas/clientesSchema.js');
jest.mock('../../utils/messages.js');

describe('ClientesController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('should get all clients successfully', async () => {
      const queryData = { page: 1, limit: 10 };
      const serviceResult = {
        data: [{ id: 1, nome: 'João Silva', email: 'joao@teste.com' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      req.query = queryData;
      ClientesSchema.query = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: queryData }) 
      };
      ClientesService.getAllClientes.mockResolvedValue(serviceResult);

      await ClientesController.getAll(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: serviceResult.data,
        pagination: serviceResult.pagination
      });
    });
  });

  describe('getById', () => {
    test('should get client by id successfully', async () => {
      const clientData = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

      req.params = { id: '1' };
      ClientesSchema.id = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } }) 
      };
      ClientesService.getClienteById.mockResolvedValue(clientData);

      await ClientesController.getById(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: clientData });
    });

    test('should handle client not found', async () => {
      req.params = { id: '999' };
      ClientesSchema.id = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 999 } }) 
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.getById(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: "Cliente não encontrado com o ID informado",
        field: "id"
      });
    });
  });

  describe('create', () => {
    test('should create client successfully', async () => {
      const clientData = { nome: 'João Silva', email: 'joao@teste.com', cpf: '12345678901', telefone: null, endereco: null };
      const createdClient = { id: 1, ...clientData };

      req.body = { nome: 'João Silva', email: 'joao@teste.com', cpf: '12345678901' };
      ClientesSchema.create = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: clientData }) 
      };
      ClientesService.createCliente.mockResolvedValue(createdClient);

      await ClientesController.create(req, res);

      expect(ClientesService.createCliente).toHaveBeenCalledWith(clientData);
      expect(sendResponse).toHaveBeenCalledWith(res, 201, { 
        data: createdClient,
        message: "Cliente criado com sucesso"
      });
    });
  });

  describe('update', () => {
    test('should update client successfully', async () => {
      const updateData = { nome: 'João Silva Atualizado' };
      const updatedClient = { id: 1, nome: 'João Silva Atualizado', email: 'joao@teste.com' };
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

      req.params = { id: '1' };
      req.body = updateData;
      ClientesSchema.id = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } }) 
      };
      ClientesSchema.update = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData }) 
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 200, { 
        data: updatedClient,
        message: "Cliente atualizado com sucesso"
      });
    });

    test('should handle client not found on update', async () => {
      const updateData = { nome: 'João Silva Atualizado' };

      req.params = { id: '999' };
      req.body = updateData;
      ClientesSchema.id = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 999 } }) 
      };
      ClientesSchema.update = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData }) 
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: "Cliente não encontrado com o ID informado",
        field: "id"
      });
    });
  });

  describe('remove', () => {
    test('should remove client successfully', async () => {
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

      req.params = { id: '1' };
      ClientesSchema.id = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } }) 
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockResolvedValue();

      await ClientesController.remove(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 204, { 
        message: "Cliente removido com sucesso"
      });
    });

    test('should handle client not found on delete', async () => {
      req.params = { id: '999' };
      ClientesSchema.id = { 
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 999 } }) 
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: "Cliente não encontrado com o ID informado",
        field: "id"
      });
    });
  });
});
