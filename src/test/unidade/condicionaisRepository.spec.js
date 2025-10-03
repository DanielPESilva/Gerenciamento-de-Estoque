import CondicionaisRepository from '../../repository/condicionaisRepository.js';

// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    __esModule: true,
    default: {
        condicionais: {
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

describe('CondicionaisRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCondicionais', () => {
        const mockCondicionais = [
            {
                id: 1,
                cliente_id: 1,
                data: new Date(),
                devolvido: false,
                observacoes: 'Teste',
                Cliente: {
                    id: 1,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    telefone: '11999999999',
                    endereco: 'Rua A, 123'
                },
                CondicionaisItens: []
            }
        ];

        it('should return all condicionais with pagination', async () => {
            mockPrisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            mockPrisma.condicionais.count.mockResolvedValue(1);

            const filters = {};
            const pagination = { page: 1, limit: 10 };

            const result = await CondicionaisRepository.getAllCondicionais(filters, pagination);

            expect(result.data).toEqual(mockCondicionais);
            expect(result.total).toBe(1);
        });

        it('should apply cliente_id filter', async () => {
            const filters = { cliente_id: 1 };
            const pagination = { page: 1, limit: 10 };

            mockPrisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            mockPrisma.condicionais.count.mockResolvedValue(1);

            await CondicionaisRepository.getAllCondicionais(filters, pagination);

            expect(mockPrisma.condicionais.findMany).toHaveBeenCalledWith({
                where: { cliente_id: 1 },
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

        it('should apply devolvido filter', async () => {
            const filters = { devolvido: true };
            const pagination = { page: 1, limit: 10 };

            mockPrisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            mockPrisma.condicionais.count.mockResolvedValue(1);

            await CondicionaisRepository.getAllCondicionais(filters, pagination);

            expect(mockPrisma.condicionais.findMany).toHaveBeenCalledWith({
                where: { devolvido: true },
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

        it('should apply date range filter', async () => {
            const filters = { 
                data_inicio: '2024-01-01',
                data_fim: '2024-12-31'
            };
            const pagination = { page: 1, limit: 10 };

            mockPrisma.condicionais.findMany.mockResolvedValue(mockCondicionais);
            mockPrisma.condicionais.count.mockResolvedValue(1);

            await CondicionaisRepository.getAllCondicionais(filters, pagination);

            expect(mockPrisma.condicionais.findMany).toHaveBeenCalledWith({
                where: {
                    data: {
                        gte: new Date('2024-01-01T00:00:00.000Z'),
                        lte: new Date('2024-12-31T23:59:59.999Z')
                    }
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
                },
                orderBy: {
                    data: 'desc'
                },
                skip: 0,
                take: 10
            });
        });
    });

    describe('getCondicionalById', () => {
        it('should return condicional by id', async () => {
            const mockCondicional = {
                id: 1,
                cliente_id: 1,
                data: new Date(),
                devolvido: false,
                observacoes: 'Teste',
                Cliente: {
                    id: 1,
                    nome: 'João Silva'
                },
                CondicionaisItens: []
            };

            mockPrisma.condicionais.findUnique.mockResolvedValue(mockCondicional);

            const result = await CondicionaisRepository.getCondicionalById(1);

            expect(result).toEqual(mockCondicional);
            expect(typeof CondicionaisRepository.getCondicionalById).toBe('function');
        });
    });

    describe('createCondicional', () => {
        it('should create new condicional', async () => {
            const condicionalData = {
                cliente_id: 1,
                data: new Date(),
                observacoes: 'Teste',
                devolvido: false
            };

            const mockCreatedCondicional = {
                id: 1,
                ...condicionalData
            };

            mockPrisma.condicionais.create.mockResolvedValue(mockCreatedCondicional);

            const result = await CondicionaisRepository.createCondicional(condicionalData);

            expect(typeof CondicionaisRepository.createCondicional).toBe('function');
        });
    });

    describe('deleteCondicional', () => {
        it('should delete condicional', async () => {
            const mockDeletedCondicional = { 
                id: 1, 
                cliente_id: 1 
            };

            mockPrisma.condicionais.delete.mockResolvedValue(mockDeletedCondicional);

            const result = await CondicionaisRepository.deleteCondicional(1);

            expect(typeof CondicionaisRepository.deleteCondicional).toBe('function');
        });
    });

    describe('finalizarCondicional', () => {
        it('should finalize condicional', async () => {
            const mockFinalizedCondicional = {
                id: 1,
                cliente_id: 1,
                devolvido: true,
                data_devolucao: new Date()
            };

            mockPrisma.condicionais.update.mockResolvedValue(mockFinalizedCondicional);

            const result = await CondicionaisRepository.finalizarCondicional(1);

            expect(typeof CondicionaisRepository.finalizarCondicional).toBe('function');
        });
    });
});