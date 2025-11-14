import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import ImagensRepository from '../../repository/imagensRepository.js';

// Mock do Prisma
jest.mock('../../models/prisma.js', () => ({
    imagens: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        delete: jest.fn()
    },
    roupas: {
        findUnique: jest.fn()
    }
}));

// Obter referência ao mock
const mockPrisma = require('../../models/prisma.js');

describe('ImagensRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('buscarImagensPorItem', () => {
        test('should return images for specific item', async () => {
            const mockImages = [
                {
                    id: 1,
                    url: 'http://example.com/image1.jpg',
                    item_id: 1,
                    criado_em: new Date()
                },
                {
                    id: 2,
                    url: 'http://example.com/image2.jpg',
                    item_id: 1,
                    criado_em: new Date()
                }
            ];

            mockPrisma.imagens.findMany.mockResolvedValue(mockImages);

            const result = await ImagensRepository.buscarImagensPorItem(1);

            expect(result).toEqual(mockImages);
            expect(mockPrisma.imagens.findMany).toHaveBeenCalledWith({
                where: {
                    item_id: 1
                },
                select: {
                    id: true,
                    url: true,
                    item_id: true,
                    criado_em: true
                }
            });
        });

        test('should return empty array when no images found', async () => {
            mockPrisma.imagens.findMany.mockResolvedValue([]);

            const result = await ImagensRepository.buscarImagensPorItem(999);

            expect(result).toEqual([]);
            expect(mockPrisma.imagens.findMany).toHaveBeenCalledWith({
                where: {
                    item_id: 999
                },
                select: {
                    id: true,
                    url: true,
                    item_id: true,
                    criado_em: true
                }
            });
        });
    });

    describe('deletarImagem', () => {
        test('should delete image by id', async () => {
            const mockDeletedImage = {
                id: 1,
                url: 'http://example.com/image1.jpg',
                item_id: 1
            };

            mockPrisma.imagens.delete.mockResolvedValue(mockDeletedImage);

            const result = await ImagensRepository.deletarImagem(1);

            expect(result).toEqual(mockDeletedImage);
            expect(mockPrisma.imagens.delete).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
                select: {
                    id: true,
                    url: true,
                    item_id: true
                }
            });
        });
    });

    describe('buscarPorId', () => {
        test('should return image by id', async () => {
            const mockImage = {
                id: 1,
                url: 'http://example.com/image1.jpg',
                item_id: 1,
                criado_em: new Date()
            };

            mockPrisma.imagens.findUnique.mockResolvedValue(mockImage);

            const result = await ImagensRepository.buscarPorId(1);

            expect(result).toEqual(mockImage);
            expect(mockPrisma.imagens.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    url: true,
                    item_id: true,
                    criado_em: true
                }
            });
        });

        test('should return null for non-existent image', async () => {
            mockPrisma.imagens.findUnique.mockResolvedValue(null);

            const result = await ImagensRepository.buscarPorId(999);

            expect(result).toBeNull();
        });
    });

    describe('buscarPorUrl', () => {
        test('should return images by item id and url', async () => {
            const mockImages = [
                {
                    id: 1,
                    url: 'http://example.com/image1.jpg',
                    item_id: 1,
                    criado_em: new Date()
                }
            ];

            mockPrisma.imagens.findMany.mockResolvedValue(mockImages);

            const result = await ImagensRepository.buscarPorUrl(1, 'http://example.com/image1.jpg');

            expect(result).toEqual(mockImages);
            expect(mockPrisma.imagens.findMany).toHaveBeenCalledWith({
                where: {
                    item_id: 1,
                    url: 'http://example.com/image1.jpg'
                }
            });
        });

        test('should return empty array when no matching images found', async () => {
            mockPrisma.imagens.findMany.mockResolvedValue([]);

            const result = await ImagensRepository.buscarPorUrl(1, 'http://example.com/nonexistent.jpg');

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        test('should create multiple images', async () => {
            const imageData = [
                {
                    url: 'http://example.com/image1.jpg',
                    item_id: 1
                },
                {
                    url: 'http://example.com/image2.jpg',
                    item_id: 1
                }
            ];

            mockPrisma.imagens.createMany.mockResolvedValue({ count: 2 });

            const result = await ImagensRepository.create(imageData);

            expect(result).toBe(2);
            expect(mockPrisma.imagens.createMany).toHaveBeenCalledWith({
                data: imageData
            });
        });

        test('should return 0 when no images created', async () => {
            mockPrisma.imagens.createMany.mockResolvedValue({ count: 0 });

            const result = await ImagensRepository.create([]);

            expect(result).toBe(0);
        });
    });

    describe('itemExists', () => {
        test('should return item when it exists', async () => {
            const mockItem = {
                id: 1,
                nome: 'Camisa Polo'
            };

            mockPrisma.roupas.findUnique.mockResolvedValue(mockItem);

            const result = await ImagensRepository.itemExists(1);

            expect(result).toEqual(mockItem);
            expect(mockPrisma.roupas.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    nome: true
                }
            });
        });

        test('should return null when item does not exist', async () => {
            mockPrisma.roupas.findUnique.mockResolvedValue(null);

            const result = await ImagensRepository.itemExists(999);

            expect(result).toBeNull();
        });
    });
});