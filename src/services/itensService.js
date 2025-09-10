// Service para Itens
import ItensRepository from '../repository/itensRepository.js';

const ItensService = {
  async getAllItens(filters = {}, pagination = {}) {
    return ItensRepository.findAll(filters, pagination);
  },
  async getItemById(id) {
    return ItensRepository.findById(id);
  },
  async createItem(data) {
    return ItensRepository.create(data);
  },
  async updateItem(id, data) {
    return ItensRepository.update(id, data);
  },
  async deleteItem(id) {
    return ItensRepository.delete(id);
  },
  async getItensByUsuario(usuarioId) {
    return ItensRepository.findByUsuario(usuarioId);
  },
  async updateQuantidade(id, quantidade) {
    return ItensRepository.updateQuantidade(id, quantidade);
  }
};

export default ItensService;
