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

export const create = async (req, res) => {
    // Validação dos dados de entrada
    const bodyValidation = UsuariosSchema.create.safeParse(req.body);
    
    if (!bodyValidation.success) {
        throw new APIError(
            bodyValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    // Verificar se email já existe
    const existingUser = await UsuariosService.getUsuarioByEmail(bodyValidation.data.email);
    if (existingUser) {
        throw new APIError(
            [{ path: "email", message: "Email já está em uso por outro usuário" }],
            400
        );
    }

    const usuario = await UsuariosService.createUsuario(bodyValidation.data);

    return res.status(201).json({
        success: true,
        data: usuario
    });
};

export const patch = async (req, res) => {
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

    // Validação dos dados de entrada (campos opcionais para PATCH)
    const bodyValidation = UsuariosSchema.update.safeParse(req.body);
    
    if (!bodyValidation.success) {
        throw new APIError(
            bodyValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    const { id } = paramValidation.data;

    // Verificar se o usuário existe
    const existingUser = await UsuariosService.getUsuarioById(id);
    if (!existingUser) {
        throw new APIError(
            [{ path: "ID", message: "Usuário não encontrado com o ID informado" }],
            404
        );
    }

    // Se está alterando email, verificar se não está em uso por outro usuário
    if (bodyValidation.data.email && bodyValidation.data.email !== existingUser.email) {
        const emailInUse = await UsuariosService.getUsuarioByEmail(bodyValidation.data.email);
        if (emailInUse) {
            throw new APIError(
                [{ path: "email", message: "Email já está em uso por outro usuário" }],
                400
            );
        }
    }

    // Filtrar apenas os campos que foram enviados (remover undefined)
    const updateData = Object.keys(bodyValidation.data).reduce((acc, key) => {
        if (bodyValidation.data[key] !== undefined) {
            acc[key] = bodyValidation.data[key];
        }
        return acc;
    }, {});

    // Verificar se há dados para atualizar
    if (Object.keys(updateData).length === 0) {
        throw new APIError(
            [{ path: "body", message: "Nenhum dado válido foi fornecido para atualização" }],
            400
        );
    }

    const usuario = await UsuariosService.updateUsuario(id, updateData);

    return res.status(200).json({
        success: true,
        data: usuario,
        message: "Usuário atualizado com sucesso"
    });
};

export const deleteUser = async (req, res) => {
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

    // Verificar se o usuário existe
    const existingUser = await UsuariosService.getUsuarioById(id);
    if (!existingUser) {
        throw new APIError(
            [{ path: "ID", message: "Usuário não encontrado com o ID informado" }],
            404
        );
    }

    // Deletar o usuário
    await UsuariosService.deleteUsuario(id);

    return res.status(204).send();
};
