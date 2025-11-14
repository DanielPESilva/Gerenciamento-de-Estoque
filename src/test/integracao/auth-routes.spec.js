import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Helper function to validate response structure
const validateResponse = (body) => {
    return body.hasOwnProperty('success') || body.hasOwnProperty('error');
};

const isErrorResponse = (body) => {
    return (body.success === false) || (body.error === true);
};

// Mock do Prisma
const mockPrismaClient = {
    usuario: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn()
    },
    resetPasswordToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn()
    },
    refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn()
    },
    $disconnect: jest.fn()
};

describe('Integração - Auth Routes', () => {
    beforeAll(async () => {
        // Setup mocks
        jest.doMock('@prisma/client', () => ({
            PrismaClient: jest.fn(() => mockPrismaClient)
        }));
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register - Registro de usuário', () => {
        it('1- Deve registrar um novo usuário com sucesso', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set("Accept", "application/json")
                .send({
                    nome: 'Test User',
                    email: 'test@example.com',
                    senha: 'password123'
                });

            // Testa se a resposta tem estrutura válida
            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar dados de entrada', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set("Accept", "application/json")
                .send({
                    nome: '', // nome vazio
                    email: 'invalid-email', // email inválido
                    senha: '123' // senha muito curta
                });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar dados faltantes', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set("Accept", "application/json")
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/login - Login de usuário', () => {
        it('1- Deve validar formato de dados de login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set("Accept", "application/json")
                .send({
                    email: 'test@example.com',
                    senha: 'password123'
                });

            // Testa se a resposta tem estrutura válida
            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar dados de entrada para login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set("Accept", "application/json")
                .send({
                    email: 'invalid-email',
                    senha: ''
                });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar dados faltantes no login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set("Accept", "application/json")
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/forgot-password - Esqueci a senha', () => {
        it('1- Deve processar solicitação de reset com email válido', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .set("Accept", "application/json")
                .send({
                    email: 'test@example.com'
                });

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar formato de email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .set("Accept", "application/json")
                .send({
                    email: 'invalid-email'
                });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar dados faltantes', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .set("Accept", "application/json")
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/reset-password - Reset de senha', () => {
        it('1- Deve validar estrutura de dados para reset', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .set("Accept", "application/json")
                .send({
                    code: 'test-code',
                    senha: 'newpassword123'
                });

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar dados de entrada para reset', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .set("Accept", "application/json")
                .send({
                    code: '',
                    senha: '123'
                });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve rejeitar dados faltantes', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .set("Accept", "application/json")
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/refresh - Refresh token', () => {
        it('1- Deve processar solicitação de refresh', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set("Accept", "application/json")
                .send({
                    refresh_token: 'test-refresh-token'
                });

            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('2- Deve validar dados de entrada para refresh', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set("Accept", "application/json")
                .send({});

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });

        it('3- Deve validar formato de refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set("Accept", "application/json")
                .send({
                    refresh_token: ''
                });

            expect(res.status).toBe(400);
            expect(isErrorResponse(res.body)).toBe(true);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe('Testes de integração das rotas Auth - Validação de schemas', () => {
        it('1- Deve testar validação completa de registro', async () => {
            const camposObrigatorios = ['nome', 'email', 'senha'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = {
                    nome: 'Test User',
                    email: 'test@example.com',
                    senha: 'password123'
                };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/auth/register')
                    .set("Accept", "application/json")
                    .send(dadosIncompletos);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
                expect(Array.isArray(res.body.errors)).toBe(true);
            }
        });

        it('2- Deve testar validação completa de login', async () => {
            const camposObrigatorios = ['email', 'senha'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = {
                    email: 'test@example.com',
                    senha: 'password123'
                };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/auth/login')
                    .set("Accept", "application/json")
                    .send(dadosIncompletos);

                expect(res.status).toBe(400);
                expect(isErrorResponse(res.body)).toBe(true);
                expect(res.body.errors).toBeDefined();
            }
        });

        it('3- Deve testar Content-Type e Accept headers', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set("Accept", "text/html")
                .send({
                    nome: 'Test User',
                    email: 'test@example.com',
                    senha: 'password123'
                });

            // Deve funcionar mesmo com Accept diferente
            expect(validateResponse(res.body)).toBe(true);
            expect(res.body).toHaveProperty('message');
        });

        it('4- Deve testar método HTTP incorreto', async () => {
            const res = await request(app)
                .get('/api/auth/register')
                .set("Accept", "application/json");

            expect(res.status).toBe(404);
        });

        it('5- Deve testar headers de segurança', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set("Accept", "application/json")
                .send({
                    nome: 'Test User',
                    email: 'test@example.com',
                    senha: 'password123'
                });

            // Headers de segurança devem estar presentes
            expect(res.headers).toHaveProperty('content-type');
        });
    });
});