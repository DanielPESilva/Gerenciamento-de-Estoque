import prisma from '../models/prisma.js';

class CondicionaisRepository {
    // Listar condicionais com filtros e paginação
    static async getAllCondicionais(filters = {}, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const where = {};

        // Filtros
        if (filters.cliente_id) {
            where.cliente_id = filters.cliente_id;
        }

        if (filters.devolvido !== undefined) {
            where.devolvido = filters.devolvido;
        }

        if (filters.data_inicio && filters.data_fim) {
            where.data = {
                gte: new Date(filters.data_inicio + "T00:00:00.000Z"),
                lte: new Date(filters.data_fim + "T23:59:59.999Z")
            };
        }

        // Buscar condicionais com itens relacionados
        const condicionais = await prisma.condicionais.findMany({
            where,
            include: {
                Cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true,
                        endereco: true
                    }
                },
                CondicionaisItens: {
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
                data: 'desc'
            },
            skip,
            take: limit
        });

        // Contar total de registros
        const total = await prisma.condicionais.count({ where });

        return {
            data: condicionais,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        };
    }

    // Buscar condicional por ID
    static async getCondicionalById(id) {
        return await prisma.condicionais.findUnique({
            where: { id },
            include: {
                Cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true,
                        endereco: true
                    }
                },
                CondicionaisItens: {
                    include: {
                        Roupa: {
                            select: {
                                id: true,
                                nome: true,
                                tipo: true,
                                tamanho: true,
                                cor: true,
                                preco: true,
                                quantidade: true
                            }
                        }
                    }
                }
            }
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

    // Criar novo condicional com itens
    static async createCondicional(condicionalData) {
        return await prisma.$transaction(async (tx) => {
            const { itens, ...dadosCondicional } = condicionalData;

            // 1. Verificar se o cliente existe
            const cliente = await tx.cliente.findUnique({
                where: { id: dadosCondicional.cliente_id }
            });

            if (!cliente) {
                throw new Error(`Cliente com ID ${dadosCondicional.cliente_id} não encontrado`);
            }

            // 2. Verificar se todos os itens existem e têm estoque suficiente
            for (const item of itens) {
                const roupa = await CondicionaisRepository.resolverItem(item, tx);

                if (roupa.quantidade < item.quantidade) {
                    throw new Error(`Estoque insuficiente para ${roupa.nome}. Disponível: ${roupa.quantidade}, Solicitado: ${item.quantidade}`);
                }

                // Adicionar o ID resolvido ao item para uso posterior
                item.roupas_id_resolvido = roupa.id;
            }

            // 3. Criar o condicional
            const novoCondicional = await tx.condicionais.create({
                data: {
                    cliente_id: dadosCondicional.cliente_id,
                    data_devolucao: new Date(dadosCondicional.data_devolucao)
                }
            });

            // 4. Criar os itens do condicional e atualizar estoque
            for (const item of itens) {
                const roupasId = item.roupas_id_resolvido || item.roupas_id;

                // Criar item do condicional
                await tx.condicionaisItens.create({
                    data: {
                        roupas_id: roupasId,
                        condicionais_id: novoCondicional.id,
                        quatidade: item.quantidade
                    }
                });

                // Diminuir quantidade do estoque (item sai para condicional)
                await tx.roupas.update({
                    where: { id: roupasId },
                    data: {
                        quantidade: {
                            decrement: item.quantidade
                        }
                    }
                });
            }

            // 5. Retornar o condicional criado com os itens
            return await tx.condicionais.findUnique({
                where: { id: novoCondicional.id },
                include: {
                    Cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            endereco: true
                        }
                    },
                    CondicionaisItens: {
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

    // Atualizar condicional existente
    static async updateCondicional(id, updateData) {
        return await prisma.condicionais.update({
            where: { id },
            data: {
                ...updateData,
                data_devolucao: updateData.data_devolucao ? new Date(updateData.data_devolucao) : undefined
            },
            include: {
                Cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true,
                        endereco: true
                    }
                },
                CondicionaisItens: {
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

    // Devolver item específico do condicional
    static async devolverItem(condicionalId, roupasId, quantidadeDevolver) {
        return await prisma.$transaction(async (tx) => {
            // Buscar o item no condicional
            const itemCondicional = await tx.condicionaisItens.findFirst({
                where: {
                    condicionais_id: condicionalId,
                    roupas_id: roupasId
                }
            });

            if (!itemCondicional) {
                throw new Error(`Item não encontrado no condicional`);
            }

            if (itemCondicional.quatidade < quantidadeDevolver) {
                throw new Error(`Quantidade a devolver (${quantidadeDevolver}) é maior que a quantidade no condicional (${itemCondicional.quatidade})`);
            }

            // Atualizar quantidade no item do condicional
            if (itemCondicional.quatidade === quantidadeDevolver) {
                // Se devolvendo tudo, remove o item
                await tx.condicionaisItens.delete({
                    where: { id: itemCondicional.id }
                });
            } else {
                // Se devolvendo parcialmente, atualiza quantidade
                await tx.condicionaisItens.update({
                    where: { id: itemCondicional.id },
                    data: {
                        quatidade: itemCondicional.quatidade - quantidadeDevolver
                    }
                });
            }

            // Retornar quantidade ao estoque
            await tx.roupas.update({
                where: { id: roupasId },
                data: {
                    quantidade: {
                        increment: quantidadeDevolver
                    }
                }
            });

            // Verificar se ainda há itens no condicional
            const itensRestantes = await tx.condicionaisItens.count({
                where: { condicionais_id: condicionalId }
            });

            // Se não há mais itens, marcar como devolvido
            if (itensRestantes === 0) {
                await tx.condicionais.update({
                    where: { id: condicionalId },
                    data: { devolvido: true }
                });
            }

            return { quantidadeDevolvida: quantidadeDevolver, itensRestantes };
        });
    }

    // Finalizar condicional (marcar como devolvido e retornar todos os itens)
    static async finalizarCondicional(id) {
        return await prisma.$transaction(async (tx) => {
            // Buscar todos os itens do condicional
            const itensCondicional = await tx.condicionaisItens.findMany({
                where: { condicionais_id: id },
                include: {
                    Roupa: true
                }
            });

            if (itensCondicional.length === 0) {
                throw new Error("Condicional não possui itens ou já foi finalizado");
            }

            // Retornar cada item ao estoque
            for (const item of itensCondicional) {
                await tx.roupas.update({
                    where: { id: item.roupas_id },
                    data: {
                        quantidade: {
                            increment: item.quatidade
                        }
                    }
                });

                // Remover item do condicional
                await tx.condicionaisItens.delete({
                    where: { id: item.id }
                });
            }

            // Marcar condicional como devolvido
            return await tx.condicionais.update({
                where: { id },
                data: { devolvido: true },
                include: {
                    Cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            endereco: true
                        }
                    }
                }
            });
        });
    }

    // Deletar condicional (reverter estoque)
    static async deleteCondicional(id) {
        return await prisma.$transaction(async (tx) => {
            // Buscar todos os itens do condicional
            const itensCondicional = await tx.condicionaisItens.findMany({
                where: { condicionais_id: id }
            });

            // Retornar cada item ao estoque
            for (const item of itensCondicional) {
                await tx.roupas.update({
                    where: { id: item.roupas_id },
                    data: {
                        quantidade: {
                            increment: item.quatidade
                        }
                    }
                });

                // Remover item do condicional
                await tx.condicionaisItens.delete({
                    where: { id: item.id }
                });
            }

            // Deletar o condicional
            return await tx.condicionais.delete({
                where: { id }
            });
        });
    }

    // Buscar estatísticas de condicionais
    static async getCondicionaisStats(filters = {}) {
        const where = {};

        if (filters.data_inicio && filters.data_fim) {
            where.data = {
                gte: new Date(filters.data_inicio + "T00:00:00.000Z"),
                lte: new Date(filters.data_fim + "T23:59:59.999Z")
            };
        }

        const stats = await prisma.condicionais.aggregate({
            where,
            _count: {
                id: true
            }
        });

        const ativo = await prisma.condicionais.count({
            where: { ...where, devolvido: false }
        });

        const devolvido = await prisma.condicionais.count({
            where: { ...where, devolvido: true }
        });

        return {
            total_condicionais: stats._count.id || 0,
            condicionais_ativos: ativo,
            condicionais_devolvidos: devolvido
        };
    }
}

export default CondicionaisRepository;