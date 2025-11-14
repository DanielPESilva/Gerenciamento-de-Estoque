import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import ItensRepository from '../../repository/itensRepository.js';

// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    roupas: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
}));

// Obter referência ao mock
// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    __esModule: true,
    default: {
        roupas: {
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

describe('ItensRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('findAll', () => {
        test('should return all items with pagination', async () => {
            const mockItens = [
                {
                    id: 1,
                    nome: 'Camisa Polo',
                    tipo: 'Camisa',
                    cor: 'Azul',
                    tamanho: 'M',
                    quantidade: 10,
                    preco: 50.00,
                    criado_em: new Date(),
                    Usuario: {
                        id: 1,
                        nome: 'Admin',
                        email: 'admin@teste.com'
                    }
                }
            ];

            mockPrisma.roupas.findMany.mockResolvedValue(mockItens);
            mockPrisma.roupas.count.mockResolvedValue(1);

            const filters = {};
            const pagination = { page: 1, limit: 10 };

            const result = await ItensRepository.findAll(filters, pagination);

            expect(result.data).toEqual(mockItens);
            expect(result.pagination).toMatchObject({
                page: 1,
                limit: 10,
                total: 1
            });
            expect(mockPrisma.roupas.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 10,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should apply tipo filter', async () => {
            mockPrisma.roupas.findMany.mockResolvedValue([]);
            mockPrisma.roupas.count.mockResolvedValue(0);

            const filters = { tipo: 'Camisa' };
            const pagination = { page: 1, limit: 10 };

            await ItensRepository.findAll(filters, pagination);

            expect(mockPrisma.roupas.findMany).toHaveBeenCalledWith({
                where: {
                    tipo: { contains: 'Camisa' }
                },
                skip: 0,
                take: 10,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should apply cor filter', async () => {
            mockPrisma.roupas.findMany.mockResolvedValue([]);
            mockPrisma.roupas.count.mockResolvedValue(0);

            const filters = { cor: 'Azul' };
            const pagination = { page: 1, limit: 10 };

            await ItensRepository.findAll(filters, pagination);

            expect(mockPrisma.roupas.findMany).toHaveBeenCalledWith({
                where: {
                    cor: { contains: 'Azul' }
                },
                skip: 0,
                take: 10,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should apply tamanho filter', async () => {
            mockPrisma.roupas.findMany.mockResolvedValue([]);
            mockPrisma.roupas.count.mockResolvedValue(0);

            const filters = { tamanho: 'M' };
            const pagination = { page: 1, limit: 10 };

            await ItensRepository.findAll(filters, pagination);

            expect(mockPrisma.roupas.findMany).toHaveBeenCalledWith({
                where: {
                    tamanho: 'M'
                },
                skip: 0,
                take: 10,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                },
                orderBy: { criado_em: 'desc' }
            });
        });

        test('should handle pagination correctly', async () => {
            mockPrisma.roupas.findMany.mockResolvedValue([]);
            mockPrisma.roupas.count.mockResolvedValue(25);

            const filters = {};
            const pagination = { page: 3, limit: 5 };

            await ItensRepository.findAll(filters, pagination);

            expect(mockPrisma.roupas.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 10,
                take: 5,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                },
                orderBy: { criado_em: 'desc' }
            });
        });
    });

    describe('findById', () => {
        test('should return item by id', async () => {
            const mockItem = {
                id: 1,
                nome: 'Camisa Polo',
                tipo: 'Camisa',
                cor: 'Azul',
                tamanho: 'M',
                quantidade: 10,
                preco: 50.00,
                criado_em: new Date(),
                Usuario: {
                    id: 1,
                    nome: 'Admin',
                    email: 'admin@teste.com'
                }
            };

            mockPrisma.roupas.findUnique.mockResolvedValue(mockItem);

            const result = await ItensRepository.findById(1);

            expect(result).toEqual(mockItem);
            expect(mockPrisma.roupas.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    },
                    ComprasItens: {
                        include: {
                            Compras: {
                                select: {
                                    id: true,
                                    data_compra: true,
                                    fornecendor: true
                                }
                            }
                        }
                    },
                    VendasItens: {
                        include: {
                            Venda: {
                                select: {
                                    id: true,
                                    data_venda: true,
                                    forma_pgto: true,
                                    valor_total: true
                                }
                            }
                        }
                    },
                    HistoricoStatus: {
                        orderBy: {
                            alterado_em: 'desc'
                        },
                        take: 10
                    }
                }
            });
        });

        test('should return null for non-existent item', async () => {
            mockPrisma.roupas.findUnique.mockResolvedValue(null);

            const result = await ItensRepository.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create new item', async () => {
            const itemData = {
                nome: 'Camisa Polo',
                tipo: 'Camisa',
                cor: 'Azul',
                tamanho: 'M',
                quantidade: 10,
                preco: 50.00,
                usuario_id: 1
            };

            const mockCreatedItem = {
                id: 1,
                ...itemData,
                criado_em: new Date()
            };

            mockPrisma.roupas.create.mockResolvedValue(mockCreatedItem);

            const result = await ItensRepository.create(itemData);

            expect(result).toEqual(mockCreatedItem);
            expect(mockPrisma.roupas.create).toHaveBeenCalledWith({
                data: itemData,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                }
            });
        });
    });

    describe('update', () => {
        test('should update existing item', async () => {
            const updateData = { nome: 'Camisa Polo Atualizada' };
            const mockUpdatedItem = {
                id: 1,
                nome: 'Camisa Polo Atualizada',
                tipo: 'Camisa',
                cor: 'Azul',
                tamanho: 'M',
                quantidade: 10,
                preco: 50.00,
                criado_em: new Date()
            };

            mockPrisma.roupas.update.mockResolvedValue(mockUpdatedItem);

            const result = await ItensRepository.update(1, updateData);

            expect(result).toEqual(mockUpdatedItem);
            expect(mockPrisma.roupas.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                }
            });
        });
    });

    describe('delete', () => {
        test('should delete item', async () => {
            const mockDeletedItem = {
                id: 1,
                nome: 'Camisa Polo'
            };

            mockPrisma.roupas.delete.mockResolvedValue(mockDeletedItem);

            const result = await ItensRepository.delete(1);

            expect(result).toEqual(mockDeletedItem);
            expect(mockPrisma.roupas.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });
    });

    describe('searchByName', () => {
        test('should search items by name', async () => {
            const mockItens = [
                {
                    id: 1,
                    nome: 'Camisa Polo',
                    tipo: 'Camisa',
                    cor: 'Azul'
                }
            ];

            mockPrisma.roupas.findMany.mockResolvedValue(mockItens);

            const result = await ItensRepository.searchByName('Camisa');

            expect(result).toEqual(mockItens);
            expect(mockPrisma.roupas.findMany).toHaveBeenCalledWith({
                where: {
                    nome: {
                        contains: 'Camisa'
                    }
                },
                select: {
                    id: true,
                    nome: true,
                    tipo: true,
                    cor: true,
                    tamanho: true,
                    preco: true,
                    quantidade: true
                },
                take: 10,
                orderBy: {
                    nome: 'asc'
                }
            });
        });
    });
});