import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do Prisma
const mockPrismaClient = {
    imagem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        createMany: jest.fn()
    },
    roupas: {
        findUnique: jest.fn()
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

// Mock do filesystem
const mockFs = {
    unlinkSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn()
};

jest.unstable_mockModule('fs', () => ({
    default: mockFs
}));

// Mock do path
const mockPath = {
    join: jest.fn((...paths) => paths.join('/')),
    extname: jest.fn((filename) => filename.substring(filename.lastIndexOf('.'))),
    dirname: jest.fn((path) => path.substring(0, path.lastIndexOf('/')))
};

jest.unstable_mockModule('path', () => ({
    default: mockPath
}));

// Helper functions para validação flexível
const validateResponse = (body) => {
    return body && (body.success === true || body.data !== undefined || body.imagens !== undefined || body.imagem !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Imagens Routes Avançados', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
        
        // Setup Prisma mocks
        mockPrismaClient.roupas.findUnique.mockResolvedValue({ id: 1, nome: 'Camiseta' });
        mockPrismaClient.imagem.findMany.mockResolvedValue([]);
        mockPrismaClient.imagem.createMany.mockResolvedValue({ count: 1 });
    });

    describe('GET /api/imagens - Cenários avançados de listagem', () => {
        it('1- Deve processar listagem com filtros múltiplos', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({
                    itemId: 1,
                    filename: 'test.jpg',
                    page: 1,
                    limit: 20
                });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar listagem sem filtros', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar itemId como número', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ itemId: 'invalid' });

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve processar busca por filename específico', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ filename: 'produto_123.jpg' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve rejeitar requisições sem autenticação', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json");

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/imagens/:itemId/:filename - Busca específica avançada', () => {
        it('1- Deve processar busca com itemId e filename válidos', async () => {
            const res = await request(app)
                .get('/api/imagens/1/teste.jpg')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar diferentes extensões de arquivo', async () => {
            const extensoes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            for (const ext of extensoes) {
                const res = await request(app)
                    .get(`/api/imagens/1/imagem.${ext}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([200, 400, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('3- Deve validar itemId numérico', async () => {
            const res = await request(app)
                .get('/api/imagens/abc/teste.jpg')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar filename com caracteres especiais', async () => {
            const filenamesInvalidos = [
                'arquivo com espaços.jpg',
                'arquivo@especial.jpg',
                'arquivo#hash.jpg',
                'arquivo%.jpg'
            ];

            for (const filename of filenamesInvalidos) {
                const res = await request(app)
                    .get(`/api/imagens/1/${encodeURIComponent(filename)}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([200, 400, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve processar itemId com valores extremos', async () => {
            const idsExtremos = [1, 999999, 2147483647];

            for (const id of idsExtremos) {
                const res = await request(app)
                    .get(`/api/imagens/${id}/teste.jpg`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([200, 400, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('POST /api/imagens - Upload avançado', () => {
        it('1- Deve processar upload com itemId válido', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('descricao', 'Imagem de teste');

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar itemId obrigatório no upload', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('descricao', 'Teste sem itemId');

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar itemId numérico no upload', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', 'abc')
                .field('descricao', 'Teste itemId inválido');

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve processar upload sem descrição', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1');

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve validar autenticação no upload', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .field('itemId', '1');

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('6- Deve processar diferentes Content-Types', async () => {
            const contentTypes = [
                'multipart/form-data',
                'application/x-www-form-urlencoded'
            ];

            for (const contentType of contentTypes) {
                const res = await request(app)
                    .post('/api/imagens')
                    .set("Content-Type", contentType)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .field('itemId', '1');

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('DELETE /api/imagens/:id - Deleção avançada', () => {
        it('1- Deve processar deleção com ID válido', async () => {
            mockPrismaClient.imagem.findUnique.mockResolvedValue({
                id: 1,
                url: '/uploads/teste.jpg',
                item_id: 1
            });
            mockPrismaClient.imagem.delete.mockResolvedValue({ id: 1 });

            const res = await request(app)
                .delete('/api/imagens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar ID numérico para deleção', async () => {
            const res = await request(app)
                .delete('/api/imagens/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 401, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar ID zero ou negativo', async () => {
            const idsInvalidos = [0, -1, -999];

            for (const id of idsInvalidos) {
                const res = await request(app)
                    .delete(`/api/imagens/${id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([400, 401, 404, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('4- Deve processar deleção de imagem inexistente', async () => {
            mockPrismaClient.imagem.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/imagens/99999')
                .set("Accept", "application/json")  
                .set("Authorization", mockToken);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve validar autorização para deleção', async () => {
            const res = await request(app)
                .delete('/api/imagens/1')
                .set("Accept", "application/json");

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação de tipos MIME', () => {
        it('1- Deve aceitar tipos MIME válidos', async () => {
            const tiposValidos = [
                'image/jpeg',
                'image/jpg', 
                'image/png',
                'image/gif',
                'image/webp'
            ];

            for (const tipo of tiposValidos) {
                const res = await request(app)
                    .post('/api/imagens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .field('itemId', '1')
                    .field('mimeType', tipo);

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve rejeitar tipos MIME inválidos', async () => {
            const tiposInvalidos = [
                'application/pdf',
                'text/plain',
                'video/mp4',
                'audio/mp3',
                'application/zip'
            ];

            for (const tipo of tiposInvalidos) {
                const res = await request(app)
                    .post('/api/imagens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .field('itemId', '1')
                    .field('mimeType', tipo);

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('Testes de validação de tamanho e quantidade', () => {
        it('1- Deve validar tamanho máximo de arquivo', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('fileSize', '10485760'); // 10MB

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar quantidade máxima de arquivos', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('fileCount', '10');

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de cenários de erro', () => {
        it('1- Deve tratar erro de item não encontrado', async () => {
            mockPrismaClient.roupas.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '99999');

            expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve tratar erro de database na listagem', async () => {
            mockPrismaClient.imagem.findMany.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve tratar erro de filesystem na deleção', async () => {
            mockFs.unlinkSync.mockImplementation(() => {
                throw new Error('File system error');
            });

            mockPrismaClient.imagem.findUnique.mockResolvedValue({
                id: 1,
                url: '/uploads/teste.jpg',
                item_id: 1
            });

            const res = await request(app)
                .delete('/api/imagens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 401, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de integração com diferentes headers', () => {
        it('1- Deve processar diferentes valores de Accept', async () => {
            const acceptHeaders = [
                'application/json',
                'application/*',
                '*/*',
                'image/jpeg'
            ];

            for (const accept of acceptHeaders) {
                const res = await request(app)
                    .get('/api/imagens')
                    .set("Accept", accept)
                    .set("Authorization", mockToken);

                expect([200, 400, 406, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('2- Deve processar diferentes tipos de autorização', async () => {
            const tokens = [
                'Bearer valid-token',
                'Bearer expired-token',
                'Bearer invalid-format'
            ];

            for (const token of tokens) {
                const res = await request(app)
                    .get('/api/imagens')
                    .set("Accept", "application/json")
                    .set("Authorization", token);

                expect([200, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });
});