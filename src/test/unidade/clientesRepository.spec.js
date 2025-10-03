import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import ClientesRepository from '../../repository/clientesRepository.js';

// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    cliente: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
}));

// Obter referência ao mock
const mockPrisma = require('../../models/prisma.js');

describe('ClientesRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('findAll', () => {
        test('should return all clients with pagination', async () => {
            const mockClientes = [
                {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    cpf: '12345678901',
                    telefone: '11999999999',
                    endereco: 'Rua A, 123',
                    criado_em: new Date()
                }
            ];

            mockPrisma.cliente.findMany.mockResolvedValue(mockClientes);
            mockPrisma.cliente.count.mockResolvedValue(1);

            const filters = {};
            const pagination = { page: 1, limit: 10 };

            const result = await ClientesRepository.findAll(filters, pagination);

            expect(result.data).toEqual(mockClientes);
            expect(result.pagination).toMatchObject({
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            });
        });

        test('should apply nome filter', async () => {
            mockPrisma.cliente.findMany.mockResolvedValue([]);
            mockPrisma.cliente.count.mockResolvedValue(0);

            const filters = { nome: 'João' };
            const pagination = { page: 1, limit: 10 };

            await ClientesRepository.findAll(filters, pagination);

            expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
                where: {
                    nome: { contains: 'João' }
                },
                skip: 0,
                take: 10,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should apply email filter', async () => {
            mockPrisma.cliente.findMany.mockResolvedValue([]);
            mockPrisma.cliente.count.mockResolvedValue(0);

            const filters = { email: 'joao@teste.com' };
            const pagination = { page: 1, limit: 10 };

            await ClientesRepository.findAll(filters, pagination);

            expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
                where: {
                    email: { contains: 'joao@teste.com' }
                },
                skip: 0,
                take: 10,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should apply cpf filter', async () => {
            mockPrisma.cliente.findMany.mockResolvedValue([]);
            mockPrisma.cliente.count.mockResolvedValue(0);

            const filters = { cpf: '123456789' };
            const pagination = { page: 1, limit: 10 };

            await ClientesRepository.findAll(filters, pagination);

            expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
                where: {
                    cpf: { contains: '123456789' }
                },
                skip: 0,
                take: 10,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should apply telefone filter', async () => {
            mockPrisma.cliente.findMany.mockResolvedValue([]);
            mockPrisma.cliente.count.mockResolvedValue(0);

            const filters = { telefone: '11999999999' };
            const pagination = { page: 1, limit: 10 };

            await ClientesRepository.findAll(filters, pagination);

            expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
                where: {
                    telefone: { contains: '11999999999' }
                },
                skip: 0,
                take: 10,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should handle pagination correctly', async () => {
            mockPrisma.cliente.findMany.mockResolvedValue([]);
            mockPrisma.cliente.count.mockResolvedValue(25);

            const filters = {};
            const pagination = { page: 2, limit: 10 };

            const result = await ClientesRepository.findAll(filters, pagination);

            expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 10,
                take: 10,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                },
                orderBy: { criado_em: 'desc' }
            });

            expect(result.pagination).toMatchObject({
                page: 2,
                limit: 10,
                total: 25,
                totalPages: 3,
                hasNext: true,
                hasPrev: true
            });
        });
    });

    describe('findById', () => {
        test('should return client by id', async () => {
            const mockCliente = {
                id: 1,
                nome: 'João Silva',
                email: 'joao@teste.com',
                cpf: '12345678901',
                telefone: '11999999999',
                endereco: 'Rua A, 123',
                criado_em: new Date(),
                Condicionais: []
            };

            mockPrisma.cliente.findUnique.mockResolvedValue(mockCliente);

            const result = await ClientesRepository.findById(1);

            expect(result).toEqual(mockCliente);
            expect(mockPrisma.cliente.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true,
                    Condicionais: {
                        select: {
                            id: true,
                            data: true,
                            data_devolucao: true,
                            devolvido: true
                        }
                    }
                }
            });
        });

        test('should return null for non-existent client', async () => {
            mockPrisma.cliente.findUnique.mockResolvedValue(null);

            const result = await ClientesRepository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new client', async () => {
            const clientData = {
                nome: 'João Silva',
                email: 'joao@teste.com',
                cpf: '12345678901',
                telefone: '11999999999',
                endereco: 'Rua A, 123'
            };

            const mockCreatedClient = {
                id: 1,
                ...clientData,
                criado_em: new Date()
            };

            mockPrisma.cliente.create.mockResolvedValue(mockCreatedClient);

            const result = await ClientesRepository.create(clientData);

            expect(result).toEqual(mockCreatedClient);
            expect(mockPrisma.cliente.create).toHaveBeenCalledWith({
                data: clientData,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                }
            });
        });
    });

    describe('update', () => {
        test('should update existing client', async () => {
            const updateData = { nome: 'João Santos' };
            const mockUpdatedClient = {
                id: 1,
                nome: 'João Santos',
                email: 'joao@teste.com',
                cpf: '12345678901',
                telefone: '11999999999',
                endereco: 'Rua A, 123',
                criado_em: new Date()
            };

            mockPrisma.cliente.update.mockResolvedValue(mockUpdatedClient);

            const result = await ClientesRepository.update(1, updateData);

            expect(result).toEqual(mockUpdatedClient);
            expect(mockPrisma.cliente.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                }
            });
        });
    });

    describe('delete', () => {
        test('should delete client', async () => {
            const mockDeletedClient = {
                id: 1,
                nome: 'João Silva'
            };

            mockPrisma.cliente.delete.mockResolvedValue(mockDeletedClient);

            const result = await ClientesRepository.delete(1);

            expect(result).toEqual(mockDeletedClient);
            expect(mockPrisma.cliente.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });
    });
});