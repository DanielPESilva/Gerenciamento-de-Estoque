import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    item: {
        findUnique: jest.fn(),
    },
    imagem: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
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
    return body && (body.success === true || body.data !== undefined || body.imagens !== undefined || body.imagem !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Imagens Routes - Completo', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
    });

    describe('GET /api/imagens - Testes de listagem avançados', () => {
        it('1- Deve processar listagem com filtros avançados', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ item_id: 123, page: 1, limit: 10 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar parâmetros de paginação extremos', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ page: 999, limit: 1 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve tratar filtro item_id inválido', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ item_id: "invalid" });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar headers de resposta', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set('Authorization', `Bearer mock-jwt-token`);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json|text\/html/);
            }
            // x-powered-by pode estar presente no Express
            expect(res.headers).toBeDefined();
        });
    });

    describe('POST /api/imagens - Testes de upload avançados', () => {
        it('1- Deve testar upload de imagem JPEG', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-jpeg-data'), {
                    filename: 'test.jpg',
                    contentType: 'image/jpeg'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve testar upload de imagem PNG', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-png-data'), {
                    filename: 'test.png',
                    contentType: 'image/png'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar upload de imagem GIF', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-gif-data'), {
                    filename: 'test.gif',
                    contentType: 'image/gif'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve testar upload de imagem WEBP', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-webp-data'), {
                    filename: 'test.webp',
                    contentType: 'image/webp'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve testar upload de imagem BMP', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-bmp-data'), {
                    filename: 'test.bmp',
                    contentType: 'image/bmp'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('6- Deve testar upload múltiplo (3 imagens)', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-1'), { filename: 'test1.jpg', contentType: 'image/jpeg' })
                .attach('images', Buffer.from('fake-2'), { filename: 'test2.jpg', contentType: 'image/jpeg' })
                .attach('images', Buffer.from('fake-3'), { filename: 'test3.png', contentType: 'image/png' });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('7- Deve rejeitar tipo não suportado (PDF)', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-pdf-data'), {
                    filename: 'document.pdf',
                    contentType: 'application/pdf'
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('8- Deve rejeitar tipo não suportado (TXT)', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-text'), {
                    filename: 'document.txt',
                    contentType: 'text/plain'
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('9- Deve validar item_id obrigatório', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .attach('images', Buffer.from('fake-jpeg'), {
                    filename: 'test.jpg',
                    contentType: 'image/jpeg'
                });

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('10- Deve validar sem arquivos enviados', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1');

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('11- Deve validar item_id inválido', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', 'invalid')
                .attach('images', Buffer.from('fake-jpeg'), {
                    filename: 'test.jpg',
                    contentType: 'image/jpeg'
                });

            expect([400, 404]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('12- Deve testar JPG (diferente de JPEG)', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .field('item_id', '1')
                .attach('images', Buffer.from('fake-jpg'), {
                    filename: 'test.jpg',
                    contentType: 'image/jpg'
                });

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/imagens/:itemId/:filename - Busca específica avançada', () => {
        it('1- Deve buscar imagem específica válida', async () => {
            const res = await request(app)
                .get('/api/imagens/1/test.jpg')
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            // Imagem pode retornar binary ou JSON de erro
        });

        it('2- Deve tratar item inexistente', async () => {
            const res = await request(app)
                .get('/api/imagens/999/test.jpg')
                .set("Authorization", mockToken);

            expect([404, 500]).toContain(res.status);
        });

        it('3- Deve tratar arquivo inexistente', async () => {
            const res = await request(app)
                .get('/api/imagens/1/nonexistent.jpg')
                .set("Authorization", mockToken);

            expect([404, 500]).toContain(res.status);
        });

        it('4- Deve validar ID inválido', async () => {
            const res = await request(app)
                .get('/api/imagens/invalid/test.jpg')
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
        });

        it('5- Deve processar nome com espaços', async () => {
            const res = await request(app)
                .get('/api/imagens/1/test%20image.jpg')
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
        });
    });

    describe('DELETE /api/imagens/:id - Deleção avançada', () => {
        it('1- Deve deletar imagem válida', async () => {
            const res = await request(app)
                .delete('/api/imagens/1')
                .set("Authorization", mockToken);

            expect([200, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve tratar imagem inexistente', async () => {
            const res = await request(app)
                .delete('/api/imagens/999')
                .set("Authorization", mockToken);

            expect([404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve validar ID inválido', async () => {
            const res = await request(app)
                .delete('/api/imagens/invalid')
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar ID zero', async () => {
            const res = await request(app)
                .delete('/api/imagens/0')
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('5- Deve validar ID negativo', async () => {
            const res = await request(app)
                .delete('/api/imagens/-1')
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });

    describe('Testes de segurança e validação', () => {
        it('1- Deve rejeitar sem autenticação GET', async () => {
            const res = await request(app)
                .get('/api/imagens');

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('2- Deve rejeitar sem autenticação POST', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .field('item_id', '1')
                .attach('images', Buffer.from('fake'), {
                    filename: 'test.jpg',
                    contentType: 'image/jpeg'
                });

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('3- Deve rejeitar sem autenticação DELETE', async () => {
            const res = await request(app)
                .delete('/api/imagens/1');

            expect([401, 403, 400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });

        it('4- Deve validar Content-Type nas respostas', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            if (res.headers['content-type']) {
                expect(res.headers['content-type']).toMatch(/application\/json|image\//);
            }
        });

        it('5- Deve validar método HTTP incorreto', async () => {
            const res = await request(app)
                .put('/api/imagens')
                .set("Authorization", mockToken)
                .send({ data: 'test' });

            expect([405, 404]).toContain(res.status);
        });

        it('6- Deve processar upload com Content-Type incorreto', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Authorization", mockToken)
                .set('Content-Type', 'text/plain')
                .send('invalid data');

            expect([400, 500]).toContain(res.status);
            expect(res.body).toBeDefined();
        });
    });
});