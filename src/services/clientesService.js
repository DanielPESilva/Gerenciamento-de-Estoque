// Service para Clientes
import ClientesRepository from '../repository/clientesRepository.js';

const ClientesService = {
  async getAllClientes(filters = {}, pagination = {}) {
    return ClientesRepository.findAll(filters, pagination);
  },
  async getClienteById(id) {
    return ClientesRepository.findById(id);
  },
  async createCliente(data) {
    return ClientesRepository.create(data);
  },
  async updateCliente(id, data) {
    return ClientesRepository.update(id, data);
  },
  async deleteCliente(id) {
    return ClientesRepository.delete(id);
  },
  async getClienteByEmail(email) {
    return ClientesRepository.findByEmail(email);
  },
  async getClienteByCpf(cpf) {
    return ClientesRepository.findByCpf(cpf);
  }
};

export default ClientesService;
