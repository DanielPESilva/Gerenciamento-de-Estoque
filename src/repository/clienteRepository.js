// Repository para Cliente
import prisma from '../models/prisma.js';

const ClienteRepository = {
  async findAll() {
    return prisma.cliente.findMany();
  },
  async findById(id) {
    return prisma.cliente.findUnique({ where: { id: Number(id) } });
  },
  async create(data) {
    return prisma.cliente.create({ data });
  },
  async update(id, data) {
    return prisma.cliente.update({ where: { id: Number(id) }, data });
  },
  async delete(id) {
    return prisma.cliente.delete({ where: { id: Number(id) } });
  }
};

export default ClienteRepository;
