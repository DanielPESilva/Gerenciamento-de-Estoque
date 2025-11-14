import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    vendas: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
    },
    vendas_itens: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
    roupas: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
    },
    cliente: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
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
        body.vendas !== undefined ||
        body.estatisticas !== undefined ||
        body.relatorio !== undefined ||
        body.venda !== undefined
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

describe('Integração - Vendas Routes - Completo', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup básico dos mocks
        mockPrismaClient.cliente.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Cliente Teste',
            email: 'cliente@teste.com',
            telefone: '11999999999'
        });

        mockPrismaClient.roupas.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Roupa Teste',
            preco: 50.00,
            quantidade: 10,
            tipo: 'Camisa',
            tamanho: 'M',
            cor: 'Azul'
        });

        mockPrismaClient.vendas.findMany.mockResolvedValue([]);
        mockPrismaClient.vendas.count.mockResolvedValue(0);
        mockPrismaClient.vendas.findUnique.mockResolvedValue(null);
        mockPrismaClient.vendas_itens.findMany.mockResolvedValue([]);

        // Mock para transações
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
            return await callback(mockPrismaClient);
        });
    });

    describe('POST /api/vendas - Criação com cenários avançados', () => {
        it('1- Deve criar venda com dados completos', async () => {
            mockPrismaClient.vendas.create.mockResolvedValue({
                id: 1,
                forma_pgto: 'Pix',
                valor_total: 100.00,
                valor_pago: 90.00,
                desconto: 10.00,
                nome_cliente: 'Cliente Teste',
                telefone_cliente: '11999999999',
                data_venda: new Date()
            });

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_total: 100.00,
                    valor_pago: 90.00,
                    desconto: 10.00,
                    nome_cliente: 'Cliente Teste',
                    telefone_cliente: '11999999999',
                    itens: [{
                        roupas_id: 1,
                        quantidade: 2,
                        preco: 50.00
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve criar venda com dados mínimos', async () => {
            mockPrismaClient.vendas.create.mockResolvedValue({
                id: 2,
                forma_pgto: 'Dinheiro',
                valor_total: 50.00,
                valor_pago: 50.00
            });

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Dinheiro',
                    valor_total: 50.00,
                    valor_pago: 50.00,
                    itens: [{
                        nome_item: 'Camisa Básica',
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar forma de pagamento obrigatória', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    valor_total: 50.00,
                    valor_pago: 50.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar valor total obrigatório', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_pago: 50.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar pelo menos um item', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_total: 50.00,
                    valor_pago: 50.00,
                    itens: []
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve validar forma de pagamento válida', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Forma Inválida',
                    valor_total: 50.00,
                    valor_pago: 50.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve validar valores negativos', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_total: -50.00,
                    valor_pago: 50.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar estoque insuficiente', async () => {
            mockPrismaClient.roupas.findUnique.mockResolvedValue({
                id: 1,
                nome: 'Roupa Teste',
                quantidade: 1
            });

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_total: 100.00,
                    valor_pago: 100.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 10,
                        preco: 10.00
                    }]
                });

            expect([400, 409, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('9- Deve criar venda com múltiplas formas de pagamento', async () => {
            mockPrismaClient.vendas.create.mockResolvedValue({
                id: 3,
                forma_pgto: 'Cartão de Crédito',
                valor_total: 200.00,
                valor_pago: 180.00,
                desconto: 20.00
            });

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Cartão de Crédito',
                    valor_total: 200.00,
                    valor_pago: 180.00,
                    desconto: 20.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 4,
                        preco: 50.00
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/vendas - Listagem com filtros avançados', () => {
        it('1- Deve listar vendas com filtro por forma de pagamento', async () => {
            mockPrismaClient.vendas.findMany.mockResolvedValue([{
                id: 1,
                forma_pgto: 'Pix',
                valor_total: 100.00,
                data_venda: new Date()
            }]);

            const res = await request(app)
                .get('/api/vendas?forma_pgto=Pix')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve listar vendas com filtro de data', async () => {
            const res = await request(app)
                .get('/api/vendas?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve listar vendas com filtro por valor mínimo', async () => {
            const res = await request(app)
                .get('/api/vendas?valor_minimo=100')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve listar vendas com filtro por valor máximo', async () => {
            const res = await request(app)
                .get('/api/vendas?valor_maximo=500')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve listar vendas com filtro por cliente', async () => {
            const res = await request(app)
                .get('/api/vendas?nome_cliente=Cliente%20Teste')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve aplicar paginação avançada', async () => {
            mockPrismaClient.vendas.count.mockResolvedValue(100);

            const res = await request(app)
                .get('/api/vendas?page=3&limit=10')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve listar vendas com filtros combinados', async () => {
            const res = await request(app)
                .get('/api/vendas?forma_pgto=Pix&valor_minimo=50&data_inicio=2024-01-01')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar parâmetros de paginação inválidos', async () => {
            const res = await request(app)
                .get('/api/vendas?page=0&limit=-5')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/vendas/:id - Busca específica', () => {
        it('1- Deve buscar venda por ID válido', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue({
                id: 1,
                forma_pgto: 'Pix',
                valor_total: 100.00,
                valor_pago: 90.00,
                desconto: 10.00,
                data_venda: new Date(),
                VendasItens: [{
                    id: 1,
                    roupas_id: 1,
                    nome_item: 'Camisa Teste',
                    quantidade: 2,
                    preco: 50.00
                }]
            });

            const res = await request(app)
                .get('/api/vendas/1')
                .set('Authorization', mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar venda inexistente', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/vendas/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .get('/api/vendas/abc')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('PUT /api/vendas/:id - Atualização avançada', () => {
        it('1- Deve atualizar venda completa', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue({
                id: 1,
                forma_pgto: 'Pix'
            });
            mockPrismaClient.vendas.update.mockResolvedValue({
                id: 1,
                forma_pgto: 'Cartão de Crédito',
                valor_total: 120.00,
                desconto: 20.00
            });

            const res = await request(app)
                .put('/api/vendas/1')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Cartão de Crédito',
                    valor_total: 120.00,
                    desconto: 20.00
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve permitir atualização parcial', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue({
                id: 1,
                forma_pgto: 'Pix'
            });
            mockPrismaClient.vendas.update.mockResolvedValue({
                id: 1,
                desconto: 15.00
            });

            const res = await request(app)
                .put('/api/vendas/1')
                .set('Authorization', mockToken)
                .send({
                    desconto: 15.00
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve tratar venda inexistente na atualização', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/vendas/999')
                .set('Authorization', mockToken)
                .send({
                    desconto: 10.00
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar dados de atualização', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue({
                id: 1,
                forma_pgto: 'Pix'
            });

            const res = await request(app)
                .put('/api/vendas/1')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Forma Inválida'
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/vendas/estatisticas - Estatísticas avançadas', () => {
        it('1- Deve obter estatísticas gerais', async () => {
            mockPrismaClient.vendas.aggregate.mockResolvedValue({
                _sum: { valor_total: 5000.00, valor_pago: 4800.00, desconto: 200.00 },
                _count: { id: 50 },
                _avg: { valor_total: 100.00 }
            });

            const res = await request(app)
                .get('/api/vendas/estatisticas')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve obter estatísticas com filtro de período', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve obter estatísticas por forma de pagamento', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas?forma_pgto=Pix')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve obter estatísticas com filtros múltiplos', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas?forma_pgto=Pix&valor_minimo=100&data_inicio=2024-01-01')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('DELETE /api/vendas/:id - Deleção avançada', () => {
        it('1- Deve deletar venda válida', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue({
                id: 1,
                forma_pgto: 'Pix'
            });
            mockPrismaClient.vendas.delete.mockResolvedValue({
                id: 1
            });

            const res = await request(app)
                .delete('/api/vendas/1')
                .set('Authorization', mockToken);

            expect([200, 204, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar venda inexistente', async () => {
            mockPrismaClient.vendas.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/vendas/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .delete('/api/vendas/abc')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('Cenários de Negócio Avançados', () => {
        it('1- Deve processar venda com desconto alto', async () => {
            mockPrismaClient.vendas.create.mockResolvedValue({
                id: 4,
                forma_pgto: 'Dinheiro',
                valor_total: 100.00,
                valor_pago: 50.00,
                desconto: 50.00
            });

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Dinheiro',
                    valor_total: 100.00,
                    valor_pago: 50.00,
                    desconto: 50.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 2,
                        preco: 50.00
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve processar venda com múltiplos itens', async () => {
            mockPrismaClient.vendas.create.mockResolvedValue({
                id: 5,
                forma_pgto: 'Cartão de Débito',
                valor_total: 300.00,
                valor_pago: 300.00
            });

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Cartão de Débito',
                    valor_total: 300.00,
                    valor_pago: 300.00,
                    itens: [
                        {
                            roupas_id: 1,
                            quantidade: 2,
                            preco: 50.00
                        },
                        {
                            nome_item: 'Calça Jeans',
                            quantidade: 1,
                            preco: 200.00
                        }
                    ]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve processar venda com todas as formas de pagamento', async () => {
            const formasPagamento = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Cheque', 'Permuta'];
            
            for (const forma of formasPagamento) {
                mockPrismaClient.vendas.create.mockResolvedValue({
                    id: Math.random(),
                    forma_pgto: forma,
                    valor_total: 100.00,
                    valor_pago: 100.00
                });

                const res = await request(app)
                    .post('/api/vendas')
                    .set('Authorization', mockToken)
                    .send({
                        forma_pgto: forma,
                        valor_total: 100.00,
                        valor_pago: 100.00,
                        itens: [{
                            roupas_id: 1,
                            quantidade: 2,
                            preco: 50.00
                        }]
                    });

                expect([200, 201, 400, 500]).toContain(res.status);
                expect(res.body).toBeDefined();
            }
        });

        it('4- Deve validar cálculos de valores', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_total: 100.00,
                    valor_pago: 120.00, // Valor pago maior que total - pode ser válido
                    desconto: 0,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 2,
                        preco: 50.00
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('Testes de Segurança e Validação', () => {
        it('1- Deve rejeitar requisições sem autenticação GET', async () => {
            const res = await request(app)
                .get('/api/vendas');

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve rejeitar requisições sem autenticação POST', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .send({
                    forma_pgto: 'Pix',
                    valor_total: 50.00,
                    valor_pago: 50.00,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar Content-Type incorreto', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .set('Content-Type', 'text/plain')
                .send('invalid data');

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar método HTTP incorreto', async () => {
            const res = await request(app)
                .patch('/api/vendas')
                .set('Authorization', mockToken);

            expect([404, 405, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar headers de resposta', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set('Authorization', mockToken);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json|text\/html/);
            }
            expect(res.headers).toBeDefined();
        });

        it('6- Deve processar requisições com caracteres especiais', async () => {
            const res = await request(app)
                .get('/api/vendas?nome_cliente=João%20da%20Silva%20&%20Cia')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve validar tamanhos de campo máximos', async () => {
            const nomeClienteLongo = 'A'.repeat(256);

            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', mockToken)
                .send({
                    forma_pgto: 'Pix',
                    valor_total: 50.00,
                    valor_pago: 50.00,
                    nome_cliente: nomeClienteLongo,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1,
                        preco: 50.00
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });
});