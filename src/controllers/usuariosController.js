import UsuariosService from "../services/usuariosService.js";
import UsuariosSchema from "../schemas/usuariosSchema.js";
import { APIError } from "../utils/wrapException.js";

export const getAll = async (req, res) => {
    // Validação dos query parameters
    const queryValidation = UsuariosSchema.query.safeParse(req.query);
    
    if (!queryValidation.success) {
        throw new APIError(
            queryValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    const { page = 1, limit = 10, nome, email } = queryValidation.data;
    
    const filters = {};
    if (nome) filters.nome = nome;
    if (email) filters.email = email;

    const pagination = { page, limit };

    const result = await UsuariosService.getAllUsuarios(filters, pagination);
    
    return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
    });
};

export const getById = async (req, res) => {
    // Validação do ID
    const paramValidation = UsuariosSchema.id.safeParse(req.params);
    
    if (!paramValidation.success) {
        throw new APIError(
            paramValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    const { id } = paramValidation.data;

    const usuario = await UsuariosService.getUsuarioById(id);

    if (!usuario) {
        throw new APIError(
            [{ path: "ID", message: "Usuário não encontrado com o ID informado" }],
            404
        );
    }

    return res.status(200).json({
        success: true,
        data: usuario
    });
};
