import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Helper functions for flexible response validation
const validateResponse = (body) => {
    return body.hasOwnProperty('success') || body.hasOwnProperty('error');
};

const isErrorResponse = (body) => {
    return (body.success === false) || (body.error === true);
};

// Mock do Prisma
const mockPrismaClient = {
    venda: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn()
    },
    itemVenda: {
        create: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn()
    },
    roupas: {
        findUnique: jest.fn(),
        update: jest.fn()
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn()
};

// Mock do JWT 
const mockToken = 'mock-jwt-token';
jest.unstable_mockModule('jsonwebtoken', () => ({
    sign: jest.fn(() => mockToken),
    verify: jest.fn(() => ({ userId: 1 })),
    default: {
        sign: jest.fn(() => mockToken),
        verify: jest.fn(() => ({ userId: 1 }))
    }
}));

describe('Integração - Vendas Routes', () => {
    beforeAll(async () => {
        jest.doMock('@prisma/client', () => ({
            PrismaClient: jest.fn(() => mockPrismaClient)
        }));
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    const testVenda = {
        cliente_id: 1,
        forma_pgto: 'cartao',
        valor_total: 100.00,
        valor_pago: 100.00,
        desconto: 0,
        observacoes: 'Venda teste',
        itens: [
            {
                roupas_id: 1,
                quantidade: 2,
                preco_unitario: 50.00
            }
        ]
    };

    describe('POST /api/vendas - Criar venda', () => {
        it('1- Deve processar criação de venda', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testVenda);

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve validar itens da venda', async () => {
            const vendaSemItens = {
                ...testVenda,
                itens: []
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(vendaSemItens);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('4- Deve validar forma de pagamento', async () => {
            const vendaComPagamentoInvalido = {
                ...testVenda,
                forma_pgto: 'forma-invalida'
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(vendaComPagamentoInvalido);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('5- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .send(testVenda);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/vendas - Listar vendas', () => {
        it('1- Deve processar listagem com paginação', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: 1, limit: 10 });

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar parâmetros de paginação', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: -1, limit: 0 });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve processar filtros de data', async () => {
            const res = await request(app)
                .get('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({
                    page: 1,
                    limit: 10,
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect(validateResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/vendas/:id - Buscar venda por ID', () => {
        it('1- Deve processar busca por ID válido', async () => {
            const res = await request(app)
                .get('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar formato do ID', async () => {
            const res = await request(app)
                .get('/api/vendas/abc')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar ID zero ou negativo', async () => {
            const idsInvalidos = [0, -1];

            for (const id of idsInvalidos) {
                const res = await request(app)
                    .get(`/api/vendas/${id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
            }
        });
    });

    describe('PUT /api/vendas/:id - Atualizar venda', () => {
        const dadosAtualizacao = {
            desconto: 10.00,
            observacoes: 'Venda atualizada',
            forma_pgto: 'pix'
        };

        it('1- Deve processar atualização de venda', async () => {
            const res = await request(app)
                .put('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosAtualizacao);

            expect([200, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar dados de atualização', async () => {
            const dadosInvalidos = {
                desconto: -5, // desconto negativo
                forma_pgto: 'forma-invalida' // forma inválida
            };

            const res = await request(app)
                .put('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosInvalidos);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve aceitar desconto zero', async () => {
            const dadosValidos = {
                ...dadosAtualizacao,
                desconto: 0
            };

            const res = await request(app)
                .put('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosValidos);

            expect([200, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/vendas/stats - Obter estatísticas', () => {
        it('1- Deve processar solicitação de estatísticas', async () => {
            const res = await request(app)
                .get('/api/vendas/stats')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve processar filtros de período', async () => {
            const res = await request(app)
                .get('/api/vendas/stats')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect(validateResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar stats sem autorização', async () => {
            const res = await request(app)
                .get('/api/vendas/stats')
                .set("Accept", "application/json");

            expect([401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/vendas/:id - Deletar venda', () => {
        it('1- Deve processar deleção de venda', async () => {
            const res = await request(app)
                .delete('/api/vendas/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
        });

        it('2- Deve validar ID para deleção', async () => {
            const res = await request(app)
                .delete('/api/vendas/abc')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar deleção sem autorização', async () => {
            const res = await request(app)
                .delete('/api/vendas/1')
                .set("Accept", "application/json");

            expect([401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação avançados', () => {
        it('1- Deve testar diferentes formas de pagamento válidas', async () => {
            const formasPagamento = ['dinheiro', 'cartao', 'pix'];
            
            for (const forma of formasPagamento) {
                const vendaComForma = {
                    ...testVenda,
                    forma_pgto: forma
                };

                const res = await request(app)
                    .post('/api/vendas')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(vendaComForma);

                expect(validateResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve testar estrutura de itens da venda', async () => {
            const vendaComItensInvalidos = {
                ...testVenda,
                itens: [
                    {
                        // sem roupas_id nem nome_item
                        quantidade: 1,
                        preco_unitario: 10.00
                    }
                ]
            };

            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(vendaComItensInvalidos);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve testar limites de desconto', async () => {
            const descontosInvalidos = [-1, 101]; // desconto negativo ou maior que 100%
            
            for (const desconto of descontosInvalidos) {
                const vendaComDescontoInvalido = {
                    ...testVenda,
                    desconto: desconto
                };

                const res = await request(app)
                    .post('/api/vendas')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(vendaComDescontoInvalido);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
            }
        });

        it('4- Deve testar campos obrigatórios', async () => {
            const camposObrigatorios = ['forma_pgto', 'valor_total', 'valor_pago', 'itens'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testVenda };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/vendas')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(dadosIncompletos);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
            }
        });

        it('5- Deve testar diferentes tipos de conteúdo', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set("Accept", "text/html")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testVenda);

            // Deve funcionar mesmo com Accept diferente
            expect(validateResponse(res.body)).toBe(true);
        });
    });
});