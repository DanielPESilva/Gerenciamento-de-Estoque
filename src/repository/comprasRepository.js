import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ComprasRepository {
    // Listar todas as compras
    static async getAllCompras(filters = {}, pagination = { page: 1, limit: 10 }) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const where = {};

        // Aplicar filtros
        if (filters.data_inicio || filters.data_fim) {
            where.data_compra = {};
            if (filters.data_inicio) {
                where.data_compra.gte = new Date(`${filters.data_inicio}T00:00:00.000Z`);
            }
            if (filters.data_fim) {
                where.data_compra.lte = new Date(`${filters.data_fim}T23:59:59.999Z`);
            }
        }

        if (filters.fornecedor) {
            where.fornecendor = {
                contains: filters.fornecedor
            };
        }

        if (filters.valor_min || filters.valor_max) {
            where.valor_pago = {};
            if (filters.valor_min) where.valor_pago.gte = filters.valor_min;
            if (filters.valor_max) where.valor_pago.lte = filters.valor_max;
        }

        const [compras, total] = await Promise.all([
            prisma.compras.findMany({
                where,
                skip,
                take: limit,
                orderBy: { data_compra: 'desc' },
                include: {
                    ComprasItens: {
                        include: {
                            Roupa: true
                        }
                    }
                }
            }),
            prisma.compras.count({ where })
        ]);

        return {
            data: compras,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        };
    }

    // Buscar compra por ID
    static async getCompraById(id) {
        return await prisma.compras.findUnique({
            where: { id },
            include: {
                ComprasItens: {
                    include: {
                        Roupa: true
                    }
                }
            }
        });
    }

    // Criar nova compra
    static async createCompra(compraData) {
        return await prisma.$transaction(async (tx) => {
            const { itens, ...dadosCompra } = compraData;

            // Resolver itens (por ID ou nome)
            const itensResolvidos = [];
            for (const item of itens) {
                let roupa;

                if (item.roupas_id) {
                    // Buscar por ID
                    roupa = await tx.roupas.findUnique({
                        where: { id: item.roupas_id }
                    });
                    if (!roupa) {
                        throw new Error(`Item com ID ${item.roupas_id} não encontrado`);
                    }
                } else {
                    // Buscar por nome
                    roupa = await tx.roupas.findFirst({
                        where: { 
                            nome: item.nome_item
                        }
                    });
                    if (!roupa) {
                        throw new Error(`Item "${item.nome_item}" não encontrado`);
                    }
                }

                itensResolvidos.push({
                    roupas_id: roupa.id,
                    quantidade: item.quantidade,
                    valor_peca: item.valor_peca
                });
            }

            // Criar a compra
            const novaCompra = await tx.compras.create({
                data: dadosCompra
            });

            // Criar itens da compra
            for (const item of itensResolvidos) {
                await tx.comprasItens.create({
                    data: {
                        compras_id: novaCompra.id,
                        roupas_id: item.roupas_id,
                        quatidade: item.quantidade,
                        valor_peça: item.valor_peca
                    }
                });
            }

            // Retornar compra completa
            return await tx.compras.findUnique({
                where: { id: novaCompra.id },
                include: {
                    ComprasItens: {
                        include: {
                            Roupa: true
                        }
                    }
                }
            });
        });
    }

    // Atualizar compra
    static async updateCompra(id, updateData) {
        const compraAtualizada = await prisma.compras.update({
            where: { id },
            data: updateData,
            include: {
                ComprasItens: {
                    include: {
                        Roupa: true
                    }
                }
            }
        });

        return compraAtualizada;
    }

    // Deletar compra
    static async deleteCompra(id) {
        return await prisma.$transaction(async (tx) => {
            // Primeiro deletar os itens
            await tx.comprasItens.deleteMany({
                where: { compras_id: id }
            });

            // Depois deletar a compra
            await tx.compras.delete({
                where: { id }
            });
        });
    }

    // Adicionar item à compra
    static async addItemToCompra(compraId, itemData) {
        return await prisma.$transaction(async (tx) => {
            let roupa;

            if (itemData.roupas_id) {
                // Buscar por ID
                roupa = await tx.roupas.findUnique({
                    where: { id: itemData.roupas_id }
                });
                if (!roupa) {
                    throw new Error(`Item com ID ${itemData.roupas_id} não encontrado`);
                }
            } else {
                // Buscar por nome
                roupa = await tx.roupas.findFirst({
                    where: { 
                        nome: itemData.nome_item
                    }
                });
                if (!roupa) {
                    throw new Error(`Item "${itemData.nome_item}" não encontrado`);
                }
            }

            // Verificar se item já existe na compra
            const itemExistente = await tx.comprasItens.findFirst({
                where: {
                    compras_id: compraId,
                    roupas_id: roupa.id
                }
            });

            if (itemExistente) {
                // Atualizar quantidade se já existe
                const novoItem = await tx.comprasItens.update({
                    where: { id: itemExistente.id },
                    data: {
                        quatidade: itemExistente.quatidade + itemData.quantidade,
                        valor_peça: itemData.valor_peca // Atualizar preço
                    },
                    include: {
                        Roupa: true
                    }
                });
                return novoItem;
            } else {
                // Criar novo item
                const novoItem = await tx.comprasItens.create({
                    data: {
                        compras_id: compraId,
                        roupas_id: roupa.id,
                        quatidade: itemData.quantidade,
                        valor_peça: itemData.valor_peca
                    },
                    include: {
                        Roupa: true
                    }
                });
                return novoItem;
            }
        });
    }

    // Listar itens da compra
    static async getItensCompra(compraId) {
        return await prisma.comprasItens.findMany({
            where: { compras_id: compraId },
            include: {
                Roupa: true
            },
            orderBy: { id: 'asc' }
        });
    }

    // Atualizar item da compra
    static async updateItemCompra(itemId, updateData) {
        return await prisma.comprasItens.update({
            where: { id: itemId },
            data: updateData,
            include: {
                Roupa: true
            }
        });
    }

    // Remover item da compra
    static async removeItemFromCompra(itemId) {
        return await prisma.comprasItens.delete({
            where: { id: itemId }
        });
    }

    // Finalizar compra (adicionar itens ao estoque)
    static async finalizarCompra(compraId, observacoes = null) {
        return await prisma.$transaction(async (tx) => {
            // Buscar compra e itens
            const compra = await tx.compras.findUnique({
                where: { id: compraId },
                include: {
                    ComprasItens: true
                }
            });

            if (!compra) {
                throw new Error('Compra não encontrada');
            }

            // Adicionar itens ao estoque
            for (const item of compra.ComprasItens) {
                await tx.roupas.update({
                    where: { id: item.roupas_id },
                    data: {
                        quantidade: {
                            increment: item.quatidade
                        }
                    }
                });
            }

            // Marcar compra como finalizada (se houver campo no schema)
            // Por ora, apenas retornamos a compra
            return await tx.compras.findUnique({
                where: { id: compraId },
                include: {
                    ComprasItens: {
                        include: {
                            Roupa: true
                        }
                    }
                }
            });
        });
    }

    // Obter estatísticas de compras
    static async getComprasStats(filters = {}) {
        const where = {};

        if (filters.data_inicio || filters.data_fim) {
            where.data_compra = {};
            if (filters.data_inicio) {
                where.data_compra.gte = new Date(`${filters.data_inicio}T00:00:00.000Z`);
            }
            if (filters.data_fim) {
                where.data_compra.lte = new Date(`${filters.data_fim}T23:59:59.999Z`);
            }
        }

        const stats = await prisma.compras.aggregate({
            where,
            _count: { id: true },
            _sum: { valor_pago: true },
            _avg: { valor_pago: true }
        });

        const totalCompras = stats._count.id || 0;
        const valorTotalGasto = stats._sum.valor_pago || 0;
        const valorMedioCompra = stats._avg.valor_pago || 0;

        // Contar total de itens comprados
        const totalItens = await prisma.comprasItens.aggregate({
            where: {
                Compras: where
            },
            _sum: { quatidade: true }
        });

        return {
            total_compras: totalCompras,
            valor_total_gasto: valorTotalGasto,
            valor_medio_compra: valorMedioCompra,
            total_itens_comprados: totalItens._sum.quatidade || 0
        };
    }
}

export default ComprasRepository;