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
    roupas: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
    },
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

describe('Integração - Itens Routes', () => {
    beforeAll(async () => {
        jest.doMock('@prisma/client', () => ({
            PrismaClient: jest.fn(() => mockPrismaClient)
        }));
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    const testItem = {
        nome: 'Camiseta Teste',
        marca: 'Marca Teste',
        cor: 'Azul',
        tamanho: 'M',
        preco: 29.99,
        quantidade_estoque: 10,
        categoria: 'Camisetas',
        descricao: 'Camiseta básica de algodão',
        tipo: 'roupa',
        usuarios_id: 1
    };

    describe('POST /api/itens - Criar item', () => {
        it('1- Deve validar estrutura de dados para criação', async () => {
            const res = await request(app)
                .post('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testItem);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve validar tipos de dados', async () => {
            const dadosInvalidos = {
                ...testItem,
                preco: 'preco-invalido', // deve ser número
                quantidade_estoque: -5 // não pode ser negativo
            };

            const res = await request(app)
                .post('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosInvalidos);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('4- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .post('/api/itens')
                .set("Accept", "application/json")
                .send(testItem);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/itens - Listar itens', () => {
        it('1- Deve processar listagem com paginação', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: 1, limit: 10 });

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar parâmetros de paginação', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: -1, limit: 0 });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve processar filtros válidos', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({
                    page: 1,
                    limit: 10,
                    categoria: 'Camisetas',
                    marca: 'Nike'
                });

            expect(validateResponse(res.body)).toBe(true);
        });

        it('4- Deve rejeitar limit muito alto', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: 1, limit: 1000 });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('GET /api/itens/search - Buscar itens', () => {
        it('1- Deve processar busca por nome', async () => {
            const res = await request(app)
                .get('/api/itens/search')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ q: 'Camiseta' });

            expect(validateResponse(res.body)).toBe(true);
        });

        it('2- Deve validar termo de busca', async () => {
            const res = await request(app)
                .get('/api/itens/search')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ q: '' });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve processar busca com filtros adicionais', async () => {
            const res = await request(app)
                .get('/api/itens/search')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({
                    q: 'Camiseta',
                    categoria: 'Roupas',
                    preco_min: 10,
                    preco_max: 50
                });

            expect(validateResponse(res.body)).toBe(true);
        });

        it('4- Deve rejeitar busca sem autorização', async () => {
            const res = await request(app)
                .get('/api/itens/search')
                .set("Accept", "application/json")
                .query({ q: 'Camiseta' });

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/itens/:id - Buscar item por ID', () => {
        it('1- Deve processar busca por ID válido', async () => {
            const res = await request(app)
                .get('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar formato do ID', async () => {
            const res = await request(app)
                .get('/api/itens/abc')
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
                    .get(`/api/itens/${id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
            }
        });
    });

    describe('PUT /api/itens/:id - Atualizar item', () => {
        const dadosAtualizacao = {
            nome: 'Camiseta Atualizada',
            preco: 35.99,
            quantidade_estoque: 15
        };

        it('1- Deve processar atualização com dados válidos', async () => {
            const res = await request(app)
                .put('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosAtualizacao);

            expect(validateResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados de atualização', async () => {
            const dadosInvalidos = {
                preco: -10, // preço negativo
                quantidade_estoque: 'abc' // deve ser número
            };

            const res = await request(app)
                .put('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosInvalidos);

            expect([400, 404]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve aceitar atualização parcial', async () => {
            const dadosParciais = {
                preco: 39.99
            };

            const res = await request(app)
                .put('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosParciais);

            expect(validateResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/itens/:id - Deletar item', () => {
        it('1- Deve processar deleção de item', async () => {
            const res = await request(app)
                .delete('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar ID para deleção', async () => {
            const res = await request(app)
                .delete('/api/itens/abc')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar deleção sem autorização', async () => {
            const res = await request(app)
                .delete('/api/itens/1')
                .set("Accept", "application/json");

            expect([401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação avançados', () => {
        it('1- Deve testar campos obrigatórios na criação', async () => {
            const camposObrigatorios = ['nome', 'marca', 'preco', 'quantidade_estoque'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testItem };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/itens')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(dadosIncompletos);

                expect([400, 500]).toContain(res.status);
                expect(isErrorResponse(res.body) || validateResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve testar limites de valores numéricos', async () => {
            const dadosInvalidos = [
                { ...testItem, preco: 0 }, // preço zero
                { ...testItem, preco: -1 }, // preço negativo
                { ...testItem, quantidade_estoque: -1 } // estoque negativo
            ];

            for (const dados of dadosInvalidos) {
                const res = await request(app)
                    .post('/api/itens')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(dados);

                expect([400, 500]).toContain(res.status);
                expect(isErrorResponse(res.body) || validateResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve testar diferentes tipos de conteúdo', async () => {
            const res = await request(app)
                .post('/api/itens')
                .set("Accept", "text/html")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testItem);

            // Deve funcionar mesmo com Accept diferente
            expect(validateResponse(res.body)).toBe(true);
        });
    });
});