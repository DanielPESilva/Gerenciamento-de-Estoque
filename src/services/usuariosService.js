// Service para Usuários
import UsuariosRepository from '../repository/usuariosRepository.js';

const UsuariosService = {
  async getAllUsuarios(filters = {}, pagination = {}) {
    return UsuariosRepository.findAll(filters, pagination);
  },
  async getUsuarioById(id) {
    return UsuariosRepository.findById(id);
  },
  async createUsuario(data) {
    return UsuariosRepository.create(data);
  },
  async updateUsuario(id, data) {
    return UsuariosRepository.update(id, data);
  },
  async deleteUsuario(id) {
    return UsuariosRepository.delete(id);
  },
  async getUsuarioByEmail(email) {
    return UsuariosRepository.findByEmail(email);
  }
};

export default UsuariosService;
