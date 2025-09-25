import prisma from '../models/prisma.js';

class ClientesRepository {
    static async findAll(filters = {}, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const where = {};
        
        if (filters.nome) {
            where.nome = {
                contains: filters.nome
            };
        }

        if (filters.email) {
            where.email = {
                contains: filters.email
            };
        }

        if (filters.cpf) {
            where.cpf = {
                contains: filters.cpf
            };
        }

        if (filters.telefone) {
            where.telefone = {
                contains: filters.telefone
            };
        }

        const [clientes, total] = await Promise.all([
            prisma.cliente.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    telefone: true,
                    endereco: true,
                    criado_em: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            }),
            prisma.cliente.count({ where })
        ]);

        return {
            data: clientes,
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
        return prisma.cliente.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                endereco: true,
                criado_em: true,
                Condicionais: {
                    select: {
                        id: true,
                        data_condicional: true,
                        descricao: true,
                        valor: true
                    }
                }
            }
        });
    }

    static async create(data) {
        return prisma.cliente.create({
            data,
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                endereco: true,
                criado_em: true
            }
        });
    }

    static async update(id, data) {
        return prisma.cliente.update({
            where: { id },
            data,
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                endereco: true,
                criado_em: true
            }
        });
    }

    static async delete(id) {
        return prisma.cliente.delete({
            where: { id }
        });
    }

    static async findByEmail(email) {
        return prisma.cliente.findUnique({
            where: { email },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                endereco: true,
                criado_em: true
            }
        });
    }

    static async findByCpf(cpf) {
        return prisma.cliente.findFirst({
            where: { cpf },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                telefone: true,
                endereco: true,
                criado_em: true
            }
        });
    }
}

export default ClientesRepository;
