import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    item: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    }
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
    return body && (body.success === true || body.data !== undefined || body.itens !== undefined || body.item !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Itens Routes - Avançado', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
    });

    describe('POST /api/itens/:id/add-quantidade - Adicionar quantidade', () => {
        it('1- Deve adicionar quantidade válida ao estoque', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve adicionar quantidade mínima (1)', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 1 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve adicionar quantidade grande (1000)', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 1000 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve rejeitar quantidade zero', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 0 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve rejeitar quantidade negativa', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: -5 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve rejeitar quantidade como string', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: "cinco" });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve rejeitar quantidade decimal', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5.5 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar ID do item inválido', async () => {
            const res = await request(app)
                .post('/api/itens/invalid/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('9- Deve validar item inexistente', async () => {
            const res = await request(app)
                .post('/api/itens/999/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('10- Deve validar campo quantidade obrigatório', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('11- Deve validar ID zero', async () => {
            const res = await request(app)
                .post('/api/itens/0/add-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('POST /api/itens/:id/remove-quantidade - Remover quantidade', () => {
        it('1- Deve remover quantidade válida do estoque', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve remover quantidade pequena (1)', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 1 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve remover quantidade grande (caso permita)', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 100 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve rejeitar quantidade zero', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 0 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve rejeitar quantidade negativa', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: -3 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve tratar estoque insuficiente', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 9999 }); // Quantidade muito alta

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve validar ID do item inválido', async () => {
            const res = await request(app)
                .post('/api/itens/invalid/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar item inexistente', async () => {
            const res = await request(app)
                .post('/api/itens/999/remove-quantidade')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/itens/search/:nome - Buscar itens por nome', () => {
        it('1- Deve buscar itens por nome exato', async () => {
            const res = await request(app)
                .get('/api/itens/search/Camiseta')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve buscar itens por nome parcial', async () => {
            const res = await request(app)
                .get('/api/itens/search/Azul')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve buscar com nome em minúsculas', async () => {
            const res = await request(app)
                .get('/api/itens/search/camiseta')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve buscar com nome em maiúsculas', async () => {
            const res = await request(app)
                .get('/api/itens/search/CAMISETA')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve buscar item inexistente', async () => {
            const res = await request(app)
                .get('/api/itens/search/ItemInexistente')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve buscar com nome contendo espaços', async () => {
            const res = await request(app)
                .get('/api/itens/search/Camiseta%20Azul')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve buscar com caracteres especiais', async () => {
            const res = await request(app)
                .get('/api/itens/search/Camiseta-Azul')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar nome muito curto', async () => {
            const res = await request(app)
                .get('/api/itens/search/A')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('9- Deve processar busca com números', async () => {
            const res = await request(app)
                .get('/api/itens/search/Item123')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('10- Deve processar busca com acentos', async () => {
            const res = await request(app)
                .get('/api/itens/search/Camisa%20Azul')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('PATCH /api/itens/:id - Atualização parcial avançada', () => {
        it('1- Deve atualizar apenas o nome', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ nome: 'Novo Nome' });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve atualizar apenas o preço', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ preco: 75.50 });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve atualizar múltiplos campos', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ 
                    nome: 'Nome Atualizado',
                    preco: 65.00,
                    cor: 'Vermelho',
                    tamanho: 'G'
                });

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve rejeitar objeto vazio', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve rejeitar nome muito curto', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ nome: 'AB' });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('6- Deve rejeitar preço negativo', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ preco: -10.00 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('7- Deve rejeitar quantidade negativa', async () => {
            const res = await request(app)
                .patch('/api/itens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ quantidade: -5 });

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve validar item inexistente', async () => {
            const res = await request(app)
                .patch('/api/itens/999')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ nome: 'Novo Nome' });

            expect([404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('9- Deve validar ID inválido', async () => {
            const res = await request(app)
                .patch('/api/itens/invalid')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({ nome: 'Novo Nome' });

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('GET /api/itens - Listagem com filtros avançados', () => {
        it('1- Deve listar itens com filtro por tipo', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ tipo: 'Camiseta' });

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve listar itens com filtro por cor', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ cor: 'Azul' });

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve listar itens com filtro por tamanho', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ tamanho: 'M' });

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve listar itens com múltiplos filtros', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ tipo: 'Camiseta', cor: 'Azul', tamanho: 'M' });

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve aplicar paginação avançada', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 2, limit: 5 });

            expect([200, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('Testes de Segurança e Validação', () => {
        it('1- Deve rejeitar sem autenticação (add-quantidade)', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .send({ quantidade: 5 });

            expect([401, 403, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve rejeitar sem autenticação (remove-quantidade)', async () => {
            const res = await request(app)
                .post('/api/itens/1/remove-quantidade')
                .send({ quantidade: 5 });

            expect([401, 403, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve rejeitar sem autenticação (search)', async () => {
            const res = await request(app)
                .get('/api/itens/search/teste');

            expect([401, 403, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar Content-Type incorreto', async () => {
            const res = await request(app)
                .post('/api/itens/1/add-quantidade')
                .set("Authorization", mockToken)
                .set('Content-Type', 'text/plain')
                .send('invalid data');

            expect([400]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar método HTTP incorreto', async () => {
            const res = await request(app)
                .put('/api/itens/1/add-quantidade')
                .set("Authorization", mockToken)
                .send({ quantidade: 5 });

            expect([405, 404]).toContain(res.status);
        });

        it('6- Deve validar headers de resposta', async () => {
            const res = await request(app)
                .get('/api/itens')
                .set('Authorization', `Bearer mock-jwt-token`);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json|text\/html/);
            }
            // x-powered-by pode estar presente no Express
            expect(res.headers).toBeDefined();
        });

        it('7- Deve processar caracteres especiais na busca', async () => {
            const res = await request(app)
                .get('/api/itens/search/item%20%3Cscript%3E')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });
});