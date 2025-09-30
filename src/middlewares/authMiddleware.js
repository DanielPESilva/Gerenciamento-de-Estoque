import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { sendError } from '../utils/messages.js';

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'Token não fornecido ou malformado');
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return sendError(res, 401, 'Token inválido ou expirado');
    }
}

export default verifyToken;