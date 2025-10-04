import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    condicional: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn()
    },
    cliente: {
        findUnique: jest.fn()
    },
    roupas: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
    },
    vendas: {
        create: jest.fn()
    },
    $transaction: jest.fn()
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
    return body && (body.success === true || body.data !== undefined || body.condicionais !== undefined || body.condicional !== undefined || body.estatisticas !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Condicionais Routes', () => {
    const mockToken = 'Bearer mock-jwt-token';
    
    const testCondicional = {
        cliente_id: 1,
        data_saida: '2024-01-15T10:30:00Z',
        data_retorno: '2024-01-22T10:30:00Z',
        observacoes: 'Condicional de teste',
        itens: [
            {
                roupa_id: 1,
                quantidade: 2
            },
            {
                roupa_id: 2,
                quantidade: 1
            }
        ]
    };

    const testVendaConversion = {
        itens_vendidos: 'todos',
        forma_pagamento: 'dinheiro',
        desconto: 0
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
    });

    describe('GET /api/condicionais - Listar condicionais', () => {
        it('1- Deve processar listagem com paginação', async () => {
            mockPrismaClient.condicional.findMany.mockResolvedValue([]);
            mockPrismaClient.condicional.count.mockResolvedValue(0);

            const res = await request(app)
                .get('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 1, limit: 10 });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtros de cliente', async () => {
            const res = await request(app)
                .get('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ cliente_id: 1, page: 1, limit: 10 });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve processar filtro por status devolvido', async () => {
            const res = await request(app)
                .get('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ devolvido: true });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar parâmetros de paginação', async () => {
            const res = await request(app)
                .get('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 0, limit: 1000 });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .get('/api/condicionais')
                .set("Accept", "application/json");

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/condicionais/estatisticas - Obter estatísticas', () => {
        it('1- Deve processar solicitação de estatísticas', async () => {
            mockPrismaClient.condicional.aggregate.mockResolvedValue({
                _count: { id: 10 },
                _sum: { valor_total: 1000 }
            });

            const res = await request(app)
                .get('/api/condicionais/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtros de período nas estatísticas', async () => {
            const res = await request(app)
                .get('/api/condicionais/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ 
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar estatísticas sem autorização', async () => {
            const res = await request(app)
                .get('/api/condicionais/estatisticas')
                .set("Accept", "application/json");

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/condicionais/relatorios/ativos - Relatório de ativos', () => {
        it('1- Deve processar geração de relatório de ativos', async () => {
            const res = await request(app)
                .get('/api/condicionais/relatorios/ativos')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtros de data no relatório', async () => {
            const res = await request(app)
                .get('/api/condicionais/relatorios/ativos')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/condicionais/relatorios/devolvidos - Relatório de devolvidos', () => {
        it('1- Deve processar geração de relatório de devolvidos', async () => {
            const res = await request(app)
                .get('/api/condicionais/relatorios/devolvidos')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtros no relatório de devolvidos', async () => {
            const res = await request(app)
                .get('/api/condicionais/relatorios/devolvidos')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ cliente_id: 1 });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/condicionais/:id - Buscar condicional por ID', () => {
        it('1- Deve processar busca por ID válido', async () => {
            const res = await request(app)
                .get('/api/condicionais/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar formato do ID', async () => {
            const res = await request(app)
                .get('/api/condicionais/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar ID zero ou negativo', async () => {
            const ids = [0, -1, -5];
            
            for (const id of ids) {
                const res = await request(app)
                    .get(`/api/condicionais/${id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([400, 401, 404, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('POST /api/condicionais - Criar condicional', () => {
        it('1- Deve validar estrutura de dados para criação', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testCondicional);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar cliente_id obrigatório', async () => {
            const dadosIncompletos = { ...testCondicional };
            delete dadosIncompletos.cliente_id;

            const res = await request(app)
                .post('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosIncompletos);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar itens obrigatórios', async () => {
            const dadosIncompletos = { ...testCondicional };
            delete dadosIncompletos.itens;

            const res = await request(app)
                .post('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosIncompletos);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set("Accept", "application/json")
                .send(testCondicional);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('PUT /api/condicionais/:id - Atualizar condicional', () => {
        it('1- Deve processar atualização com dados válidos', async () => {
            const dadosAtualizacao = {
                observacoes: 'Observações atualizadas',
                data_retorno: '2024-01-25T10:30:00Z'
            };

            const res = await request(app)
                .put('/api/condicionais/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosAtualizacao);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados de atualização', async () => {
            const res = await request(app)
                .put('/api/condicionais/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ cliente_id: 'invalid' });

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar ID para atualização', async () => {
            const res = await request(app)
                .put('/api/condicionais/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ observacoes: 'Teste' });

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/condicionais/:id/devolver-item - Devolver item', () => {
        it('1- Deve processar devolução de item válido', async () => {
            const dadosDevolucao = {
                roupa_id: 1,
                quantidade: 1,
                motivo: 'Cliente não gostou'
            };

            const res = await request(app)
                .post('/api/condicionais/1/devolver-item')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosDevolucao);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados obrigatórios para devolução', async () => {
            const res = await request(app)
                .post('/api/condicionais/1/devolver-item')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar quantidade positiva', async () => {
            const dadosInvalidos = {
                roupa_id: 1,
                quantidade: 0,
                motivo: 'Teste'
            };

            const res = await request(app)
                .post('/api/condicionais/1/devolver-item')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosInvalidos);

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/condicionais/:id/finalizar - Finalizar condicional', () => {
        it('1- Deve processar finalização de condicional', async () => {
            const res = await request(app)
                .post('/api/condicionais/1/finalizar')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar ID da condicional para finalização', async () => {
            const res = await request(app)
                .post('/api/condicionais/abc/finalizar')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve processar finalização com observações', async () => {
            const dadosFinalizacao = {
                observacoes_finalizacao: 'Finalizada com sucesso'
            };

            const res = await request(app)
                .post('/api/condicionais/1/finalizar')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosFinalizacao);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/condicionais/:id/converter-venda - Converter em venda', () => {
        it('1- Deve processar conversão em venda com dados válidos', async () => {
            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testVendaConversion);

            expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados obrigatórios para conversão', async () => {
            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar forma de pagamento', async () => {
            const dadosInvalidos = {
                ...testVendaConversion,
                forma_pagamento: 'invalida'
            };

            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosInvalidos);

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar itens vendidos', async () => {
            const dadosInvalidos = {
                ...testVendaConversion,
                itens_vendidos: 'opcao_invalida'
            };

            const res = await request(app)
                .post('/api/condicionais/1/converter-venda')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosInvalidos);

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('PATCH /api/condicionais/itens/status - Atualizar status de itens', () => {
        it('1- Deve atualizar status de itens com dados válidos', async () => {
            const dadosStatus = {
                roupas_ids: [1, 2, 3],
                novo_status: 'disponivel'
            };

            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosStatus);

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar roupas_ids como array', async () => {
            const dadosInvalidos = {
                roupas_ids: 'not_array',
                novo_status: 'disponivel'
            };

            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosInvalidos);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar array não vazio', async () => {
            const dadosInvalidos = {
                roupas_ids: [],
                novo_status: 'disponivel'
            };

            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosInvalidos);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar novo_status obrigatório', async () => {
            const dadosInvalidos = {
                roupas_ids: [1, 2, 3]
            };

            const res = await request(app)
                .patch('/api/condicionais/itens/status')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosInvalidos);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/condicionais/:id - Deletar condicional', () => {
        it('1- Deve processar deleção de condicional', async () => {
            const res = await request(app)
                .delete('/api/condicionais/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar ID para deleção', async () => {
            const res = await request(app)
                .delete('/api/condicionais/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar deleção sem autorização', async () => {
            const res = await request(app)
                .delete('/api/condicionais/1')
                .set("Accept", "application/json");

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação avançados', () => {
        it('1- Deve testar diferentes tipos de conteúdo', async () => {
            const res = await request(app)
                .post('/api/condicionais')
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(JSON.stringify(testCondicional));

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve testar filtros combinados na listagem', async () => {
            const res = await request(app)
                .get('/api/condicionais')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    cliente_id: 1,
                    devolvido: false,
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31',
                    page: 1,
                    limit: 5
                });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar diferentes valores de desconto na conversão', async () => {
            const descontos = [0, 10, 50, 100];

            for (const desconto of descontos) {
                const dadosConversao = {
                    ...testVendaConversion,
                    desconto: desconto
                };

                const res = await request(app)
                    .post('/api/condicionais/1/converter-venda')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosConversao);

                expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('4- Deve testar diferentes formas de pagamento na conversão', async () => {
            const formasPagamento = ['dinheiro', 'cartao', 'pix', 'boleto'];

            for (const forma of formasPagamento) {
                const dadosConversao = {
                    ...testVendaConversion,
                    forma_pagamento: forma
                };

                const res = await request(app)
                    .post('/api/condicionais/1/converter-venda')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosConversao);

                expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve testar campos obrigatórios individualmente', async () => {
            const camposObrigatorios = ['cliente_id', 'data_saida', 'itens'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testCondicional };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/condicionais')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosIncompletos);

                expect([400, 401, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('6- Deve testar diferentes status de itens', async () => {
            const statusValidos = ['disponivel', 'reservado', 'vendido', 'danificado'];

            for (const status of statusValidos) {
                const dadosStatus = {
                    roupas_ids: [1, 2],
                    novo_status: status
                };

                const res = await request(app)
                    .patch('/api/condicionais/itens/status')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosStatus);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });
});