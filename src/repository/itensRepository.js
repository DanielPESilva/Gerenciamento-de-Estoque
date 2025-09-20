import prisma from '../models/prisma.js';

class ItensRepository {
    static async findAll(filters = {}, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const where = {};
        
        if (filters.tipo) {
            where.tipo = {
                contains: filters.tipo
            };
        }
        
        if (filters.cor) {
            where.cor = {
                contains: filters.cor
            };
        }
        
        if (filters.tamanho) {
            where.tamanho = filters.tamanho;
        }

        const [itens, total] = await Promise.all([
            prisma.roupas.findMany({
                where,
                skip,
                take: limit,
                include: {
                    Usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    criado_em: 'desc'
                }
            }),
            prisma.roupas.count({ where })
        ]);

        return {
            data: itens,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    static async findById(id) {
        return await prisma.roupas.findUnique({
            where: { id: Number(id) },
            include: {
                Usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                ComprasItens: {
                    include: {
                        Compras: {
                            select: {
                                id: true,
                                data_compra: true,
                                fornecendor: true
                            }
                        }
                    }
                },
                VendasItens: {
                    include: {
                        Venda: {
                            select: {
                                id: true,
                                data_venda: true,
                                forma_pgto: true,
                                valor_total: true
                            }
                        }
                    }
                },
                HistoricoStatus: {
                    orderBy: {
                        alterado_em: 'desc'
                    },
                    take: 10
                }
            }
        });
    }

    static async create(data) {
        return await prisma.roupas.create({
            data,
            include: {
                Usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });
    }

    static async update(id, data) {
        return await prisma.roupas.update({
            where: { id: Number(id) },
            data,
            include: {
                Usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });
    }

    static async delete(id) {
        return await prisma.roupas.delete({
            where: { id: Number(id) }
        });
    }

    static async findByUsuario(usuarioId) {
        return await prisma.roupas.findMany({
            where: { usuarios_id: Number(usuarioId) },
            include: {
                Usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
    }

    static async updateQuantidade(id, quantidade) {
        return await prisma.roupas.update({
            where: { id: Number(id) },
            data: { quantidade: Number(quantidade) }
        });
    }

    // Buscar itens por nome (para autocomplete)
    static async searchByName(searchTerm, limit = 10) {
        return await prisma.roupas.findMany({
            where: {
                nome: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                nome: true,
                tipo: true,
                cor: true,
                tamanho: true,
                preco: true,
                quantidade: true
            },
            take: limit,
            orderBy: {
                nome: 'asc'
            }
        });
    }
}

export default ItensRepository;
