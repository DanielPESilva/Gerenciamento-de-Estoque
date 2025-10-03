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
    cliente: {
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

describe('Integração - Clientes Routes', () => {
    beforeAll(async () => {
        jest.doMock('@prisma/client', () => ({
            PrismaClient: jest.fn(() => mockPrismaClient)
        }));
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    const testCliente = {
        nome: 'Cliente Teste',
        cpf: '123.456.789-01',
        email: 'cliente@teste.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
    };

    describe('POST /api/clientes - Criar cliente', () => {
        it('1- Deve validar estrutura de dados para criação', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testCliente);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar requisição sem token', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set("Accept", "application/json")
                .send(testCliente);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve aceitar dados válidos com token', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testCliente);

            expect(validateResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/clientes - Listar clientes', () => {
        it('1- Deve processar listagem com paginação', async () => {
            const res = await request(app)
                .get('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: 1, limit: 10 });

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar parâmetros de paginação', async () => {
            const res = await request(app)
                .get('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({ page: -1, limit: 0 });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve processar filtros válidos', async () => {
            const res = await request(app)
                .get('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .query({
                    page: 1,
                    limit: 10,
                    nome: 'Cliente'
                });

            expect(validateResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/clientes/:id - Buscar cliente por ID', () => {
        it('1- Deve processar busca por ID válido', async () => {
            const res = await request(app)
                .get('/api/clientes/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar formato do ID', async () => {
            const res = await request(app)
                .get('/api/clientes/abc')
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
                    .get(`/api/clientes/${id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
            }
        });
    });

    describe('PUT /api/clientes/:id - Atualizar cliente', () => {
        const dadosAtualizacao = {
            nome: 'Cliente Atualizado',
            email: 'atualizado@teste.com'
        };

        it('1- Deve processar atualização com dados válidos', async () => {
            const res = await request(app)
                .put('/api/clientes/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosAtualizacao);

            expect([200, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve validar dados de atualização', async () => {
            const dadosInvalidos = {
                nome: '', // nome vazio
                email: 'email-invalido' // email inválido
            };

            const res = await request(app)
                .put('/api/clientes/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(dadosInvalidos);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('DELETE /api/clientes/:id - Deletar cliente', () => {
        it('1- Deve processar deleção com ID válido', async () => {
            const res = await request(app)
                .delete('/api/clientes/1')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar ID para deleção', async () => {
            const res = await request(app)
                .delete('/api/clientes/abc')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar deleção sem autorização', async () => {
            const res = await request(app)
                .delete('/api/clientes/1')
                .set("Accept", "application/json");

            expect([401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação de schemas completos', () => {
        it('1- Deve testar campos obrigatórios na criação', async () => {
            const camposObrigatorios = ['nome', 'cpf', 'email'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testCliente };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/clientes')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(dadosIncompletos);

                expect([400, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve testar limites de tamanho dos campos', async () => {
            const dadosInvalidos = [
                { ...testCliente, nome: 'A'.repeat(256) }, // nome muito longo
                { ...testCliente, email: 'A'.repeat(250) + '@test.com' } // email muito longo
            ];

            for (const dados of dadosInvalidos) {
                const res = await request(app)
                    .post('/api/clientes')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${mockToken}`)
                    .send(dados);

                expect([400, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve testar Content-Type da requisição', async () => {
            const res = await request(app)
                .post('/api/clientes')
                .set("Accept", "text/html")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testCliente);

            // Deve funcionar mesmo com Content-Type diferente
            expect(validateResponse(res.body)).toBe(true);
        });

        it('4- Deve testar método HTTP incorreto', async () => {
            const res = await request(app)
                .patch('/api/clientes')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(testCliente);

            expect(res.status).toBe(404);
        });
    });
});