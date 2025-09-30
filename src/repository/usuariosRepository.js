import prisma from '../models/prisma.js';

class UsuariosRepository {
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

        const [usuarios, total] = await Promise.all([
            prisma.usuarios.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    criado_em: true,
                    // Não retorna senha por segurança
                },
                orderBy: {
                    criado_em: 'desc'
                }
            }),
            prisma.usuarios.count({ where })
        ]);

        return {
            data: usuarios,
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
        return await prisma.usuarios.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nome: true,
                email: true,
                criado_em: true
                // Não retorna senha por segurança
            }
        });
    }

    static async create(data) {
        return await prisma.usuarios.create({
            data,
            select: {
                id: true,
                nome: true,
                email: true,
                criado_em: true
                // Não retorna senha por segurança
            }
        });
    }

    static async update(id, data) {
        return await prisma.usuarios.update({
            where: { id: Number(id) },
            data,
            select: {
                id: true,
                nome: true,
                email: true,
                criado_em: true
                // Não retorna senha por segurança
            }
        });
    }

    static async delete(id) {
        return await prisma.usuarios.delete({
            where: { id: Number(id) }
        });
    }

    static async findByEmail(email) {
        return await prisma.usuarios.findUnique({
            where: { email },
            select: {
                id: true,
                nome: true,
                email: true,
                criado_em: true
            }
        });
    }

    // Métodos para autenticação (incluem senha)
    static async getByEmail(email) {
        return await prisma.usuarios.findUnique({
            where: { email }
        });
    }

    static async getById(id) {
        return await prisma.usuarios.findUnique({
            where: { id: Number(id) }
        });
    }
}

export default UsuariosRepository;
