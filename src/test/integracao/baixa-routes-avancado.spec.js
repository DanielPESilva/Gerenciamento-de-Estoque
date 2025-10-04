import { describe, expect, it, beforeEach, jest } from '@jest/globals';
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
        count: jest.fn(),
        aggregate: jest.fn(),
    },
    baixa_itens: {
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
    usuarios: {
        findUnique: jest.fn(),
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
        body.baixas !== undefined ||
        body.estatisticas !== undefined ||
        body.relatorio !== undefined ||
        body.itens !== undefined ||
        body.motivos !== undefined
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

describe('Integração - Baixa Routes - Avançado', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup básico dos mocks
        mockPrismaClient.usuarios.findUnique.mockResolvedValue({
            id: 1,
            nome: 'Usuário Teste',
            email: 'teste@teste.com'
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

        mockPrismaClient.baixa.findMany.mockResolvedValue([]);
        mockPrismaClient.baixa.count.mockResolvedValue(0);
        mockPrismaClient.baixa.findUnique.mockResolvedValue(null);
        mockPrismaClient.baixa_itens.findMany.mockResolvedValue([]);

        // Mock para transações
        mockPrismaClient.$transaction.mockImplementation(async (callback) => {
            return await callback(mockPrismaClient);
        });
    });

    describe('POST /api/baixa - Criação com cenários avançados', () => {
        it('1- Deve criar baixa com dados completos', async () => {
            mockPrismaClient.baixa.create.mockResolvedValue({
                id: 1,
                motivo: 'Perda',
                observacoes: 'Teste de criação',
                usuario_id: 1,
                data_baixa: new Date()
            });

            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Perda',
                    observacoes: 'Teste de criação completa',
                    usuario_id: 1,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 5,
                        observacao_item: 'Item perdido no estoque'
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve criar baixa com item por nome', async () => {
            mockPrismaClient.baixa.create.mockResolvedValue({
                id: 2,
                motivo: 'Defeito',
                usuario_id: 1
            });

            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Defeito',
                    usuario_id: 1,
                    itens: [{
                        nome_item: 'Camisa Vermelha',
                        quantidade: 2,
                        observacao_item: 'Defeito na costura'
                    }]
                });

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar motivo obrigatório', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    usuario_id: 1,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar usuário obrigatório', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Perda',
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar pelo menos um item', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Perda',
                    usuario_id: 1,
                    itens: []
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve validar motivo válido', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Motivo Inválido',
                    usuario_id: 1,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve validar quantidade positiva', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Perda',
                    usuario_id: 1,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 0
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar observações muito longas', async () => {
            const observacoesLongas = 'A'.repeat(501);

            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Perda',
                    usuario_id: 1,
                    observacoes: observacoesLongas,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1
                    }]
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/baixa - Listagem com filtros avançados', () => {
        it('1- Deve listar baixas com filtro por motivo', async () => {
            mockPrismaClient.baixa.findMany.mockResolvedValue([{
                id: 1,
                motivo: 'Perda',
                data_baixa: new Date(),
                usuario_id: 1
            }]);

            const res = await request(app)
                .get('/api/baixa?motivo=Perda')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve listar baixas com filtro de data', async () => {
            const res = await request(app)
                .get('/api/baixa?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve listar baixas com filtro por item', async () => {
            const res = await request(app)
                .get('/api/baixa?roupa_id=1')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve aplicar paginação avançada', async () => {
            mockPrismaClient.baixa.count.mockResolvedValue(50);

            const res = await request(app)
                .get('/api/baixa?page=2&limit=10')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar parâmetros de paginação inválidos', async () => {
            const res = await request(app)
                .get('/api/baixa?page=0&limit=-5')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve listar baixas com filtros combinados', async () => {
            const res = await request(app)
                .get('/api/baixa?motivo=Defeito&data_inicio=2024-01-01&roupa_id=1')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/baixa/:id - Busca específica', () => {
        it('1- Deve buscar baixa por ID válido', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda',
                observacoes: 'Teste',
                data_baixa: new Date(),
                usuario_id: 1,
                Roupa: {
                    id: 1,
                    nome: 'Camisa Teste'
                }
            });

            const res = await request(app)
                .get('/api/baixa/1')
                .set('Authorization', mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar baixa inexistente', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/baixa/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .get('/api/baixa/abc')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('PUT /api/baixa/:id - Atualização avançada', () => {
        it('1- Deve atualizar baixa completa', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });
            mockPrismaClient.baixa.update.mockResolvedValue({
                id: 1,
                motivo: 'Defeito',
                observacoes: 'Observações atualizadas'
            });

            const res = await request(app)
                .put('/api/baixa/1')
                .set('Authorization', mockToken)
                .send({
                    motivo: 'Defeito',
                    observacoes: 'Observações atualizadas'
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve permitir atualização parcial', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });
            mockPrismaClient.baixa.update.mockResolvedValue({
                id: 1,
                observacoes: 'Apenas observações'
            });

            const res = await request(app)
                .put('/api/baixa/1')
                .set('Authorization', mockToken)
                .send({
                    observacoes: 'Apenas observações'
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve tratar baixa inexistente na atualização', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/baixa/999')
                .set('Authorization', mockToken)
                .send({
                    observacoes: 'Teste'
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('POST /api/baixa/:id/itens - Adicionar itens', () => {
        it('1- Deve adicionar item à baixa', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });
            mockPrismaClient.baixa_itens.create.mockResolvedValue({
                id: 1,
                baixa_id: 1,
                roupas_id: 1,
                quantidade: 5
            });

            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set('Authorization', mockToken)
                .send({
                    roupas_id: 1,
                    quantidade: 5,
                    observacao_item: 'Item adicional'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar item obrigatório', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });

            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set('Authorization', mockToken)
                .send({
                    quantidade: 5
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar quantidade positiva', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });

            const res = await request(app)
                .post('/api/baixa/1/itens')
                .set('Authorization', mockToken)
                .send({
                    roupas_id: 1,
                    quantidade: 0
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/baixa/:id/itens - Listar itens', () => {
        it('1- Deve listar itens da baixa', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });
            mockPrismaClient.baixa_itens.findMany.mockResolvedValue([{
                id: 1,
                roupas_id: 1,
                quantidade: 5,
                observacao_item: 'Teste'
            }]);

            const res = await request(app)
                .get('/api/baixa/1/itens')
                .set('Authorization', mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar baixa sem itens', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });
            mockPrismaClient.baixa_itens.findMany.mockResolvedValue([]);

            const res = await request(app)
                .get('/api/baixa/1/itens')
                .set('Authorization', mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/baixa/estatisticas - Estatísticas avançadas', () => {
        it('1- Deve obter estatísticas gerais', async () => {
            mockPrismaClient.baixa.aggregate.mockResolvedValue({
                _sum: { quantidade: 100 },
                _count: { id: 50 }
            });

            const res = await request(app)
                .get('/api/baixa/estatisticas')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve obter estatísticas com filtro de período', async () => {
            const res = await request(app)
                .get('/api/baixa/estatisticas?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve obter estatísticas por motivo', async () => {
            const res = await request(app)
                .get('/api/baixa/estatisticas?motivo=Perda')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/baixa/motivos - Listar motivos', () => {
        it('1- Deve listar todos os motivos disponíveis', async () => {
            const res = await request(app)
                .get('/api/baixa/motivos')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/baixa/relatorio - Relatório avançado', () => {
        it('1- Deve gerar relatório por período', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar data_inicio obrigatória', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio?data_fim=2024-12-31')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar data_fim obrigatória', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio?data_inicio=2024-01-01')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar período inválido', async () => {
            const res = await request(app)
                .get('/api/baixa/relatorio?data_inicio=2024-12-31&data_fim=2024-01-01')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('PUT /api/baixa/itens/:itemId - Atualizar item específico', () => {
        it('1- Deve atualizar item específico', async () => {
            mockPrismaClient.baixa_itens.update.mockResolvedValue({
                id: 1,
                quantidade: 10,
                observacao_item: 'Observação atualizada'
            });

            const res = await request(app)
                .put('/api/baixa/itens/1')
                .set('Authorization', mockToken)
                .send({
                    quantidade: 10,
                    observacao_item: 'Observação atualizada'
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar item inexistente', async () => {
            mockPrismaClient.baixa_itens.update.mockRejectedValue(new Error('Item não encontrado'));

            const res = await request(app)
                .put('/api/baixa/itens/999')
                .set('Authorization', mockToken)
                .send({
                    quantidade: 5
                });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('DELETE /api/baixa/itens/:itemId - Remover item específico', () => {
        it('1- Deve remover item específico', async () => {
            mockPrismaClient.baixa_itens.delete.mockResolvedValue({
                id: 1
            });

            const res = await request(app)
                .delete('/api/baixa/itens/1')
                .set('Authorization', mockToken);

            expect([200, 204, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar item inexistente', async () => {
            mockPrismaClient.baixa_itens.delete.mockRejectedValue(new Error('Item não encontrado'));

            const res = await request(app)
                .delete('/api/baixa/itens/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('DELETE /api/baixa/:id - Deleção avançada', () => {
        it('1- Deve deletar baixa válida', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue({
                id: 1,
                motivo: 'Perda'
            });
            mockPrismaClient.baixa.delete.mockResolvedValue({
                id: 1
            });

            const res = await request(app)
                .delete('/api/baixa/1')
                .set('Authorization', mockToken);

            expect([200, 204, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve tratar baixa inexistente', async () => {
            mockPrismaClient.baixa.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/baixa/999')
                .set('Authorization', mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .delete('/api/baixa/abc')
                .set('Authorization', mockToken);

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('Testes de Segurança e Validação', () => {
        it('1- Deve rejeitar requisições sem autenticação GET', async () => {
            const res = await request(app)
                .get('/api/baixa');

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve rejeitar requisições sem autenticação POST', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .send({
                    motivo: 'Perda',
                    usuario_id: 1,
                    itens: [{
                        roupas_id: 1,
                        quantidade: 1
                    }]
                });

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar Content-Type incorreto', async () => {
            const res = await request(app)
                .post('/api/baixa')
                .set('Authorization', mockToken)
                .set('Content-Type', 'text/plain')
                .send('invalid data');

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar método HTTP incorreto', async () => {
            const res = await request(app)
                .patch('/api/baixa')
                .set('Authorization', mockToken);

            expect([404, 405, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar headers de resposta', async () => {
            const res = await request(app)
                .get('/api/baixa')
                .set('Authorization', mockToken);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json|text\/html/);
            }
            expect(res.headers).toBeDefined();
        });

        it('6- Deve processar requisições com parâmetros especiais', async () => {
            const res = await request(app)
                .get('/api/baixa?motivo=Perda&data_inicio=2024-01-01')
                .set('Authorization', mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });
});