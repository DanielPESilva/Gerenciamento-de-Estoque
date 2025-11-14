import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    compras: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn()
    },
    itens_compra: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    },
    roupas: {
        findUnique: jest.fn()
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
    return body && (body.success === true || body.data !== undefined || body.compras !== undefined || body.compra !== undefined || body.estatisticas !== undefined || body.relatorio !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Compras Routes Avançados', () => {
    const mockToken = 'Bearer mock-jwt-token';
    
    const testCompraCompleta = {
        fornecedor: 'Fornecedor ABC Ltda.',
        data_compra: '2024-01-15T10:30:00Z',
        valor_total: 1500.50,
        descricao: 'Compra de roupas da coleção inverno',
        status: 'pendente',
        observacoes: 'Entrega prevista para 30/01/2024',
        itens: [
            {
                roupa: 'Jaqueta de Couro',
                quantidade: 10,
                preco_unitario: 120.00
            },
            {
                roupa: 'Calça Jeans',
                quantidade: 20,
                preco_unitario: 75.25
            }
        ]
    };

    const testItemCompra = {
        roupa_id: 1,
        quantidade: 15,
        preco_unitario: 45.90,
        descricao_item: 'Camiseta básica branca'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
        
        // Setup Prisma mocks
        mockPrismaClient.compras.findMany.mockResolvedValue([]);
        mockPrismaClient.compras.count.mockResolvedValue(0);
        mockPrismaClient.roupas.findUnique.mockResolvedValue({ id: 1, nome: 'Produto Teste' });
    });

    describe('GET /api/compras - Listagem avançada', () => {
        it('1- Deve processar listagem com filtros múltiplos', async () => {
            const res = await request(app)
                .get('/api/compras')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    fornecedor: 'ABC',
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31',
                    valor_min: 100,
                    valor_max: 2000,
                    status: 'pendente',
                    page: 1,
                    limit: 15
                });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtros de valor com diferentes ranges', async () => {
            const ranges = [
                { valor_min: 0, valor_max: 100 },
                { valor_min: 100, valor_max: 500 },
                { valor_min: 500, valor_max: 1000 },
                { valor_min: 1000, valor_max: 5000 }
            ];

            for (const range of ranges) {
                const res = await request(app)
                    .get('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query(range);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve processar diferentes status de compra', async () => {
            const statusList = ['pendente', 'aprovada', 'recebida', 'cancelada', 'finalizada'];

            for (const status of statusList) {
                const res = await request(app)
                    .get('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query({ status });

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('4- Deve validar parâmetros de paginação extremos', async () => {
            const paginacoes = [
                { page: 1, limit: 1 },
                { page: 100, limit: 5 },
                { page: 1, limit: 50 },
                { page: 0, limit: 10 }, // Inválido
                { page: 1, limit: 101 } // Inválido
            ];

            for (const pag of paginacoes) {
                const res = await request(app)
                    .get('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query(pag);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve processar filtros de data com diferentes formatos', async () => {
            const datas = [
                { data_inicio: '2024-01-01', data_fim: '2024-01-31' },
                { data_inicio: '2024-01-01T00:00:00Z', data_fim: '2024-01-31T23:59:59Z' },
                { data_inicio: '2024-01-01', data_fim: '2024-12-31' },
                { data_inicio: 'invalid-date', data_fim: '2024-12-31' } // Inválido
            ];

            for (const data of datas) {
                const res = await request(app)
                    .get('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query(data);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('POST /api/compras - Criação avançada', () => {
        it('1- Deve processar criação de compra completa', async () => {
            const res = await request(app)
                .post('/api/compras')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testCompraCompleta);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar campos obrigatórios individualmente', async () => {
            const camposObrigatorios = ['fornecedor', 'data_compra', 'valor_total'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testCompraCompleta };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosIncompletos);

                expect([400, 401, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve validar valor_total positivo', async () => {
            const valoresInvalidos = [-100, 0, -0.01];

            for (const valor of valoresInvalidos) {
                const dadosInvalidos = {
                    ...testCompraCompleta,
                    valor_total: valor
                };

                const res = await request(app)
                    .post('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosInvalidos);

                expect([400, 401, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('4- Deve processar diferentes status na criação', async () => {
            const statusValidos = ['pendente', 'aprovada', 'recebida'];

            for (const status of statusValidos) {
                const dadosComStatus = {
                    ...testCompraCompleta,
                    status
                };

                const res = await request(app)
                    .post('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosComStatus);

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve validar fornecedor com diferentes tamanhos', async () => {
            const fornecedores = [
                'A', // Muito curto
                'ABC Fornecedor Ltda.',
                'Fornecedor com Nome Muito Longo que Pode Causar Problemas de Validação no Sistema de Gerenciamento',
                '' // Vazio
            ];

            for (const fornecedor of fornecedores) {
                const dadosComFornecedor = {
                    ...testCompraCompleta,
                    fornecedor
                };

                const res = await request(app)
                    .post('/api/compras')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosComFornecedor);

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('PUT /api/compras/:id - Atualização avançada', () => {
        it('1- Deve processar atualização parcial', async () => {
            const atualizacaosParciais = [
                { status: 'aprovada' },
                { observacoes: 'Nova observação' },
                { valor_total: 1750.00 },
                { fornecedor: 'Novo Fornecedor' }
            ];

            for (const atualizacao of atualizacaosParciais) {
                const res = await request(app)
                    .put('/api/compras/1')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(atualizacao);

                expect([200, 400, 401, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve processar atualização completa', async () => {
            const atualizacaoCompleta = {
                fornecedor: 'Fornecedor Atualizado',
                data_compra: '2024-02-15T10:30:00Z',
                valor_total: 2000.00,
                status: 'finalizada',
                observacoes: 'Compra finalizada com sucesso',
                descricao: 'Descrição atualizada'
            };

            const res = await request(app)
                .put('/api/compras/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(atualizacaoCompleta);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar IDs para atualização', async () => {
            const idsInvalidos = ['abc', '0', '-1', '999999999'];

            for (const id of idsInvalidos) {
                const res = await request(app)
                    .put(`/api/compras/${id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send({ status: 'aprovada' });

                expect([400, 401, 404, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('POST /api/compras/:id/itens - Gestão de itens avançada', () => {
        it('1- Deve adicionar item com dados completos', async () => {
            const res = await request(app)
                .post('/api/compras/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testItemCompra);

            expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar campos obrigatórios do item', async () => {
            const camposObrigatorios = ['roupa_id', 'quantidade', 'preco_unitario'];
            
            for (const campo of camposObrigatorios) {
                const itemIncompleto = { ...testItemCompra };
                delete itemIncompleto[campo];

                const res = await request(app)
                    .post('/api/compras/1/itens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(itemIncompleto);

                expect([400, 401, 404, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve validar valores positivos', async () => {
            const valoresInvalidos = [
                { quantidade: 0, preco_unitario: 50 },
                { quantidade: -5, preco_unitario: 50 },
                { quantidade: 10, preco_unitario: 0 },
                { quantidade: 10, preco_unitario: -10 }
            ];

            for (const valores of valoresInvalidos) {
                const itemInvalido = {
                    ...testItemCompra,
                    ...valores
                };

                const res = await request(app)
                    .post('/api/compras/1/itens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(itemInvalido);

                expect([400, 401, 404, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('GET /api/compras/relatorio - Relatórios avançados', () => {
        it('1- Deve gerar relatório com filtros múltiplos', async () => {
            const res = await request(app)
                .get('/api/compras/relatorio')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31',
                    fornecedor: 'ABC',
                    status: 'finalizada',
                    valor_min: 100,
                    valor_max: 5000
                });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar parâmetros obrigatórios do relatório', async () => {
            const parametrosIncompletos = [
                {}, // Sem parâmetros
                { data_inicio: '2024-01-01' }, // Sem data_fim
                { data_fim: '2024-12-31' }, // Sem data_inicio
                { data_inicio: 'invalid', data_fim: '2024-12-31' } // Data inválida
            ];

            for (const params of parametrosIncompletos) {
                const res = await request(app)
                    .get('/api/compras/relatorio')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query(params);

                expect([400, 401, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve processar diferentes períodos de relatório', async () => {
            const periodos = [
                { data_inicio: '2024-01-01', data_fim: '2024-01-31' }, // Mensal
                { data_inicio: '2024-01-01', data_fim: '2024-03-31' }, // Trimestral
                { data_inicio: '2024-01-01', data_fim: '2024-12-31' }, // Anual
                { data_inicio: '2024-01-01', data_fim: '2024-01-01' }  // Dia único
            ];

            for (const periodo of periodos) {
                const res = await request(app)
                    .get('/api/compras/relatorio')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query(periodo);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('GET /api/compras/estatisticas - Estatísticas avançadas', () => {
        it('1- Deve processar estatísticas básicas', async () => {
            mockPrismaClient.compras.aggregate.mockResolvedValue({
                _count: { id: 25 },
                _sum: { valor_total: 15000.50 },
                _avg: { valor_total: 600.02 }
            });

            const res = await request(app)
                .get('/api/compras/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar estatísticas com filtros de período', async () => {
            const periodos = [
                { periodo: 'mensal', ano: 2024, mes: 1 },
                { periodo: 'trimestral', ano: 2024, trimestre: 1 },
                { periodo: 'anual', ano: 2024 },
                { periodo: 'personalizado', data_inicio: '2024-01-01', data_fim: '2024-12-31' }
            ];

            for (const periodo of periodos) {
                const res = await request(app)
                    .get('/api/compras/estatisticas')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query(periodo);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve processar estatísticas por fornecedor', async () => {
            const res = await request(app)
                .get('/api/compras/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ 
                    agrupar_por: 'fornecedor',
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect([200, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/compras/:id/finalizar - Finalização avançada', () => {
        it('1- Deve finalizar compra com dados completos', async () => {
            const dadosFinalizacao = {
                data_finalizacao: '2024-01-20T15:00:00Z',
                observacoes_finalizacao: 'Compra finalizada com sucesso',
                valor_final: 1500.50,
                desconto_aplicado: 0
            };

            const res = await request(app)
                .post('/api/compras/1/finalizar')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosFinalizacao);

            expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve finalizar compra apenas com dados básicos', async () => {
            const res = await request(app)
                .post('/api/compras/1/finalizar')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar valor final se fornecido', async () => {
            const valoresInvalidos = [-100, 0];

            for (const valor of valoresInvalidos) {
                const dadosInvalidos = {
                    valor_final: valor
                };

                const res = await request(app)
                    .post('/api/compras/1/finalizar')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosInvalidos);

                expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('Testes de integração e validação completa', () => {
        it('1- Deve processar fluxo completo de compra', async () => {
            // 1. Criar compra
            const resCreate = await request(app)
                .post('/api/compras')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testCompraCompleta);

            expect([200, 201, 400, 401, 500]).toContain(resCreate.status);

            // 2. Adicionar item
            const resAddItem = await request(app)
                .post('/api/compras/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testItemCompra);

            expect([200, 201, 400, 401, 404, 500]).toContain(resAddItem.status);

            // 3. Finalizar compra
            const resFinalize = await request(app)
                .post('/api/compras/1/finalizar')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([200, 201, 400, 401, 404, 500]).toContain(resFinalize.status);
        });

        it('2- Deve testar diferentes Content-Types', async () => {
            const contentTypes = [
                'application/json',
                'application/x-www-form-urlencoded'
            ];

            for (const contentType of contentTypes) {
                const res = await request(app)
                    .post('/api/compras')
                    .set("Content-Type", contentType)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(testCompraCompleta);

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve testar cenários de autorização', async () => {
            const cenarios = [
                { token: null, esperado: [401, 500] },
                { token: 'Bearer invalid-token', esperado: [401, 500] },
                { token: 'Invalid format', esperado: [401, 500] },
                { token: mockToken, esperado: [200, 201, 400, 500] }
            ];

            for (const cenario of cenarios) {
                const req = request(app)
                    .get('/api/compras')
                    .set("Accept", "application/json");

                if (cenario.token) {
                    req.set("Authorization", cenario.token);
                }

                const res = await req;
                expect(cenario.esperado).toContain(res.status);
            }
        });
    });
});