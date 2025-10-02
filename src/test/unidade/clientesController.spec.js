import { describe, expect, jest, test, beforeEach } from '@jest/globals';import request from 'supertest';

import * as clientesController from '../../controllers/clientesController.js';import express from 'express';

import ClientesService from '../../services/clientesService.js';import clientesController from '../../controllers/clientesController.js';

import ClientesSchema from '../../schemas/clientesSchema.js';import ClientesRepository from '../../repository/clientesRepository.js';

import { sendResponse, sendError } from '../../utils/messages.js';import { sendError, sendResponse } from '../../utils/messages.js';



jest.mock('../../services/clientesService.js');jest.mock('../../repository/clientesRepository.js');

jest.mock('../../utils/messages.js');jest.mock('../../utils/messages.js');

jest.mock('../../schemas/clientesSchema.js');

const app = express();

describe('clientesController', () => {app.use(express.json());

  let req, res;app.get('/clientes', clientesController.getAll);

app.get('/clientes/:id', clientesController.getById);

  beforeEach(() => {app.post('/clientes', clientesController.create);

    req = {app.put('/clientes/:id', clientesController.update);

      query: {},app.delete('/clientes/:id', clientesController.delete);

      params: {},

      body: {}describe('clientesController', () => {

    };  beforeEach(() => {

    res = {    jest.clearAllMocks();

      status: jest.fn().mockReturnThis(),  });

      json: jest.fn()

    };  describe('GET /clientes', () => {

    jest.clearAllMocks();    it('should return 200 and list of clients', async () => {

  });      const mockClients = [

        { id: 1, nome: 'João Silva', email: 'joao@teste.com' },

  describe('getAll', () => {        { id: 2, nome: 'Maria Santos', email: 'maria@teste.com' }

    test('should return all clients successfully', async () => {      ];

      const mockClients = {

        data: [      ClientesRepository.getAll.mockResolvedValue(mockClients);

          { id: 1, nome: 'João Silva', email: 'joao@teste.com' },      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

          { id: 2, nome: 'Maria Santos', email: 'maria@teste.com' }

        ],      const response = await request(app).get('/clientes');

        pagination: { page: 1, limit: 10, total: 2 }

      };      expect(response.status).toBe(200);

      expect(ClientesRepository.getAll).toHaveBeenCalled();

      req.query = { page: '1', limit: '10' };    });



      ClientesSchema.query = {    it('should return 500 for database error', async () => {

        safeParse: jest.fn().mockReturnValue({      ClientesRepository.getAll.mockRejectedValue(new Error('Database error'));

          success: true,      sendError.mockImplementation((res, status, message) => 

          data: { page: 1, limit: 10 }        res.status(status).json({ error: message })

        })      );

      };

      const response = await request(app).get('/clientes');

      ClientesService.getAllClientes.mockResolvedValue(mockClients);

      expect(response.status).toBe(500);

      await clientesController.getAll(req, res);      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');

    });

      expect(ClientesService.getAllClientes).toHaveBeenCalledWith({}, { page: 1, limit: 10 });  });

      expect(sendResponse).toHaveBeenCalledWith(res, 200, {

        data: mockClients.data,  describe('GET /clientes/:id', () => {

        pagination: mockClients.pagination    it('should return 200 and client data for valid id', async () => {

      });      const mockClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

    });

      ClientesRepository.getById.mockResolvedValue(mockClient);

    test('should return filtered clients', async () => {      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

      const mockClients = {

        data: [{ id: 1, nome: 'João Silva', email: 'joao@teste.com' }],      const response = await request(app).get('/clientes/1');

        pagination: { page: 1, limit: 10, total: 1 }

      };      expect(response.status).toBe(200);

      expect(ClientesRepository.getById).toHaveBeenCalledWith('1');

      req.query = { nome: 'João', email: 'joao@teste.com' };    });



      ClientesSchema.query = {    it('should return 404 for non-existent client', async () => {

        safeParse: jest.fn().mockReturnValue({      ClientesRepository.getById.mockResolvedValue(null);

          success: true,      sendError.mockImplementation((res, status, message) => 

          data: { page: 1, limit: 10, nome: 'João', email: 'joao@teste.com' }        res.status(status).json({ error: message })

        })      );

      };

      const response = await request(app).get('/clientes/999');

      ClientesService.getAllClientes.mockResolvedValue(mockClients);

      expect(response.status).toBe(404);

      await clientesController.getAll(req, res);    });



      expect(ClientesService.getAllClientes).toHaveBeenCalledWith(    it('should return 500 for database error', async () => {

        { nome: 'João', email: 'joao@teste.com' },      ClientesRepository.getById.mockRejectedValue(new Error('Database error'));

        { page: 1, limit: 10 }      sendError.mockImplementation((res, status, message) => 

      );        res.status(status).json({ error: message })

      expect(sendResponse).toHaveBeenCalledWith(res, 200, {      );

        data: mockClients.data,

        pagination: mockClients.pagination      const response = await request(app).get('/clientes/1');

      });

    });      expect(response.status).toBe(500);

      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');

    test('should return validation error for invalid query', async () => {    });

      const validationError = {  });

        error: {

          issues: [  describe('POST /clientes', () => {

            { message: 'Página deve ser um número positivo', path: ['page'] }    it('should return 201 and create new client', async () => {

          ]      const newClient = { nome: 'João Silva', email: 'joao@teste.com', telefone: '11999999999' };

        }      const createdClient = { id: 1, ...newClient };

      };

      ClientesRepository.create.mockResolvedValue(createdClient);

      ClientesSchema.query = {      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

        safeParse: jest.fn().mockReturnValue({

          success: false,      const response = await request(app)

          ...validationError        .post('/clientes')

        })        .send(newClient);

      };

      expect(response.status).toBe(201);

      await clientesController.getAll(req, res);      expect(ClientesRepository.create).toHaveBeenCalledWith(newClient);

    });

      expect(sendError).toHaveBeenCalledWith(res, 400, [

        { message: 'Página deve ser um número positivo', field: 'page' }    it('should return 400 for validation errors', async () => {

      ]);      sendError.mockImplementation((res, status, errors) => 

    });        res.status(status).json({ error: true, errors })

      );

    test('should handle service error', async () => {

      ClientesSchema.query = {      const response = await request(app)

        safeParse: jest.fn().mockReturnValue({        .post('/clientes')

          success: true,        .send({ nome: '', email: 'invalid-email' });

          data: { page: 1, limit: 10 }

        })      expect(response.status).toBe(400);

      };    });



      ClientesService.getAllClientes.mockRejectedValue(new Error('Database error'));    it('should return 500 for database error', async () => {

      ClientesRepository.create.mockRejectedValue(new Error('Database error'));

      await clientesController.getAll(req, res);      sendError.mockImplementation((res, status, message) => 

        res.status(status).json({ error: message })

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");      );

    });

  });      const response = await request(app)

        .post('/clientes')

  describe('getById', () => {        .send({ nome: 'João Silva', email: 'joao@teste.com' });

    test('should return client by id successfully', async () => {

      const mockClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };      expect(response.status).toBe(500);

      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');

      req.params = { id: '1' };    });

  });

      ClientesSchema.id = {

        safeParse: jest.fn().mockReturnValue({  describe('PUT /clientes/:id', () => {

          success: true,    it('should return 200 and update client', async () => {

          data: { id: 1 }      const updateData = { nome: 'João Silva Updated', email: 'joao.updated@teste.com' };

        })      const updatedClient = { id: 1, ...updateData };

      };

      ClientesRepository.update.mockResolvedValue(updatedClient);

      ClientesService.getClienteById.mockResolvedValue(mockClient);      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));



      await clientesController.getById(req, res);      const response = await request(app)

        .put('/clientes/1')

      expect(ClientesService.getClienteById).toHaveBeenCalledWith(1);        .send(updateData);

      expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: mockClient });

    });      expect(response.status).toBe(200);

      expect(ClientesRepository.update).toHaveBeenCalledWith('1', updateData);

    test('should return 404 when client not found', async () => {    });

      req.params = { id: '999' };

    it('should return 404 for non-existent client', async () => {

      ClientesSchema.id = {      ClientesRepository.update.mockResolvedValue(null);

        safeParse: jest.fn().mockReturnValue({      sendError.mockImplementation((res, status, message) => 

          success: true,        res.status(status).json({ error: message })

          data: { id: 999 }      );

        })

      };      const response = await request(app)

        .put('/clientes/999')

      ClientesService.getClienteById.mockResolvedValue(null);        .send({ nome: 'Test' });



      await clientesController.getById(req, res);      expect(response.status).toBe(404);

    });

      expect(sendError).toHaveBeenCalledWith(res, 404, "Cliente não encontrado");

    });    it('should return 500 for database error', async () => {

      ClientesRepository.update.mockRejectedValue(new Error('Database error'));

    test('should return validation error for invalid id', async () => {      sendError.mockImplementation((res, status, message) => 

      const validationError = {        res.status(status).json({ error: message })

        error: {      );

          issues: [

            { message: 'ID deve ser um número', path: ['id'] }      const response = await request(app)

          ]        .put('/clientes/1')

        }        .send({ nome: 'Test' });

      };

      expect(response.status).toBe(500);

      ClientesSchema.id = {      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');

        safeParse: jest.fn().mockReturnValue({    });

          success: false,  });

          ...validationError

        })  describe('DELETE /clientes/:id', () => {

      };    it('should return 200 and delete client', async () => {

      const deletedClient = { id: 1, nome: 'João Silva' };

      await clientesController.getById(req, res);

      ClientesRepository.delete.mockResolvedValue(deletedClient);

      expect(sendError).toHaveBeenCalledWith(res, 400, [      sendResponse.mockImplementation((res, status, data) => res.status(status).json(data));

        { message: 'ID deve ser um número', field: 'id' }

      ]);      const response = await request(app).delete('/clientes/1');

    });

      expect(response.status).toBe(200);

    test('should handle service error', async () => {      expect(ClientesRepository.delete).toHaveBeenCalledWith('1');

      req.params = { id: '1' };    });



      ClientesSchema.id = {    it('should return 404 for non-existent client', async () => {

        safeParse: jest.fn().mockReturnValue({      ClientesRepository.delete.mockResolvedValue(null);

          success: true,      sendError.mockImplementation((res, status, message) => 

          data: { id: 1 }        res.status(status).json({ error: message })

        })      );

      };

      const response = await request(app).delete('/clientes/999');

      ClientesService.getClienteById.mockRejectedValue(new Error('Database error'));

      expect(response.status).toBe(404);

      await clientesController.getById(req, res);    });



      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");    it('should return 500 for database error', async () => {

    });      ClientesRepository.delete.mockRejectedValue(new Error('Database error'));

  });      sendError.mockImplementation((res, status, message) => 

        res.status(status).json({ error: message })

  describe('create', () => {      );

    test('should create client successfully', async () => {

      const clientData = {      const response = await request(app).delete('/clientes/1');

        nome: 'João Silva',

        email: 'joao@teste.com',      expect(response.status).toBe(500);

        cpf: '123.456.789-00'      expect(sendError).toHaveBeenCalledWith(expect.anything(), 500, 'Erro interno do servidor');

      };    });

  });

      const mockClient = { id: 1, ...clientData };

  describe('clientesController direct method testing', () => {

      req.body = clientData;    let req, res;



      ClientesSchema.create = {    beforeEach(() => {

        safeParse: jest.fn().mockReturnValue({      req = { params: {}, body: {} };

          success: true,      res = {

          data: clientData        status: jest.fn().mockReturnThis(),

        })        json: jest.fn(),

      };      };

      jest.clearAllMocks();

      ClientesService.createCliente.mockResolvedValue(mockClient);    });



      await clientesController.create(req, res);    test('should handle getAll method directly', async () => {

      const mockClients = [{ id: 1, nome: 'Test Client' }];

      expect(ClientesService.createCliente).toHaveBeenCalledWith(clientData);      ClientesRepository.getAll.mockResolvedValue(mockClients);

      expect(sendResponse).toHaveBeenCalledWith(res, 201, {

        data: mockClient,      await clientesController.getAll(req, res);

        message: "Cliente criado com sucesso"

      });      expect(ClientesRepository.getAll).toHaveBeenCalled();

    });    });



    test('should return validation error for invalid data', async () => {    test('should handle getById method directly', async () => {

      const validationError = {      req.params.id = '1';

        error: {      const mockClient = { id: 1, nome: 'Test Client' };

          issues: [      ClientesRepository.getById.mockResolvedValue(mockClient);

            { message: 'Nome é obrigatório', path: ['nome'] }

          ]      await clientesController.getById(req, res);

        }

      };      expect(ClientesRepository.getById).toHaveBeenCalledWith('1');

    });

      ClientesSchema.create = {

        safeParse: jest.fn().mockReturnValue({    test('should return error 500 if unknown error occurs', async () => {

          success: false,      ClientesRepository.getAll.mockRejectedValue(new Error('Unknown error'));

          ...validationError      sendError.mockImplementation((res, status, message) => {

        })        res.status(status).json({ error: message });

      };      });



      await clientesController.create(req, res);      await clientesController.getAll(req, res);



      expect(sendError).toHaveBeenCalledWith(res, 400, [      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');

        { message: 'Nome é obrigatório', field: 'nome' }    });

      ]);  });

    });});

    test('should handle service error', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '123.456.789-00'
      };

      req.body = clientData;

      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: clientData
        })
      };

      ClientesService.createCliente.mockRejectedValue(new Error('Database error'));

      await clientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('update', () => {
    test('should update client successfully', async () => {
      const updateData = { nome: 'João Silva Atualizado' };
      const mockClient = { id: 1, nome: 'João Silva Atualizado', email: 'joao@teste.com' };

      req.params = { id: '1' };
      req.body = updateData;

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: 1 }
        })
      };

      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };

      ClientesService.updateCliente.mockResolvedValue(mockClient);

      await clientesController.update(req, res);

      expect(ClientesService.updateCliente).toHaveBeenCalledWith(1, updateData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: mockClient,
        message: "Cliente atualizado com sucesso"
      });
    });

    test('should return 404 when updating non-existent client', async () => {
      req.params = { id: '999' };
      req.body = { nome: 'Test' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: 999 }
        })
      };

      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { nome: 'Test' }
        })
      };

      ClientesService.updateCliente.mockResolvedValue(null);

      await clientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, "Cliente não encontrado");
    });
  });

  describe('remove', () => {
    test('should delete client successfully', async () => {
      const mockClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

      req.params = { id: '1' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: 1 }
        })
      };

      ClientesService.deleteCliente.mockResolvedValue(mockClient);

      await clientesController.remove(req, res);

      expect(ClientesService.deleteCliente).toHaveBeenCalledWith(1);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: mockClient,
        message: "Cliente removido com sucesso"
      });
    });

    test('should return 404 when deleting non-existent client', async () => {
      req.params = { id: '999' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: 999 }
        })
      };

      ClientesService.deleteCliente.mockResolvedValue(null);

      await clientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, "Cliente não encontrado");
    });
  });
});