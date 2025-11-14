import CondicionaisRepository from '../../repository/condicionaisRepository.js';
import prisma from '../../models/prisma.js';

// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    condicionais: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn()
    },
    condicionaisItens: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
    },
    cliente: {
        findUnique: jest.fn()
    },
    roupas: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn()
    },
    historicoStatus: {
        create: jest.fn()
    },
    $transaction: jest.fn()
}));

describe('CondicionaisRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCondicionais', () => {
        const mockCondicionais = [
            {
                id: 1,
                cliente_id: 1,
                data: new Date('2023-01-01'),
                data_devolucao: new Date('2023-01-08'),
                devolvido: false,
                Cliente: {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@email.com',
                    telefone: '11999999999',
                    endereco: 'Rua A, 123'
                },
                CondicionaisItens: [
                    {
                        id: 1,
                        quatidade: 2,
                        Roupa: {
                            id: 1,
                            nome: 'Camisa Polo',
                            tipo: 'camisa',
                            tamanho: 'M',
                            cor: 'azul',
                            preco: 50.00
                        }
                    }
                ]
            }
        ];

        it('should return condicionais with pagination', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            prisma.condicionais.count.mockResolvedValue(1);

            const result = await CondicionaisRepository.getAllCondicionais({}, { page: 1, limit: 10 });

            expect(result).toEqual({
                data: mockCondicionais,
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            });

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith({
                where: {},
                include: {
                    Cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            endereco: true
                        }
                    },
                    CondicionaisItens: {
                        include: {
                            Roupa: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipo: true,
                                    tamanho: true,
                                    cor: true,
                                    preco: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                },
                skip: 0,
                take: 10
            });
        });

        it('should apply cliente_id filter', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            prisma.condicionais.count.mockResolvedValue(1);

            await CondicionaisRepository.getAllCondicionais({ cliente_id: 1 });

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { cliente_id: 1 }
                })
            );
        });

        it('should apply devolvido filter', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            prisma.condicionais.count.mockResolvedValue(1);

            await CondicionaisRepository.getAllCondicionais({ devolvido: true });

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { devolvido: true }
                })
            );
        });

        it('should apply date range filter', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            prisma.condicionais.count.mockResolvedValue(1);

            await CondicionaisRepository.getAllCondicionais({
                data_inicio: '2023-01-01',
                data_fim: '2023-01-31'
            });

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        data: {
                            gte: new Date('2023-01-01T00:00:00.000Z'),
                            lte: new Date('2023-01-31T23:59:59.999Z')
                        }
                    }
                })
            );
        });

        it('should handle pagination correctly', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            prisma.condicionais.count.mockResolvedValue(25);

            const result = await CondicionaisRepository.getAllCondicionais({}, { page: 3, limit: 5 });

            expect(result.totalPages).toBe(5);
            expect(result.hasNext).toBe(true);
            expect(result.hasPrev).toBe(true);
            expect(prisma.condicionais.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 5
                })
            );
        });
    });

    describe('getCondicionalById', () => {
        const mockCondicional = {
            id: 1,
            cliente_id: 1,
            data: new Date('2023-01-01'),
            data_devolucao: new Date('2023-01-08'),
            devolvido: false,
            Cliente: {
                id: 1,
                nome: 'João Silva',
                email: 'joao@email.com',
                telefone: '11999999999',
                endereco: 'Rua A, 123'
            },
            CondicionaisItens: [
                {
                    id: 1,
                    quatidade: 2,
                    Roupa: {
                        id: 1,
                        nome: 'Camisa Polo',
                        tipo: 'camisa',
                        tamanho: 'M',
                        cor: 'azul',
                        preco: 50.00,
                        quantidade: 10
                    }
                }
            ]
        };

        it('should return condicional by id', async () => {
            prisma.condicionais.findUnique.mockResolvedValue(mockCondicional);

            const result = await CondicionaisRepository.getCondicionalById(1);

            expect(result).toEqual(mockCondicional);
            expect(prisma.condicionais.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    Cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            endereco: true
                        }
                    },
                    CondicionaisItens: {
                        include: {
                            Roupa: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipo: true,
                                    tamanho: true,
                                    cor: true,
                                    preco: true,
                                    quantidade: true
                                }
                            }
                        }
                    }
                }
            });
        });

        it('should return null for non-existent condicional', async () => {
            prisma.condicionais.findUnique.mockResolvedValue(null);

            const result = await CondicionaisRepository.getCondicionalById(999);

            expect(result).toBeNull();
        });
    });

    describe('resolverItem', () => {
        const mockRoupa = {
            id: 1,
            nome: 'Camisa Polo',
            quantidade: 10
        };

        it('should resolve item by roupas_id', async () => {
            const mockTx = {
                roupas: {
                    findUnique: jest.fn().mockResolvedValue(mockRoupa)
                }
            };

            const result = await CondicionaisRepository.resolverItem({ roupas_id: 1 }, mockTx);

            expect(result).toEqual(mockRoupa);
            expect(mockTx.roupas.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { id: true, nome: true, quantidade: true }
            });
        });

        it('should resolve item by nome_item (exact match)', async () => {
            const mockTx = {
                roupas: {
                    findFirst: jest.fn().mockResolvedValue(mockRoupa)
                }
            };

            const result = await CondicionaisRepository.resolverItem({ nome_item: 'Camisa Polo' }, mockTx);

            expect(result).toEqual(mockRoupa);
            expect(mockTx.roupas.findFirst).toHaveBeenCalledWith({
                where: { nome: 'Camisa Polo' },
                select: { id: true, nome: true, quantidade: true }
            });
        });

        it('should resolve item by nome_item (partial match)', async () => {
            const mockTx = {
                roupas: {
                    findFirst: jest.fn()
                        .mockResolvedValueOnce(null) // Primeira busca (exata) retorna null
                        .mockResolvedValueOnce(mockRoupa) // Segunda busca (parcial) retorna o item
                }
            };

            const result = await CondicionaisRepository.resolverItem({ nome_item: 'Camisa' }, mockTx);

            expect(result).toEqual(mockRoupa);
            expect(mockTx.roupas.findFirst).toHaveBeenCalledTimes(2);
            expect(mockTx.roupas.findFirst).toHaveBeenNthCalledWith(2, {
                where: { nome: { contains: 'Camisa' } },
                select: { id: true, nome: true, quantidade: true }
            });
        });

        it('should throw error when item not found by ID', async () => {
            const mockTx = {
                roupas: {
                    findUnique: jest.fn().mockResolvedValue(null)
                }
            };

            await expect(
                CondicionaisRepository.resolverItem({ roupas_id: 999 }, mockTx)
            ).rejects.toThrow('Item não encontrado com ID 999');
        });

        it('should throw error when item not found by name', async () => {
            const mockTx = {
                roupas: {
                    findFirst: jest.fn().mockResolvedValue(null)
                }
            };

            await expect(
                CondicionaisRepository.resolverItem({ nome_item: 'Item Inexistente' }, mockTx)
            ).rejects.toThrow('Item não encontrado com nome "Item Inexistente"');
        });

        it('should trim nome_item before searching', async () => {
            const mockTx = {
                roupas: {
                    findFirst: jest.fn().mockResolvedValue(mockRoupa)
                }
            };

            await CondicionaisRepository.resolverItem({ nome_item: '  Camisa Polo  ' }, mockTx);

            expect(mockTx.roupas.findFirst).toHaveBeenCalledWith({
                where: { nome: 'Camisa Polo' },
                select: { id: true, nome: true, quantidade: true }
            });
        });
    });

    describe('createCondicional', () => {
        const mockCondicionalData = {
            cliente_id: 1,
            data_devolucao: '2023-01-08',
            itens: [
                { roupas_id: 1, quantidade: 2 },
                { nome_item: 'Calça Jeans', quantidade: 1 }
            ]
        };

        const mockCliente = { id: 1, nome: 'João Silva' };
        const mockRoupa1 = { id: 1, nome: 'Camisa Polo', quantidade: 10 };
        const mockRoupa2 = { id: 2, nome: 'Calça Jeans', quantidade: 5 };
        const mockNovoCondicional = { id: 1, cliente_id: 1 };
        const mockCondicionalCompleto = {
            id: 1,
            cliente_id: 1,
            Cliente: mockCliente,
            CondicionaisItens: []
        };

        it('should create condicional successfully', async () => {
            const mockTx = {
                cliente: {
                    findUnique: jest.fn().mockResolvedValue(mockCliente)
                },
                roupas: {
                    findUnique: jest.fn().mockResolvedValue(mockRoupa1),
                    findFirst: jest.fn().mockResolvedValue(mockRoupa2),
                    update: jest.fn()
                },
                condicionais: {
                    create: jest.fn().mockResolvedValue(mockNovoCondicional),
                    findUnique: jest.fn().mockResolvedValue(mockCondicionalCompleto)
                },
                condicionaisItens: {
                    create: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.createCondicional(mockCondicionalData);

            expect(result).toEqual(mockCondicionalCompleto);
            expect(mockTx.cliente.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockTx.condicionais.create).toHaveBeenCalledWith({
                data: {
                    cliente_id: 1,
                    data_devolucao: new Date('2023-01-08')
                }
            });
        });

        it('should throw error when client not found', async () => {
            const mockTx = {
                cliente: {
                    findUnique: jest.fn().mockResolvedValue(null)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await expect(
                CondicionaisRepository.createCondicional(mockCondicionalData)
            ).rejects.toThrow('Cliente com ID 1 não encontrado');
        });

        it('should throw error when insufficient stock', async () => {
            const mockTx = {
                cliente: {
                    findUnique: jest.fn().mockResolvedValue(mockCliente)
                },
                roupas: {
                    findUnique: jest.fn().mockResolvedValue({ ...mockRoupa1, quantidade: 1 }) // Estoque insuficiente
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await expect(
                CondicionaisRepository.createCondicional(mockCondicionalData)
            ).rejects.toThrow('Estoque insuficiente para Camisa Polo. Disponível: 1, Solicitado: 2');
        });

        it('should create condicional items and update stock', async () => {
            const mockTx = {
                cliente: {
                    findUnique: jest.fn().mockResolvedValue(mockCliente)
                },
                roupas: {
                    findUnique: jest.fn().mockResolvedValue(mockRoupa1),
                    findFirst: jest.fn().mockResolvedValue(mockRoupa2),
                    update: jest.fn()
                },
                condicionais: {
                    create: jest.fn().mockResolvedValue(mockNovoCondicional),
                    findUnique: jest.fn().mockResolvedValue(mockCondicionalCompleto)
                },
                condicionaisItens: {
                    create: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await CondicionaisRepository.createCondicional(mockCondicionalData);

            expect(mockTx.condicionaisItens.create).toHaveBeenCalledTimes(2);
            expect(mockTx.roupas.update).toHaveBeenCalledTimes(2);
            expect(mockTx.roupas.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    quantidade: {
                        decrement: 2
                    }
                }
            });
        });
    });

    describe('updateCondicional', () => {
        const mockUpdateData = {
            data_devolucao: '2023-01-15',
            observacoes: 'Teste'
        };

        const mockUpdatedCondicional = {
            id: 1,
            data_devolucao: new Date('2023-01-15'),
            observacoes: 'Teste'
        };

        it('should update condicional successfully', async () => {
            prisma.condicionais.update.mockResolvedValue(mockUpdatedCondicional);

            const result = await CondicionaisRepository.updateCondicional(1, mockUpdateData);

            expect(result).toEqual(mockUpdatedCondicional);
            expect(prisma.condicionais.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    ...mockUpdateData,
                    data_devolucao: new Date('2023-01-15')
                },
                include: {
                    Cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            endereco: true
                        }
                    },
                    CondicionaisItens: {
                        include: {
                            Roupa: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipo: true,
                                    tamanho: true,
                                    cor: true,
                                    preco: true
                                }
                            }
                        }
                    }
                }
            });
        });

        it('should update without data_devolucao', async () => {
            const dataWithoutDate = { observacoes: 'Apenas observação' };
            prisma.condicionais.update.mockResolvedValue(mockUpdatedCondicional);

            await CondicionaisRepository.updateCondicional(1, dataWithoutDate);

            expect(prisma.condicionais.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        ...dataWithoutDate,
                        data_devolucao: undefined
                    }
                })
            );
        });
    });

    describe('devolverItem', () => {
        const mockItemCondicional = {
            id: 1,
            quatidade: 3,
            condicionais_id: 1,
            roupas_id: 1
        };

        it('should return partial quantity and update item', async () => {
            const mockTx = {
                condicionaisItens: {
                    findFirst: jest.fn().mockResolvedValue(mockItemCondicional),
                    update: jest.fn(),
                    count: jest.fn().mockResolvedValue(1)
                },
                roupas: {
                    update: jest.fn()
                },
                condicionais: {
                    update: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.devolverItem(1, 1, 2);

            expect(result).toEqual({
                quantidadeDevolvida: 2,
                itensRestantes: 1
            });

            expect(mockTx.condicionaisItens.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { quatidade: 1 }
            });

            expect(mockTx.roupas.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    quantidade: {
                        increment: 2
                    }
                }
            });
        });

        it('should remove item when returning all quantity', async () => {
            const mockTx = {
                condicionaisItens: {
                    findFirst: jest.fn().mockResolvedValue(mockItemCondicional),
                    delete: jest.fn(),
                    count: jest.fn().mockResolvedValue(0)
                },
                roupas: {
                    update: jest.fn()
                },
                condicionais: {
                    update: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.devolverItem(1, 1, 3);

            expect(result).toEqual({
                quantidadeDevolvida: 3,
                itensRestantes: 0
            });

            expect(mockTx.condicionaisItens.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });

            expect(mockTx.condicionais.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { devolvido: true }
            });
        });

        it('should throw error when item not found in condicional', async () => {
            const mockTx = {
                condicionaisItens: {
                    findFirst: jest.fn().mockResolvedValue(null)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await expect(
                CondicionaisRepository.devolverItem(1, 1, 2)
            ).rejects.toThrow('Item não encontrado no condicional');
        });

        it('should throw error when trying to return more than available', async () => {
            const mockTx = {
                condicionaisItens: {
                    findFirst: jest.fn().mockResolvedValue(mockItemCondicional)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await expect(
                CondicionaisRepository.devolverItem(1, 1, 5)
            ).rejects.toThrow('Quantidade a devolver (5) é maior que a quantidade no condicional (3)');
        });
    });

    describe('finalizarCondicional', () => {
        const mockItensCondicional = [
            {
                id: 1,
                roupas_id: 1,
                quatidade: 2,
                Roupa: { id: 1, nome: 'Camisa' }
            },
            {
                id: 2,
                roupas_id: 2,
                quatidade: 1,
                Roupa: { id: 2, nome: 'Calça' }
            }
        ];

        const mockCondicionalFinalizado = {
            id: 1,
            devolvido: true,
            Cliente: { id: 1, nome: 'João' }
        };

        it('should finalize condicional successfully', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue(mockItensCondicional),
                    delete: jest.fn()
                },
                roupas: {
                    update: jest.fn()
                },
                condicionais: {
                    update: jest.fn().mockResolvedValue(mockCondicionalFinalizado)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.finalizarCondicional(1);

            expect(result).toEqual(mockCondicionalFinalizado);
            expect(mockTx.roupas.update).toHaveBeenCalledTimes(2);
            expect(mockTx.condicionaisItens.delete).toHaveBeenCalledTimes(2);
            expect(mockTx.condicionais.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { devolvido: true },
                include: {
                    Cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            endereco: true
                        }
                    }
                }
            });
        });

        it('should finalize condicional with custom options', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue(mockItensCondicional),
                    delete: jest.fn()
                },
                roupas: {
                    update: jest.fn()
                },
                condicionais: {
                    update: jest.fn().mockResolvedValue(mockCondicionalFinalizado)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const opcoes = { devolvido: false, observacoes: 'Finalizado manualmente' };
            await CondicionaisRepository.finalizarCondicional(1, opcoes);

            expect(mockTx.condicionais.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { devolvido: false, observacoes: 'Finalizado manualmente' },
                include: expect.any(Object)
            });
        });

        it('should throw error when condicional has no items', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue([])
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await expect(
                CondicionaisRepository.finalizarCondicional(1)
            ).rejects.toThrow('Condicional não possui itens ou já foi finalizado');
        });

        it('should return stock for each item', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue(mockItensCondicional),
                    delete: jest.fn()
                },
                roupas: {
                    update: jest.fn()
                },
                condicionais: {
                    update: jest.fn().mockResolvedValue(mockCondicionalFinalizado)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await CondicionaisRepository.finalizarCondicional(1);

            expect(mockTx.roupas.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    quantidade: {
                        increment: 2
                    }
                }
            });

            expect(mockTx.roupas.update).toHaveBeenCalledWith({
                where: { id: 2 },
                data: {
                    quantidade: {
                        increment: 1
                    }
                }
            });
        });
    });

    describe('deleteCondicional', () => {
        const mockItensCondicional = [
            { id: 1, roupas_id: 1, quatidade: 2 },
            { id: 2, roupas_id: 2, quatidade: 1 }
        ];

        const mockCondicionalDeletado = { id: 1 };

        it('should delete condicional and return stock', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue(mockItensCondicional),
                    delete: jest.fn()
                },
                roupas: {
                    update: jest.fn()
                },
                condicionais: {
                    delete: jest.fn().mockResolvedValue(mockCondicionalDeletado)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.deleteCondicional(1);

            expect(result).toEqual(mockCondicionalDeletado);
            expect(mockTx.roupas.update).toHaveBeenCalledTimes(2);
            expect(mockTx.condicionaisItens.delete).toHaveBeenCalledTimes(2);
            expect(mockTx.condicionais.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should handle condicional with no items', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue([])
                },
                condicionais: {
                    delete: jest.fn().mockResolvedValue(mockCondicionalDeletado)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.deleteCondicional(1);

            expect(result).toEqual(mockCondicionalDeletado);
            expect(mockTx.condicionais.delete).toHaveBeenCalled();
        });
    });

    describe('getCondicionaisStats', () => {
        it('should return statistics without filters', async () => {
            prisma.condicionais.aggregate.mockResolvedValue({ _count: { id: 10 } });
            prisma.condicionais.count
                .mockResolvedValueOnce(3) // ativos
                .mockResolvedValueOnce(7); // devolvidos

            const result = await CondicionaisRepository.getCondicionaisStats();

            expect(result).toEqual({
                total_condicionais: 10,
                condicionais_ativos: 3,
                condicionais_devolvidos: 7
            });
        });

        it('should return statistics with date filter', async () => {
            prisma.condicionais.aggregate.mockResolvedValue({ _count: { id: 5 } });
            prisma.condicionais.count
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(3);

            const filters = {
                data_inicio: '2023-01-01',
                data_fim: '2023-01-31'
            };

            const result = await CondicionaisRepository.getCondicionaisStats(filters);

            expect(result.total_condicionais).toBe(5);
            expect(prisma.condicionais.aggregate).toHaveBeenCalledWith({
                where: {
                    data: {
                        gte: new Date('2023-01-01T00:00:00.000Z'),
                        lte: new Date('2023-01-31T23:59:59.999Z')
                    }
                },
                _count: { id: true }
            });
        });

        it('should handle null aggregate result', async () => {
            prisma.condicionais.aggregate.mockResolvedValue({ _count: { id: null } });
            prisma.condicionais.count
                .mockResolvedValueOnce(0)
                .mockResolvedValueOnce(0);

            const result = await CondicionaisRepository.getCondicionaisStats();

            expect(result.total_condicionais).toBe(0);
        });
    });

    describe('atualizarItensCondicional', () => {
        const mockItensAtuais = [
            { id: 1, roupas_id: 1, quatidade: 3 },
            { id: 2, roupas_id: 2, quatidade: 2 },
            { id: 3, roupas_id: 3, quatidade: 1 }
        ];

        const itensRestantes = [
            { roupas_id: 1, quantidade: 2 }, // Quantidade mudou
            { roupas_id: 2, quantidade: 2 }  // Quantidade mantida
            // Item 3 não está na lista, deve ser removido
        ];

        it('should update and remove items correctly', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue(mockItensAtuais),
                    delete: jest.fn(),
                    update: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await CondicionaisRepository.atualizarItensCondicional(1, itensRestantes);

            // Item 3 deve ser removido
            expect(mockTx.condicionaisItens.delete).toHaveBeenCalledWith({
                where: { id: 3 }
            });

            // Item 1 deve ter quantidade atualizada
            expect(mockTx.condicionaisItens.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { quatidade: 2 }
            });

            // Item 2 não deve ser atualizado (quantidade igual)
            expect(mockTx.condicionaisItens.update).not.toHaveBeenCalledWith({
                where: { id: 2 },
                data: expect.any(Object)
            });
        });

        it('should handle empty items list', async () => {
            const mockTx = {
                condicionaisItens: {
                    findMany: jest.fn().mockResolvedValue(mockItensAtuais),
                    delete: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await CondicionaisRepository.atualizarItensCondicional(1, []);

            expect(mockTx.condicionaisItens.delete).toHaveBeenCalledTimes(3);
        });
    });

    describe('devolverItemAoEstoque', () => {
        it('should return item to stock', async () => {
            prisma.roupas.update.mockResolvedValue({ id: 1 });

            await CondicionaisRepository.devolverItemAoEstoque(1, 5);

            expect(prisma.roupas.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    quantidade: {
                        increment: 5
                    }
                }
            });
        });
    });

    describe('atualizarStatusItens', () => {
        const roupasIds = [1, 2, 3];
        const novoStatus = 'em_condicional';

        const mockRoupas = [
            { id: 1, nome: 'Camisa' },
            { id: 2, nome: 'Calça' },
            { id: 3, nome: 'Tênis' }
        ];

        it('should update status for multiple items with history', async () => {
            const mockTx = {
                roupas: {
                    findUnique: jest.fn()
                        .mockResolvedValueOnce(mockRoupas[0])
                        .mockResolvedValueOnce(mockRoupas[1])
                        .mockResolvedValueOnce(mockRoupas[2])
                },
                historicoStatus: {
                    create: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            const result = await CondicionaisRepository.atualizarStatusItens(roupasIds, novoStatus);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                id: 1,
                nome: 'Camisa',
                status_anterior: 'disponivel',
                status_novo: 'em_condicional'
            });

            expect(mockTx.historicoStatus.create).toHaveBeenCalledTimes(3);
        });

        it('should update status without creating history', async () => {
            const mockTx = {
                roupas: {
                    findUnique: jest.fn()
                        .mockResolvedValueOnce(mockRoupas[0])
                },
                historicoStatus: {
                    create: jest.fn()
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await CondicionaisRepository.atualizarStatusItens([1], novoStatus, false);

            expect(mockTx.historicoStatus.create).not.toHaveBeenCalled();
        });

        it('should throw error when roupa not found', async () => {
            const mockTx = {
                roupas: {
                    findUnique: jest.fn().mockResolvedValue(null)
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

            await expect(
                CondicionaisRepository.atualizarStatusItens([999], novoStatus)
            ).rejects.toThrow('Roupa com ID 999 não encontrada');
        });
    });

    describe('relatorioCondicionaisAtivos', () => {
        const mockCondicionaisAtivos = [
            {
                id: 1,
                data_devolucao: new Date('2023-01-15'),
                Cliente: { id: 1, nome: 'João' },
                CondicionaisItens: [
                    {
                        quatidade: 2,
                        Roupa: { preco: 50 }
                    }
                ]
            },
            {
                id: 2,
                data_devolucao: new Date('2023-01-20'),
                Cliente: { id: 2, nome: 'Maria' },
                CondicionaisItens: [
                    {
                        quatidade: 1,
                        Roupa: { preco: 30 }
                    }
                ]
            }
        ];

        beforeEach(() => {
            // Mock da data atual para testes consistentes
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-10'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return active condicionais report', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionaisAtivos);

            const result = await CondicionaisRepository.relatorioCondicionaisAtivos();

            expect(result.condicionais).toEqual(mockCondicionaisAtivos);
            expect(result.estatisticas).toEqual({
                total_ativos: 2,
                total_itens: 3,
                valor_total: 130,
                vencidos: 0,
                a_vencer_em_7_dias: 1
            });
        });

        it('should apply filters correctly', async () => {
            prisma.condicionais.findMany.mockResolvedValue([]);

            const filtros = {
                cliente_id: 1,
                data_inicio: '2023-01-01',
                data_fim: '2023-01-31'
            };

            await CondicionaisRepository.relatorioCondicionaisAtivos(filtros);

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith({
                where: {
                    devolvido: false,
                    cliente_id: 1,
                    data: {
                        gte: new Date('2023-01-01T00:00:00.000Z'),
                        lte: new Date('2023-01-31T23:59:59.999Z')
                    }
                },
                include: expect.any(Object),
                orderBy: { data_devolucao: 'asc' }
            });
        });

        it('should filter expired condicionais', async () => {
            prisma.condicionais.findMany.mockResolvedValue([]);

            await CondicionaisRepository.relatorioCondicionaisAtivos({ vencidos: true });

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith({
                where: {
                    devolvido: false,
                    data_devolucao: {
                        lt: new Date('2023-01-10')
                    }
                },
                include: expect.any(Object),
                orderBy: { data_devolucao: 'asc' }
            });
        });
    });

    describe('relatorioCondicionaisDevolvidos', () => {
        const mockCondicionaisDevolvidos = [
            {
                id: 1,
                devolvido: true,
                Cliente: { id: 1, nome: 'João' },
                CondicionaisItens: [
                    {
                        quatidade: 2,
                        Roupa: { preco: 50 }
                    }
                ]
            }
        ];

        it('should return devolved condicionais report', async () => {
            prisma.condicionais.findMany.mockResolvedValue(mockCondicionaisDevolvidos);

            const result = await CondicionaisRepository.relatorioCondicionaisDevolvidos();

            expect(result.condicionais).toEqual(mockCondicionaisDevolvidos);
            expect(result.estatisticas).toEqual({
                total_devolvidos: 1,
                total_itens_devolvidos: 2,
                valor_total_devolvido: 100
            });
        });

        it('should apply filters correctly', async () => {
            prisma.condicionais.findMany.mockResolvedValue([]);

            const filtros = {
                cliente_id: 1,
                data_inicio: '2023-01-01',
                data_fim: '2023-01-31'
            };

            await CondicionaisRepository.relatorioCondicionaisDevolvidos(filtros);

            expect(prisma.condicionais.findMany).toHaveBeenCalledWith({
                where: {
                    devolvido: true,
                    cliente_id: 1,
                    data: {
                        gte: new Date('2023-01-01T00:00:00.000Z'),
                        lte: new Date('2023-01-31T23:59:59.999Z')
                    }
                },
                include: expect.any(Object),
                orderBy: { data: 'desc' }
            });
        });
    });

    describe('buscarPorId', () => {
        it('should call getCondicionalById', async () => {
            const mockCondicional = { id: 1, nome: 'Test' };
            prisma.condicionais.findUnique.mockResolvedValue(mockCondicional);

            const result = await CondicionaisRepository.buscarPorId(1);

            expect(result).toEqual(mockCondicional);
        });
    });
});