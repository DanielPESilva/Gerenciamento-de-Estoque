import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import 'dotenv/config';
import { sendEmail } from '../utils/sendEmail.js';
import UsuariosRepository from '../repository/usuariosRepository.js';
import { APIError } from '../utils/wrapException.js';

class AuthServices {
    /**
     * Gera tokens de acesso e refresh
     */
    static generateTokens(userId) {
        const accessToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        const refreshToken = jwt.sign(
            { userId, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    /**
     * Registro de usuário
     */
    static async register(userData) {
        const { nome, email, senha } = userData;

        // Verificar se o usuário já existe
        const existingUser = await UsuariosRepository.getByEmail(email);
        if (existingUser) {
            throw new APIError(['Email já está em uso'], 400);
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Criar usuário
        const newUser = await UsuariosRepository.create({
            nome,
            email,
            senha: hashedPassword
        });

        // Gerar tokens
        const tokens = this.generateTokens(newUser.id);

        return {
            user: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email
            },
            ...tokens
        };
    }

    /**
     * Login de usuário
     */
    static async login(loginData) {
        const { email, senha } = loginData;

        // Buscar usuário
        const user = await UsuariosRepository.getByEmail(email);
        if (!user) {
            throw new APIError(['Credenciais inválidas'], 401);
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(senha, user.senha);
        if (!isValidPassword) {
            throw new APIError(['Credenciais inválidas'], 401);
        }

        // Gerar tokens
        const tokens = this.generateTokens(user.id);

        return {
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email
            },
            ...tokens
        };
    }

    /**
     * Esqueci minha senha - envia código por email
     */
    static async forgotPassword(email) {
        // Verificar se o usuário existe
        const user = await UsuariosRepository.getByEmail(email);
        if (!user) {
            throw new APIError(['Usuário não encontrado com este email'], 404);
        }

        // Gerar código de 6 dígitos
        const resetCode = crypto.randomInt(100000, 999999).toString();
        
        // Salvar código no usuário (você pode criar uma tabela separada se preferir)
        await UsuariosRepository.update(user.id, {
            reset_code: resetCode,
            reset_code_expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
        });

        // Log do código para debug (REMOVER EM PRODUÇÃO)
        console.log(`\n========================================`);
        console.log(`CÓDIGO DE RECUPERAÇÃO DE SENHA`);
        console.log(`Email: ${email}`);
        console.log(`Código: ${resetCode}`);
        console.log(`Expira em: 15 minutos`);
        console.log(`========================================\n`);

        // Enviar email com código
        const subject = 'Código para redefinir sua senha - DressFy';
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Redefinir Senha</h2>
                <p>Você solicitou a redefinição de sua senha.</p>
                <p>Seu código de verificação é:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
                    ${resetCode}
                </div>
                <p>Este código expira em 15 minutos.</p>
                <p>Se você não solicitou esta redefinição, ignore este email.</p>
            </div>
        `;

        try {
            await sendEmail(email, subject, message);
            console.log(`Email enviado com sucesso para: ${email}`);
        } catch (emailError) {
            console.error(`Erro ao enviar email para ${email}:`, emailError.message);
            // Não falhar a requisição se o email não for enviado
            // O código já foi salvo no banco e será exibido no console
        }

        return { message: 'Código de recuperação gerado. Verifique seu email ou o console do servidor.' };
    }

    /**
     * Reset de senha com código
     */
    static async resetPassword(email, code, novaSenha) {
        // Buscar usuário
        const user = await UsuariosRepository.getByEmail(email);
        if (!user) {
            throw new APIError(['Código inválido ou expirado'], 400);
        }

        // Verificar código e expiração
        if (user.reset_code !== code || !user.reset_code_expires || user.reset_code_expires < new Date()) {
            throw new APIError(['Código inválido ou expirado'], 400);
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha e limpar código
        await UsuariosRepository.update(user.id, {
            senha: hashedPassword,
            reset_code: null,
            reset_code_expires: null
        });

        return { message: 'Senha redefinida com sucesso' };
    }

    /**
     * Refresh token
     */
    static async refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            
            if (decoded.type !== 'refresh') {
                throw new Error('Token inválido');
            }

            // Verificar se o usuário ainda existe
            const user = await UsuariosRepository.getById(decoded.userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Gerar novos tokens
            const tokens = this.generateTokens(decoded.userId);

            return tokens;
        } catch (error) {
            throw new APIError(['Refresh token inválido'], 401);
        }
    }
}

export default AuthServices;