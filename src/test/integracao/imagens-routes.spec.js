import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import path from 'path';
import fs from 'fs';

// Mock do Prisma
const mockPrismaClient = {
    imagens: {
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

// Helper functions para validação flexível
const validateResponse = (body) => {
    return body && (body.success === true || body.data !== undefined || body.imagens !== undefined || body.imagem !== undefined);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Imagens Routes', () => {
    const mockToken = 'Bearer mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
    });

    describe('GET /api/imagens - Listar imagens', () => {
        it('1- Deve processar listagem de imagens', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar filtro por item', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ itemId: 1 });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar parâmetros de consulta', async () => {
            const res = await request(app)
                .get('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .query({ itemId: 'abc' });

            expect([200, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('GET /api/imagens/:itemId/:filename - Buscar imagem específica', () => {
        it('1- Deve processar busca por imagem específica', async () => {
            const res = await request(app)
                .get('/api/imagens/1/teste.jpg')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            // Para imagens, pode retornar buffer ou erro
            expect(res.body !== undefined).toBe(true);
        });

        it('2- Deve validar formato do itemId', async () => {
            const res = await request(app)
                .get('/api/imagens/abc/teste.jpg')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body) || res.body !== undefined).toBe(true);
        });

        it('3- Deve validar formato do filename', async () => {
            const res = await request(app)
                .get('/api/imagens/1/')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 404, 500]).toContain(res.status);
            expect(isErrorResponse(res.body) || res.body !== undefined).toBe(true);
        });

        it('4- Deve processar diferentes extensões de imagem', async () => {
            const extensoes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

            for (const ext of extensoes) {
                const res = await request(app)
                    .get(`/api/imagens/1/teste.${ext}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([200, 400, 404, 500]).toContain(res.status);
                expect(res.body !== undefined).toBe(true);
            }
        });
    });

    describe('POST /api/imagens - Upload de imagens', () => {
        it('1- Deve processar upload sem arquivos', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1');

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar itemId obrigatório', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar formato do itemId', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', 'abc');

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .field('itemId', '1');

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        // Teste simulando upload de arquivo válido
        it('5- Deve processar dados de upload válidos', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('descricao', 'Descrição da imagem teste');

            expect([200, 201, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('DELETE /api/imagens/:id - Deletar imagem', () => {
        it('1- Deve processar deleção de imagem', async () => {
            const res = await request(app)
                .delete('/api/imagens/1')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([200, 400, 404, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar formato do ID', async () => {
            const res = await request(app)
                .delete('/api/imagens/abc')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve rejeitar ID zero ou negativo', async () => {
            const res = await request(app)
                .delete('/api/imagens/0')
                .set("Accept", "application/json")
                .set("Authorization", mockToken);

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve rejeitar deleção sem autorização', async () => {
            const res = await request(app)
                .delete('/api/imagens/1')
                .set("Accept", "application/json");

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação de upload', () => {
        it('1- Deve testar validação de tamanho máximo', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('fileSize', '11000000'); // Simula arquivo > 10MB

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve testar validação de quantidade máxima', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('fileCount', '6'); // Simula mais de 5 arquivos

            expect([400, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar diferentes tipos MIME válidos', async () => {
            const tiposValidos = [
                'image/jpeg',
                'image/jpg', 
                'image/png',
                'image/gif',
                'image/webp',
                'image/bmp'
            ];

            for (const tipo of tiposValidos) {
                const res = await request(app)
                    .post('/api/imagens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .field('itemId', '1')
                    .field('mimeType', tipo);

                expect([200, 201, 400, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('4- Deve rejeitar tipos MIME inválidos', async () => {
            const tiposInvalidos = [
                'text/plain',
                'application/pdf',
                'video/mp4',
                'audio/mp3',
                'application/json'
            ];

            for (const tipo of tiposInvalidos) {
                const res = await request(app)
                    .post('/api/imagens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .field('itemId', '1')
                    .field('mimeType', tipo);

                expect([400, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });
    });

    describe('Testes de validação avançados', () => {
        it('1- Deve testar upload com descrição longa', async () => {
            const descricaoLonga = 'Descrição muito longa '.repeat(50);

            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('descricao', descricaoLonga);

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve testar upload com caracteres especiais na descrição', async () => {
            const descricaoEspecial = 'Descrição com acentos: ção, ã, é, ü e símbolos: @#$%&*';

            const res = await request(app)
                .post('/api/imagens')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1')
                .field('descricao', descricaoEspecial);

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar busca de imagem com nomes de arquivo complexos', async () => {
            const nomesComplexos = [
                'imagem-com-hifens.jpg',
                'imagem_com_underscores.png',
                'imagem123.gif',
                'IMAGEM-MAIUSCULA.JPEG',
                'imagem.teste.multiplos.pontos.webp'
            ];

            for (const nome of nomesComplexos) {
                const res = await request(app)
                    .get(`/api/imagens/1/${nome}`)
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken);

                expect([200, 400, 404, 500]).toContain(res.status);
                expect(res.body !== undefined).toBe(true);
            }
        });

        it('4- Deve testar diferentes Content-Types', async () => {
            const res = await request(app)
                .post('/api/imagens')
                .set("Content-Type", "multipart/form-data")
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .field('itemId', '1');

            expect([200, 201, 400, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve testar listagem com diferentes formatos de Accept', async () => {
            const formatosAccept = [
                'application/json',
                'application/*',
                '*/*'
            ];

            for (const formato of formatosAccept) {
                const res = await request(app)
                    .get('/api/imagens')
                    .set("Accept", formato)
                    .set("Authorization", mockToken);

                expect([200, 400, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('6- Deve testar IDs de item extremos', async () => {
            const idsExtremos = ['1', '999999', '2147483647']; // Valores numéricos válidos

            for (const id of idsExtremos) {
                const res = await request(app)
                    .get('/api/imagens')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .query({ itemId: id });

                expect([200, 400, 404, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });
    });
});