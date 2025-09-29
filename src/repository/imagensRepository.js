import prisma from "../models/prisma.js";

class ImagensRepository {

    static async buscarImagensPorItem(itemId) {
        return await prisma.imagens.findMany({
            where: {
                item_id: itemId
            },
            select: {
                id: true,
                url: true,
                item_id: true,
                criado_em: true
            }
        });
    }

    static async deletarImagem(id) {
        return await prisma.imagens.delete({
            where: {
                id: id
            },
            select: {
                id: true,
                url: true,
                item_id: true
            }
        });
    }

    static async buscarPorId(id) {
        return await prisma.imagens.findUnique({
            where: { id: id },
            select: {
                id: true,
                url: true,
                item_id: true,
                criado_em: true
            }
        });
    }

    static async buscarPorUrl(itemId, url) {
        return await prisma.imagens.findMany({
            where: { 
                item_id: itemId, 
                url: url 
            }
        });
    }

    static async create(dataInsert) {
        const insert = await prisma.imagens.createMany({
            data: dataInsert
        });
        return insert.count;
    }

    static async itemExists(id) {
        return await prisma.roupas.findUnique({
            where: { id: id },
            select: {
                id: true,
                nome: true
            }
        });
    }
}

export default ImagensRepository;