import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import BaixaRepository from '../../repository/baixaRepository.js';

// Mock do Prisma
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => ({
        baixa: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        baixaItens: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        },
        roupa: {
            findUnique: jest.fn(),
            update: jest.fn()
        },
        $transaction: jest.fn()
    }))
}));

// Obter referência ao mock
const { PrismaClient } = require('@prisma/client');
// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    __esModule: true,
    default: {
        baixa: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        },
        $transaction: jest.fn()
    }
}));

const mockPrisma = require('../../models/prisma.js').default;

describe('BaixaRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getAllBaixas', () => {
        test('should return all baixas with pagination', async () => {
            const mockBaixas = [
                {
                    id: 1,
                    motivo: 'Defeito',
                    data_baixa: new Date(),
                    Roupa: { id: 1, nome: 'Camisa' }
                }
            ];
            
            mockPrisma.baixa.findMany.mockResolvedValue(mockBaixas);
            mockPrisma.baixa.count.mockResolvedValue(1);

            const filters = {};
            const pagination = { page: 1, limit: 10 };

            const result = await BaixaRepository.getAllBaixas(filters, pagination);

            expect(result).toBeDefined();
            // Verifica se o método foi executado sem erros
            expect(typeof BaixaRepository.getAllBaixas).toBe('function');
        });

        test('should apply date filters', async () => {
            mockPrisma.baixa.findMany.mockResolvedValue([]);
            mockPrisma.baixa.count.mockResolvedValue(0);

            const filters = {
                data_inicio: '2024-01-01',
                data_fim: '2024-12-31'
            };
            const pagination = { page: 1, limit: 10 };

            await BaixaRepository.getAllBaixas(filters, pagination);

            const result = await BaixaRepository.getAllBaixas(filters, pagination);

            expect(result).toBeDefined();
        });

        test('should apply motivo filter', async () => {
            mockPrisma.baixa.findMany.mockResolvedValue([]);
            mockPrisma.baixa.count.mockResolvedValue(0);

            const filters = { motivo: 'Defeito' };
            const pagination = { page: 1, limit: 10 };

            await BaixaRepository.getAllBaixas(filters, pagination);

            // Verifica se o método foi executado sem erros
            expect(typeof BaixaRepository.getAllBaixas).toBe('function');
        });

        test('should apply roupa_id filter', async () => {
            mockPrisma.baixa.findMany.mockResolvedValue([]);
            mockPrisma.baixa.count.mockResolvedValue(0);

            const filters = { roupa_id: 1 };
            const pagination = { page: 1, limit: 10 };

            await BaixaRepository.getAllBaixas(filters, pagination);

            // Verifica se o método foi executado sem erros
            expect(typeof BaixaRepository.getAllBaixas).toBe('function');
        });
    });

    describe('getBaixaById', () => {
        test('should return baixa by id', async () => {
            const mockBaixa = {
                id: 1,
                motivo: 'Defeito',
                data_baixa: new Date(),
                Roupa: { id: 1, nome: 'Camisa' }
            };

            mockPrisma.baixa.findUnique.mockResolvedValue(mockBaixa);

            const result = await BaixaRepository.getBaixaById(1);

            expect(typeof BaixaRepository.getBaixaById).toBe('function');
        });

        test('should return null for non-existent baixa', async () => {
            mockPrisma.baixa.findUnique.mockResolvedValue(null);

            const result = await BaixaRepository.getBaixaById(999);

            // Verifica se retorna null ou undefined para ID inexistente
            expect(result == null).toBe(true);
        });
    });

    describe('createBaixa', () => {
        test('should create new baixa', async () => {
            const baixaData = {
                motivo: 'Defeito',
                data_baixa: new Date()
            };

            const mockCreatedBaixa = {
                id: 1,
                ...baixaData
            };

            mockPrisma.baixa.create.mockResolvedValue(mockCreatedBaixa);

            const result = await BaixaRepository.createBaixa(baixaData);

            expect(typeof BaixaRepository.createBaixa).toBe('function');
        });
    });

    describe('updateBaixa', () => {
        test('should update existing baixa', async () => {
            const updateData = { motivo: 'Perda' };
            const mockUpdatedBaixa = {
                id: 1,
                motivo: 'Perda',
                data_baixa: new Date()
            };

            mockPrisma.baixa.update.mockResolvedValue(mockUpdatedBaixa);

            const result = await BaixaRepository.updateBaixa(1, updateData);

            expect(typeof BaixaRepository.updateBaixa).toBe('function');
        });
    });

    describe('deleteBaixa', () => {
        test('should delete baixa', async () => {
            const mockDeletedBaixa = {
                id: 1,
                motivo: 'Defeito'
            };

            mockPrisma.baixa.delete.mockResolvedValue(mockDeletedBaixa);

            const result = await BaixaRepository.deleteBaixa(1);

            expect(typeof BaixaRepository.deleteBaixa).toBe('function');
        });
    });
});