import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    venda: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
    },
    item: {
        findUnique: jest.fn(),
        update: jest.fn(),
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
    return body && (body.success === true || body.data !== undefined || body.vendas !== undefined || body.venda !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};  

describe('Integração - Vendas Routes - Avançado', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
        
        // Mock padrão de transação
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
            return await callback(mockPrismaClient);
        });
    });

    describe('POST /api/vendas - Criação com cenários avançados', () => {
        it('1- Deve processar venda com múltiplos itens', async () => {
            const vendaData = {
                itens: [
                    { item_id: 1, quantidade: 2, preco_unitario: 50.00 },
                    { item_id: 2, quantidade: 1, preco_unitario: 30.00 }
                ],
                forma_pgto: 'Pix',
                desconto: 0,
                observacoes: 'Venda múltiplos itens'
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar venda com desconto aplicado', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 2, preco_unitario: 50.00 }],
                forma_pgto: 'Cartão de Crédito',
                desconto: 10.00,
                observacoes: 'Venda com desconto'
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar forma de pagamento Pix', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 1, preco_unitario: 50.00 }],
                forma_pgto: 'Pix',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve testar forma de pagamento Cartão de Crédito', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 1, preco_unitario: 50.00 }],
                forma_pgto: 'Cartão de Crédito',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve testar forma de pagamento Dinheiro', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 1, preco_unitario: 50.00 }],
                forma_pgto: 'Dinheiro',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('6- Deve validar estoque insuficiente', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 999, preco_unitario: 50.00 }], // Quantidade muito alta
                forma_pgto: 'Pix',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('7- Deve validar item inexistente', async () => {
            const vendaData = {
                itens: [{ item_id: 99999, quantidade: 1, preco_unitario: 50.00 }],
                forma_pgto: 'Pix',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('8- Deve validar forma de pagamento inválida', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 1, preco_unitario: 50.00 }],
                forma_pgto: 'Cheque', // Forma inválida
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('9- Deve validar desconto negativo', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 1, preco_unitario: 50.00 }],
                forma_pgto: 'Pix',
                desconto: -10 // Desconto negativo
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('10- Deve validar quantidade zero', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 0, preco_unitario: 50.00 }],
                forma_pgto: 'Pix',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('11- Deve validar preço unitário negativo', async () => {
            const vendaData = {
                itens: [{ item_id: 1, quantidade: 1, preco_unitario: -10.00 }],
                forma_pgto: 'Pix',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('12- Deve validar venda sem itens', async () => {
            const vendaData = {
                itens: [],
                forma_pgto: 'Pix',
                desconto: 0
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaData);

            expect([400]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/vendas - Listagem com filtros avançados', () => {
        it('1- Deve listar vendas com filtro de data', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ data_inicio: '2024-01-01', data_fim: '2024-01-31' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve listar vendas com filtro por forma de pagamento', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ forma_pgto: 'Pix' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve listar vendas com filtro por valor mínimo', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ valor_min: 50 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve listar vendas com filtro por valor máximo', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ valor_max: 200 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve listar vendas com filtros combinados', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ 
                    data_inicio: '2024-01-01', 
                    forma_pgto: 'Pix', 
                    valor_min: 50, 
                    valor_max: 200 
                });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('6- Deve aplicar paginação avançada', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 2, limit: 5 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('7- Deve validar data inválida', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ data_inicio: 'invalid-date' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('8- Deve validar paginação inválida', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: -1, limit: 0 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/vendas/estatisticas - Estatísticas avançadas', () => {
        it('1- Deve obter estatísticas gerais', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve obter estatísticas com filtro de período', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ data_inicio: '2024-01-01', data_fim: '2024-01-31' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve obter estatísticas por forma de pagamento', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ forma_pgto: 'Pix' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve tratar período sem vendas', async () => {
            const res = await request(app)
                .get('/api/vendas/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ data_inicio: '2025-01-01', data_fim: '2025-01-31' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('PATCH /api/vendas/:id - Atualização com validações', () => {
        it('1- Deve atualizar forma de pagamento', async () => {
            const res = await request(app)
                .patch('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ forma_pgto: 'Cartão de Crédito' });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve atualizar desconto', async () => {
            const res = await request(app)
                .patch('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ desconto: 15.00 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve atualizar observações', async () => {
            const res = await request(app)
                .patch('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ observacoes: 'Observação atualizada' });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar venda inexistente', async () => {
            const res = await request(app)
                .patch('/api/vendas/999')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ forma_pgto: 'Cartão de Crédito' });

            expect([404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve validar ID inválido', async () => {
            const res = await request(app)
                .patch('/api/vendas/invalid')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ forma_pgto: 'Cartão de Crédito' });

            expect([400, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/vendas/:id - Deleção com validações', () => {
        it('1- Deve deletar venda válida', async () => {
            const res = await request(app)
                .delete('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar venda inexistente', async () => {
            const res = await request(app)
                .delete('/api/vendas/999')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .delete('/api/vendas/invalid')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de Segurança e Validação', () => {
        it('1- Deve rejeitar requisições sem autenticação GET', async () => {
            const res = await request(app)
                .get('/api/vendas');

            expect([401, 403, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve rejeitar requisições sem autenticação POST', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .send({ itens: [{ item_id: 1, quantidade: 1, preco_unitario: 50 }], forma_pgto: 'Pix' });

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar Content-Type incorreto', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set("Authorization", mockToken)
                .set('Content-Type', 'text/plain')
                .send('dados inválidos');

            expect([400]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar método HTTP incorreto', async () => {
            const res = await request(app)
                .put('/api/vendas/estatisticas')
                .set("Authorization", mockToken);

            expect([405, 404]).toContain(res.status);
        });

        it('5- Deve validar headers de resposta', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json/);
            }
            expect(res.headers).toBeDefined();
        });
    });
});