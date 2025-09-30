import AuthServices from "../services/authService.js";
import AuthSchema from '../validators/authValidators.js';
import { sendResponse, sendError } from "../utils/messages.js";
import { ZodError } from 'zod';
import { APIError } from "../utils/wrapException.js";

class AuthController {
    static async register(req, res) {
        try {
            const parsedUser = AuthSchema.register.parse(req.body);
            const response = await AuthServices.register(parsedUser);
            sendResponse(res, 201, { 
                data: response, 
                message: "Usuário registrado com sucesso!" 
            });
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));
                return sendError(res, 400, errors);
            } else if (err instanceof APIError) {
                return sendError(res, err.statusCode, err.errors);
            }
            return sendError(res, 500, "Erro interno do servidor");
        }
    }

    static async login(req, res) {
        try {
            const parsedData = AuthSchema.login.parse(req.body);
            const response = await AuthServices.login(parsedData);
            sendResponse(res, 200, { data: response });
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));
                return sendError(res, 400, errors);
            } else if (err instanceof APIError) {
                return sendError(res, err.statusCode, err.errors);
            }
            return sendError(res, 500, "Erro interno do servidor");
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = AuthSchema.forgotPassword.parse(req.body);
            const response = await AuthServices.forgotPassword(email);
            sendResponse(res, 200, response);
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));
                return sendError(res, 400, errors);
            } else if (err instanceof APIError) {
                return sendError(res, err.statusCode, err.errors);
            }
            return sendError(res, 500, "Erro interno do servidor");
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email, code, senha } = AuthSchema.resetPassword.parse(req.body);
            const response = await AuthServices.resetPassword(email, code, senha);
            sendResponse(res, 200, response);
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));
                return sendError(res, 400, errors);
            } else if (err instanceof APIError) {
                return sendError(res, err.statusCode, err.errors);
            }
            return sendError(res, 500, "Erro interno do servidor");
        }
    }

    static async refresh(req, res) {
        try {
            const { refreshToken } = AuthSchema.refreshToken.parse(req.body);
            const response = await AuthServices.refreshAccessToken(refreshToken);
            sendResponse(res, 200, { data: response });
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));
                return sendError(res, 400, errors);
            } else if (err instanceof APIError) {
                return sendError(res, err.statusCode, err.errors);
            }
            return sendError(res, 500, "Erro interno do servidor");
        }
    }
}

export default AuthController;