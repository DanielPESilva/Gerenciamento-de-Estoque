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

    // Criar nova venda com itens e atualizar estoque
    static async createVenda(vendaData) {
        return await prisma.$transaction(async (tx) => {
            const { itens, ...dadosVenda } = vendaData;

            // 1. Verificar se todos os itens existem e têm estoque suficiente
            for (const item of itens) {
                const roupa = await this.resolverItem(item, tx);

                if (roupa.quantidade < item.quantidade) {
                    throw new Error(`Estoque insuficiente para ${roupa.nome}. Disponível: ${roupa.quantidade}, Solicitado: ${item.quantidade}`);
                }

                // Adicionar o ID resolvido ao item para uso posterior
                item.roupas_id_resolvido = roupa.id;
            }

            // 2. Criar a venda
            const novaVenda = await tx.vendas.create({
                data: {
                    forma_pgto: dadosVenda.forma_pgto,
                    valor_total: dadosVenda.valor_total,
                    desconto: dadosVenda.desconto,
                    valor_pago: dadosVenda.valor_pago,
                    descricao_permuta: dadosVenda.descricao_permuta,
                    nome_cliente: dadosVenda.nome_cliente,
                    telefone_cliente: dadosVenda.telefone_cliente
                }
            });

            // 3. Criar os itens da venda e atualizar estoque
            for (const item of itens) {
                const roupasId = item.roupas_id_resolvido || item.roupas_id;

                // Criar item da venda
                await tx.vendasItens.create({
                    data: {
                        roupas_id: roupasId,
                        vendas_id: novaVenda.id,
                        quatidade: item.quantidade
                    }
                });

                // Diminuir quantidade do estoque
                await tx.roupas.update({
                    where: { id: roupasId },
                    data: {
                        quantidade: {
                            decrement: item.quantidade
                        }
                    }
                });
            }

            // 4. Retornar a venda criada com os itens
            return await tx.vendas.findUnique({
                where: { id: novaVenda.id },
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
                                    preco: true,
                                    quantidade: true // Quantidade atualizada
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    // Atualizar venda existente
    static async updateVenda(id, updateData) {
        return await prisma.vendas.update({
            where: { id },
            data: updateData,
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

    // Deletar venda (reverter estoque)
    static async deleteVenda(id) {
        return await prisma.$transaction(async (tx) => {
            // 1. Buscar a venda com itens
            const venda = await tx.vendas.findUnique({
                where: { id },
                include: {
                    VendasItens: true
                }
            });

            if (!venda) {
                throw new Error(`Venda com ID ${id} não encontrada`);
            }

            // 2. Reverter o estoque dos itens
            for (const item of venda.VendasItens) {
                await tx.roupas.update({
                    where: { id: item.roupas_id },
                    data: {
                        quantidade: {
                            increment: item.quatidade
                        }
                    }
                });
            }

            // 3. Deletar itens da venda
            await tx.vendasItens.deleteMany({
                where: { vendas_id: id }
            });

            // 4. Deletar a venda
            return await tx.vendas.delete({
                where: { id }
            });
        });
    }

    // Função auxiliar para resolver item por ID ou nome
    static async resolverItem(itemData, tx = prisma) {
        const { roupas_id, nome_item } = itemData;

        let roupa;

        if (roupas_id) {
            // Buscar por ID (mais rápido)
            roupa = await tx.roupas.findUnique({
                where: { id: roupas_id },
                select: { id: true, nome: true, quantidade: true }
            });
        } else if (nome_item) {
            // Buscar por nome (busca exata primeiro, depois com contains se não encontrar)
            roupa = await tx.roupas.findFirst({
                where: {
                    nome: nome_item.trim()
                },
                select: { id: true, nome: true, quantidade: true }
            });

            // Se não encontrou com nome exato, tenta busca parcial
            if (!roupa) {
                roupa = await tx.roupas.findFirst({
                    where: {
                        nome: {
                            contains: nome_item.trim()
                        }
                    },
                    select: { id: true, nome: true, quantidade: true }
                });
            }
        }

        if (!roupa) {
            const identificador = roupas_id ? `ID ${roupas_id}` : `nome "${nome_item}"`;
            throw new Error(`Item não encontrado com ${identificador}`);
        }

        return roupa;
    }

    // Criar venda sem ajustar estoque (usado para conversão de condicionais)
    static async createVendaFromCondicional(vendaData) {
        return await prisma.$transaction(async (tx) => {
            const { itens, ...dadosVenda } = vendaData;

            const novaVenda = await tx.vendas.create({
                data: {
                    forma_pgto: dadosVenda.forma_pgto,
                    valor_total: dadosVenda.valor_total,
                    desconto: dadosVenda.desconto,
                    valor_pago: dadosVenda.valor_pago,
                    descricao_permuta: dadosVenda.descricao_permuta || null,
                    nome_cliente: dadosVenda.nome_cliente || null,
                    telefone_cliente: dadosVenda.telefone_cliente || null
                }
            });

            const itensCriados = [];

            for (const item of itens) {
                const roupa = await tx.roupas.findUnique({
                    where: { id: item.roupas_id },
                    select: {
                        id: true,
                        nome: true,
                        tipo: true,
                        tamanho: true,
                        cor: true,
                        preco: true,
                        quantidade: true
                    }
                });

                if (!roupa) {
                    throw new Error(`Item não encontrado com ID ${item.roupas_id}`);
                }

                const vendaItem = await tx.vendasItens.create({
                    data: {
                        roupas_id: roupa.id,
                        vendas_id: novaVenda.id,
                        quatidade: item.quantidade
                    }
                });

                itensCriados.push({
                    ...vendaItem,
                    Roupa: roupa
                });
            }

            return {
                ...novaVenda,
                VendasItens: itensCriados
            };
        });
    }
}

export default VendasRepository;
