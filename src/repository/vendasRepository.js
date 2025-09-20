import prisma from "../models/prisma.js";

class VendasRepository {
    // Buscar todas as vendas com filtros e paginação
    static async getAllVendas(filters = {}, pagination = { page: 1, limit: 10 }) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        // Construir filtros dinâmicos
        const where = {};

        if (filters.data_inicio && filters.data_fim) {
            where.data_venda = {
                gte: new Date(filters.data_inicio + "T00:00:00.000Z"),
                lte: new Date(filters.data_fim + "T23:59:59.999Z")
            };
        } else if (filters.data_inicio) {
            where.data_venda = {
                gte: new Date(filters.data_inicio + "T00:00:00.000Z")
            };
        } else if (filters.data_fim) {
            where.data_venda = {
                lte: new Date(filters.data_fim + "T23:59:59.999Z")
            };
        }

        if (filters.forma_pgto) {
            // Decodificar URL encoding se necessário
            const formaPgto = decodeURIComponent(filters.forma_pgto);
            where.forma_pgto = {
                contains: formaPgto
            };
        }

        if (filters.valor_min && filters.valor_max) {
            where.valor_total = {
                gte: filters.valor_min,
                lte: filters.valor_max
            };
        } else if (filters.valor_min) {
            where.valor_total = {
                gte: filters.valor_min
            };
        } else if (filters.valor_max) {
            where.valor_total = {
                lte: filters.valor_max
            };
        }

        // Buscar vendas com itens relacionados
        const vendas = await prisma.vendas.findMany({
            where,
            include: {
                VendasItens: {
                    include: {
                        Roupa: {
                            select: {
                                id: true,
                                nome: true,
                                tipo: true,
                                tamanho: true,
                                cor: true,
                                preco: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                data_venda: 'desc'
            },
            skip,
            take: limit
        });

        // Contar total de registros
        const total = await prisma.vendas.count({ where });

        return {
            data: vendas,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        };
    }

    // Buscar venda por ID
    static async getVendaById(id) {
        return await prisma.vendas.findUnique({
            where: { id },
            include: {
                VendasItens: {
                    include: {
                        Roupa: {
                            select: {
                                id: true,
                                nome: true,
                                tipo: true,
                                tamanho: true,
                                cor: true,
                                preco: true
                            }
                        }
                    }
                }
            }
        });
    }

    // Buscar estatísticas de vendas
    static async getVendasStats(filters = {}) {
        const where = {};

        if (filters.data_inicio && filters.data_fim) {
            where.data_venda = {
                gte: new Date(filters.data_inicio + "T00:00:00.000Z"),
                lte: new Date(filters.data_fim + "T23:59:59.999Z")
            };
        }

        const stats = await prisma.vendas.aggregate({
            where,
            _count: {
                id: true
            },
            _sum: {
                valor_total: true,
                valor_pago: true,
                desconto: true
            },
            _avg: {
                valor_total: true
            }
        });

        return {
            total_vendas: stats._count.id || 0,
            valor_total_vendido: stats._sum.valor_total || 0,
            valor_total_recebido: stats._sum.valor_pago || 0,
            total_descontos: stats._sum.desconto || 0,
            ticket_medio: stats._avg.valor_total || 0
        };
    }
}

export default VendasRepository;
