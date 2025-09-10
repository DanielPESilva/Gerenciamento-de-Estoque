// Service para Cliente
import ClienteRepository from '../repository/clienteRepository.js';

const ClienteService = {
  async getAllClientes() {
    return ClienteRepository.findAll();
  },
  async getClienteById(id) {
    return ClienteRepository.findById(id);
  },
  async createCliente(data) {
    return ClienteRepository.create(data);
  },
  async updateCliente(id, data) {
    return ClienteRepository.update(id, data);
  },
  async deleteCliente(id) {
    return ClienteRepository.delete(id);
  }
};

export default ClienteService;
