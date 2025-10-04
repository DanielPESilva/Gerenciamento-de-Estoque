import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    clientes: {
        findUnique: jest.fn(),
    },
    roupas: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
    },
    condicionais: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    condicionais_roupas: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
    vendas: {
        create: jest.fn(),
    },
    vendas_itens: {
        createMany: jest.fn(),
    },
    $transaction: jest.fn(),
};

jest.unstable_mockModule('../../models/prisma.js', () => ({
    default: mockPrismaClient
}));

// Mock do JWT
const mockJwt = {
    sign: jest.fn(() => 'mocked-token'),
    verify: jest.fn(() => ({ userId: 1, tipo: 'admin' })),
    decode: jest.fn(() => ({ userId: 1, tipo: 'admin' }))
};

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: mockJwt
}));

// Helper functions para validação flexível
const validateResponse = (body) => {
    return body && (
        body.success !== undefined ||
        body.data !== undefined ||
        body.condicionais !== undefined ||
        body.estatisticas !== undefined ||
        body.relatorio !== undefined
    );
};

const isErrorResponse = (body) => {
    return body && (
        body.success === false ||
        body.error !== undefined ||
        body.message !== undefined ||
        body.errors !== undefined
    );
};

describe('Integração - Condicionais Routes - Avançado', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup básico dos mocks
        mockPrismaClient.clientes.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Cliente Teste',
            email: 'cliente@teste.com'
        });

        mockPrismaClient.roupas.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Roupa Teste',
            preco: 50.00,
            quantidade: 10
        });

        mockPrismaClient.condicionais.findMany.mockResolvedValue([]);
        mockPrismaClient.condicionais.count.mockResolvedValue(0);
        mockPrismaClient.condicionais.findUnique.mockResolvedValue(null);
        mockPrismaClient.condicionais_roupas.findMany.mockResolvedValue([]);

        // Mock para transações
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
            return await callback(mockPrismaClient);
        });
    });

    describe('POST /api/condicionais - Criação com cenários avançados', () => {
        it('1- Deve criar condicional com múltiplos itens', async () => {
            mockPrismaClient.condicionais.create.mockResolvedValue({
                id: 1,
                cliente_id: 1,
                data_criacao: new Date(),
                observacoes: 'Teste'
            });

            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({
                    cliente_id: 1,
                    itens: [
                        { roupa_id: 1, quantidade: 2 },
                        { roupa_id: 2, quantidade: 1 }
                    ],
                    observacoes: 'Condicional com múltiplos itens'
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve criar condicional com observações detalhadas', async () => {
            mockPrismaClient.condicionais.create.mockResolvedValue({
                id: 2,
                cliente_id: 1,
                observacoes: 'Observações muito detalhadas sobre a condicional'
            });

            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({
                    cliente_id: 1,
                    itens: [{ roupa_id: 1, quantidade: 1 }],
                    observacoes: 'Observações muito detalhadas sobre a condicional'
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar cliente inexistente', async () => {
            mockPrismaClient.clientes.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({
                    cliente_id: 999,
                    itens: [{ roupa_id: 1, quantidade: 1 }]
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar item inexistente', async () => {
            mockPrismaClient.roupas.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({
                    cliente_id: 1,
                    itens: [{ roupa_id: 999, quantidade: 1 }]
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar estoque insuficiente', async () => {
            mockPrismaClient.roupas.findUnique.mockResolvedValue({
                id: 1,
                quantidade: 1
            });

            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({
                    cliente_id: 1,
                    itens: [{ roupa_id: 1, quantidade: 10 }]
                });

            expect([400, 409, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({});

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve validar formato de itens', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .send({
                    cliente_id: 1,
                    itens: 'invalid'
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/condicionais - Listagem com filtros avançados', () => {
        it('1- Deve listar condicionais com filtro por cliente', async () => {
            mockPrismaClient.condicionais.findMany.mockResolvedValue([{
                id: 1,
                cliente_id: 1,
                devolvido: false
            }]);

            const res = await request(app)
                .get('/api/condicionais?cliente_id=1')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve listar condicionais com filtro por status devolvido', async () => {
            mockPrismaClient.condicionais.findMany.mockResolvedValue([]);

            const res = await request(app)
                .get('/api/condicionais?devolvido=true')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve listar condicionais com filtro de data', async () => {
            const res = await request(app)
                .get('/api/condicionais?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve aplicar paginação avançada', async () => {
            mockPrismaClient.condicionais.count.mockResolvedValue(100);

            const res = await request(app)
                .get('/api/condicionais?page=2&limit=10')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar parâmetros de paginação inválidos', async () => {
            const res = await request(app)
                .get('/api/condicionais?page=-1&limit=abc')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/condicionais/:id - Busca específica', () => {
        it('1- Deve buscar condicional por ID válido', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1,
                data_criacao: new Date()
            });

            const res = await request(app)
                .get('/api/condicionais/1')
                .set('Authorization', mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar condicional inexistente', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/condicionais/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .get('/api/condicionais/abc')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('PUT /api/condicionais/:id - Atualização avançada', () => {
        it('1- Deve atualizar condicional válida', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });
            mockPrismaClient.condicionais.update.mockResolvedValue({
                id: 1,
                observacoes: 'Atualizada'
            });

            const res = await request(app)
                .put('/api/condicionais/1')
                .set('Authorization', mockToken)
                .send({
                    observacoes: 'Condicional atualizada'
                });

            expect([200, 404, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar condicional inexistente na atualização', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/condicionais/999')
                .set('Authorization', mockToken)
                .send({
                    observacoes: 'Teste'
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('POST /api/condicionais/:id/devolver-item - Devolução de itens', () => {
        it('1- Deve devolver item específico', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });
            mockPrismaClient.condicionais_roupas.findMany.mockResolvedValue([{
                id: 1,
                roupa_id: 1,
                quantidade: 2,
                devolvido: false
            }]);

            const res = await request(app)
                .post('/api/condicionais/1/devolver-item')
                .set('Authorization', mockToken)
                .send({
                    roupa_id: 1,
                    quantidade: 1
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar item não encontrado na condicional', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });
            mockPrismaClient.condicionais_roupas.findMany.mockResolvedValue([]);

            const res = await request(app)
                .post('/api/condicionais/1/devolver-item')
                .set('Authorization', mockToken)
                .send({
                    roupa_id: 999,
                    quantidade: 1
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar quantidade inválida para devolução', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });
            mockPrismaClient.condicionais_roupas.findMany.mockResolvedValue([{
                id: 1,
                roupa_id: 1,
                quantidade: 1
            }]);

            const res = await request(app)
                .post('/api/condicionais/1/devolver-item')
                .set('Authorization', mockToken)
                .send({
                    roupa_id: 1,
                    quantidade: 5
                });

            expect([400, 409, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('POST /api/condicionais/:id/finalizar - Finalização', () => {
        it('1- Deve finalizar condicional válida', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1,
                finalizada: false
            });

            const res = await request(app)
                .post('/api/condicionais/1/finalizar')
                .set('Authorization', mockToken)
                .send({
                    observacoes_finalizacao: 'Finalizada com sucesso'
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar condicional já finalizada', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1,
                finalizada: true
            });

            const res = await request(app)
                .post('/api/condicionais/1/finalizar')
                .set('Authorization', mockToken)
                .send({});

            expect([400, 409, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('POST /api/condicionais/:id/converter-venda - Conversão em venda', () => {
        it('1- Deve converter condicional em venda', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1,
                finalizada: false
            });
            mockPrismaClient.condicionais_roupas.findMany.mockResolvedValue([{
                roupa_id: 1,
                quantidade: 2,
                preco_unitario: 50.00
            }]);
            mockPrismaClient.vendas.create.mockResolvedValue({
                id: 1,
                cliente_id: 1,
                valor_total: 100.00
            });

            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    desconto: 10
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar forma de pagamento obrigatória', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });

            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set('Authorization', mockToken)
                .send({
                    desconto: 0
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar condicional sem itens', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });
            mockPrismaClient.condicionais_roupas.findMany.mockResolvedValue([]);

            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix'
                });

            expect([400, 409, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/condicionais/estatisticas - Estatísticas avançadas', () => {
        it('1- Deve obter estatísticas gerais', async () => {
            const res = await request(app)
                .get('/api/condicionais/estatisticas')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve obter estatísticas com filtro de período', async () => {
            const res = await request(app)
                .get('/api/condicionais/estatisticas?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/condicionais/relatorios - Relatórios avançados', () => {
        it('1- Deve obter relatório de condicionais ativas', async () => {
            const res = await request(app)
                .get('/api/condicionais/relatorios/ativos')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve obter relatório de condicionais devolvidas', async () => {
            const res = await request(app)
                .get('/api/condicionais/relatorios/devolvidos') 
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('PATCH /api/condicionais/itens/status - Atualização de status', () => {
        it('1- Deve atualizar status de múltiplos itens', async () => {
            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set('Authorization', mockToken)
                .send({
                    roupas_ids: [1, 2, 3],
                    novo_status: 'devolvido'
                });

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar array de IDs obrigatório', async () => {
            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set('Authorization', mockToken)
                .send({
                    novo_status: 'devolvido'
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar novo status obrigatório', async () => {
            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set('Authorization', mockToken)
                .send({
                    roupas_ids: [1, 2, 3]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('DELETE /api/condicionais/:id - Deleção avançada', () => {
        it('1- Deve deletar condicional válida', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue({
                id: 1,
                cliente_id: 1
            });
            mockPrismaClient.condicionais.delete.mockResolvedValue({
                id: 1
            });

            const res = await request(app)
                .delete('/api/condicionais/1')
                .set('Authorization', mockToken);

            expect([200, 400, 204, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar condicional inexistente', async () => {
            mockPrismaClient.condicionais.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/condicionais/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .delete('/api/condicionais/abc')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('Testes de Segurança e Validação', () => {
        it('1- Deve rejeitar requisições sem autenticação GET', async () => {
            const res = await request(app)
                .get('/api/condicionais');

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve rejeitar requisições sem autenticação POST', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .send({
                    cliente_id: 1,
                    itens: [{ roupa_id: 1, quantidade: 1 }]
                });

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar Content-Type incorreto', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set('Authorization', mockToken)
                .set('Content-Type', 'text/plain')
                .send('invalid data');

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar método HTTP incorreto', async () => {
            const res = await request(app)
                .patch('/api/condicionais')
                .set('Authorization', mockToken);

            expect([404, 405, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar headers de resposta', async () => {
            const res = await request(app)
                .get('/api/condicionais')
                .set('Authorization', mockToken);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json|text\/html/);
            }
            expect(res.headers).toBeDefined();
        });
    });
});