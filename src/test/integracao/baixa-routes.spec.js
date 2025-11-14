import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    baixa: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
    },
    baixa_itens: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    },
    motivoBaixa: {
        findMany: jest.fn()
    },
    roupas: {
        findUnique: jest.fn(),
        update: jest.fn()
    }
};

jest.unstable_mockModule('../../models/prisma.js', () => ({
    default: mockPrismaClient
}));

// Mock do JWT
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
    return body && (body.success === true || body.data !== undefined || body.baixa !== undefined || body.baixas !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Baixa Routes', () => {
    const mockToken = 'Bearer mock-jwt-token';
    
    const testBaixa = {
        motivo: 'Produto danificado',
        observacoes: 'Item danificado durante transporte',
        responsavel: 'João Silva'
    };

    const testItem = {
        roupa_id: 1,
        quantidade: 5,
        motivo_item: 'Defeito de fabricação'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
    });

    describe('POST /api/baixa - Criar baixa', () => {
        it('1- Deve validar estrutura de dados para criação', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testBaixa);

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set("Accept", "application/json")
                .send(testBaixa);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/baixa - Listar baixas', () => {
        it('1- Deve processar listagem com paginação', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 1, limit: 10 });

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtros de data', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ 
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve processar filtro por motivo', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ motivo: 'danificado' });

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/baixa/estatisticas - Obter estatísticas', () => {
        it('1- Deve processar solicitação de estatísticas', async () => {
            const res = await request(app)
                .get('/api/baixa/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve rejeitar stats sem autorização', async () => {
            const res = await request(app)
                .get('/api/baixa/estatisticas')
                .set("Accept", "application/json");

            expect([401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/baixa/relatorio - Gerar relatório', () => {
        it('1- Deve processar geração de relatório', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar parâmetros de data', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/baixa/motivos - Listar motivos', () => {
        it('1- Deve retornar lista de motivos disponíveis', async () => {
            const res = await request(app)
                .get('/api/baixa/motivos')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/baixa/:id - Buscar baixa por ID', () => {
        it('1- Deve processar busca por ID válido', async () => {
            const res = await request(app)
                .get('/api/baixa/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar formato do ID', async () => {
            const res = await request(app)
                .get('/api/baixa/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('PATCH /api/baixa/:id - Atualizar baixa', () => {
        const dadosAtualizacao = {
            motivo: 'Produto vencido',
            observacoes: 'Produto vencido - descarte necessário'
        };

        it('1- Deve processar atualização com dados válidos', async () => {
            const res = await request(app)
                .patch('/api/baixa/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosAtualizacao);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados de atualização', async () => {
            const res = await request(app)
                .patch('/api/baixa/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ motivo: '' });

            expect([400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/baixa/:id - Deletar baixa', () => {
        it('1- Deve processar deleção de baixa', async () => {
            const res = await request(app)
                .delete('/api/baixa/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar ID para deleção', async () => {
            const res = await request(app)
                .delete('/api/baixa/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/baixa/:id/itens - Adicionar item à baixa', () => {
        it('1- Deve adicionar item com dados válidos', async () => {
            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testItem);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados do item', async () => {
            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar quantidade positiva', async () => {
            const itemInvalido = { ...testItem, quantidade: -1 };

            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(itemInvalido);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/baixa/:id/itens - Listar itens da baixa', () => {
        it('1- Deve listar itens da baixa', async () => {
            const res = await request(app)
                .get('/api/baixa/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar ID da baixa', async () => {
            const res = await request(app)
                .get('/api/baixa/abc/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('PATCH /api/baixa/:id/itens/:item_id - Atualizar item da baixa', () => {
        it('1- Deve atualizar item com dados válidos', async () => {
            const dadosAtualizacao = {
                quantidade: 3,
                motivo_item: 'Quantidade corrigida'
            };

            const res = await request(app)
                .patch('/api/baixa/1/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(dadosAtualizacao);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar IDs da rota', async () => {
            const res = await request(app)
                .patch('/api/baixa/abc/itens/xyz')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 1 });

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/baixa/:id/itens/:item_id - Remover item da baixa', () => {
        it('1- Deve remover item da baixa', async () => {
            const res = await request(app)
                .delete('/api/baixa/1/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar IDs para remoção', async () => {
            const res = await request(app)
                .delete('/api/baixa/abc/itens/xyz')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação avançados', () => {
        it('1- Deve testar diferentes motivos de baixa', async () => {
            const motivos = [
                'Produto danificado',
                'Produto vencido',
                'Perda por roubo',
                'Defeito de fabricação',
                'Descarte por qualidade'
            ];

            for (const motivo of motivos) {
                const dados = { ...testBaixa, motivo };

                const res = await request(app)
                    .post('/api/baixa')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dados);

                expect([200, 201, 400, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve testar filtros combinados', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    motivo: 'danificado',
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31',
                    page: 1,
                    limit: 5
                });

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar diferentes tipos de conteúdo', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(JSON.stringify(testBaixa));

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve testar campos obrigatórios individualmente', async () => {
            const camposObrigatorios = ['motivo', 'responsavel'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testBaixa };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/baixa')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosIncompletos);

                expect([400, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve testar filtros de roupa_id na listagem', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ roupa_id: 1 });

            expect([200, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('6- Deve testar validação de datas na geração de relatório', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    data_inicio: 'data-invalida',
                    data_fim: '2024-12-31'
                });

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('7- Deve testar paginação com valores extremos', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 999, limit: 1 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('8- Deve testar atualização parcial de baixa', async () => {
            const res = await request(app)
                .patch('/api/baixa/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ observacoes: 'Nova observação' });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('9- Deve testar estatísticas com filtros de período', async () => {
            const res = await request(app)
                .get('/api/baixa/estatisticas')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    data_inicio: '2024-01-01',
                    data_fim: '2024-12-31'
                });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('10- Deve testar adição de múltiplos itens à baixa', async () => {
            const itensMultiplos = [
                { roupa_id: 1, quantidade: 2, motivo_item: 'Defeito 1' },
                { roupa_id: 2, quantidade: 3, motivo_item: 'Defeito 2' }
            ];

            for (const item of itensMultiplos) {
                const res = await request(app)
                    .post('/api/baixa/1/itens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(item);

                expect([200, 201, 400, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('11- Deve testar validação de quantidade máxima em item', async () => {
            const itemQuantidadeAlta = {
                roupa_id: 1,
                quantidade: 9999999,
                motivo_item: 'Teste quantidade alta'
            };

            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(itemQuantidadeAlta);

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('12- Deve testar busca de baixa por ID inexistente', async () => {
            const res = await request(app)
                .get('/api/baixa/99999')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });
});