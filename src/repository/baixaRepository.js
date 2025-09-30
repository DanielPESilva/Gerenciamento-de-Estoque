import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class BaixaRepository {
    // Listar todas as baixas
    static async getAllBaixas(filters = {}, pagination = { page: 1, limit: 10 }) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const where = {};

        // Aplicar filtros
        if (filters.data_inicio || filters.data_fim) {
            where.data_baixa = {};
            if (filters.data_inicio) {
                where.data_baixa.gte = new Date(`${filters.data_inicio}T00:00:00.000Z`);  
            }
            if (filters.data_fim) {
                where.data_baixa.lte = new Date(`${filters.data_fim}T23:59:59.999Z`);
            }
        }

        if (filters.motivo) {
            where.motivo = filters.motivo;
        }

        if (filters.roupa_id) {
            where.roupa_id = filters.roupa_id;
        }

        const [baixas, total] = await Promise.all([
            prisma.baixa.findMany({
                where,
                skip,
                take: limit,
                orderBy: { data_baixa: 'desc' },
                include: {
                    Roupa: true
                }
            }),
            prisma.baixa.count({ where })
        ]);

        return {
            data: baixas,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Buscar baixa por ID
    static async getBaixaById(id) {
        return await prisma.baixa.findUnique({
            where: { id },
            include: {
                Roupa: true
            }
        });
    }

    // Criar nova baixa
    static async createBaixa(baixaData) {
        return await prisma.$transaction(async (tx) => {
            // Verificar se a roupa existe
            const roupa = await tx.roupas.findUnique({
                where: { id: baixaData.roupa_id }
            });

            if (!roupa) {
                throw new Error('Roupa não encontrada');
            }

            // Verificar estoque
            if (roupa.quantidade < baixaData.quantidade) {
                throw new Error(`Estoque insuficiente. Disponível: ${roupa.quantidade}`);
            }

            // Criar a baixa
            const novaBaixa = await tx.baixa.create({
                data: {
                    roupa_id: baixaData.roupa_id,
                    quantidade: baixaData.quantidade,
                    motivo: baixaData.motivo,
                    observacao: baixaData.observacao || null
                },
                include: {
                    Roupa: true
                }
            });

            // Decrementar estoque
            await tx.roupas.update({
                where: { id: baixaData.roupa_id },
                data: {
                    quantidade: {
                        decrement: baixaData.quantidade
                    }
                }
            });

            return novaBaixa;
        });
    }

    // Atualizar baixa (apenas motivo e observação)
    static async updateBaixa(id, updateData) {
        const dataToUpdate = {};
        
        if (updateData.motivo) {
            dataToUpdate.motivo = updateData.motivo;
        }
        
        if (updateData.observacao !== undefined) {
            dataToUpdate.observacao = updateData.observacao;
        }

        const baixaAtualizada = await prisma.baixa.update({
            where: { id },
            data: dataToUpdate,
            include: {
                Roupa: true
            }
        });

        return baixaAtualizada;
    }

    // Deletar baixa e restaurar estoque
    static async deleteBaixa(id) {
        return await prisma.$transaction(async (tx) => {
            // Buscar a baixa para obter dados
            const baixa = await tx.baixa.findUnique({
                where: { id }
            });

            if (!baixa) {
                throw new Error('Baixa não encontrada');
            }

            // Restaurar estoque
            await tx.roupas.update({
                where: { id: baixa.roupa_id },
                data: {
                    quantidade: {
                        increment: baixa.quantidade
                    }
                }
            });

            // Deletar a baixa
            await tx.baixa.delete({
                where: { id }
            });

            return { message: 'Baixa deletada e estoque restaurado' };
        });
    }

    // Verificar se a roupa existe e tem estoque suficiente
    static async verificarEstoque(roupaId, quantidade) {
        const roupa = await prisma.roupas.findUnique({
            where: { id: roupaId }
        });

        if (!roupa) {
            return {
                exists: false,
                hasStock: false,
                currentStock: 0
            };
        }

        return {
            exists: true,
            hasStock: roupa.quantidade >= quantidade,
            currentStock: roupa.quantidade
        };
    }

    // Obter estatísticas
    static async getEstatisticas(periodo = 'mes') {
        const dataInicio = new Date();

        switch (periodo) {
            case 'hoje':
                dataInicio.setHours(0, 0, 0, 0);
                break;
            case 'semana':
                dataInicio.setDate(dataInicio.getDate() - 7);
                break;
            case 'mes':
                dataInicio.setMonth(dataInicio.getMonth() - 1);
                break;
            case 'ano':
                dataInicio.setFullYear(dataInicio.getFullYear() - 1);
                break;
        }

        const [totalBaixas, groupedByMotivo] = await Promise.all([
            prisma.baixa.count({
                where: {
                    data_baixa: {
                        gte: dataInicio
                    }
                }
            }),
            prisma.baixa.groupBy({
                by: ['motivo'],
                where: {
                    data_baixa: {
                        gte: dataInicio
                    }
                },
                _sum: {
                    quantidade: true
                },
                _count: {
                    id: true
                }
            })
        ]);

        const porMotivo = {};
        let quantidadeTotal = 0;

        groupedByMotivo.forEach(item => {
            quantidadeTotal += item._sum.quantidade || 0;
            porMotivo[item.motivo] = {
                quantidade: item._sum.quantidade || 0,
                total_baixas: item._count.id || 0
            };
        });

        return {
            total_baixas: totalBaixas,
            quantidade_total: quantidadeTotal,
            por_motivo: porMotivo,
            periodo
        };
    }

    // Gerar relatório
    static async getRelatorio(filters) {
        const where = {};

        if (filters.data_inicio) {
            where.data_baixa = { gte: new Date(`${filters.data_inicio}T00:00:00.000Z`) };
        }

        if (filters.data_fim) {
            where.data_baixa = { 
                ...where.data_baixa,
                lte: new Date(`${filters.data_fim}T23:59:59.999Z`) 
            };
        }

        if (filters.motivo) {
            where.motivo = filters.motivo;
        }

        const baixas = await prisma.baixa.findMany({
            where,
            include: {
                Roupa: true
            },
            orderBy: {
                data_baixa: 'desc'
            }
        });

        return { baixas };
    }
}

export default BaixaRepository;