import request from "supertest";
import { describe, expect, it } from '@jest/globals';
import app from '../../app.js'

describe('Teste de Autenticação', () => {

    it("1-Deve chamar a rota de autenticação e pegar o token", async () => {
        const res = await request(app)
            .post('/auth/login')
            .set("Accept", "application/json")
            .send({
                email: "admin@teste.com",
                senha: "123456"
            })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty('token')
        expect(res.body.data).toHaveProperty('refreshToken')
    })

    it("2-Deve retornar um erro quando o usuario não existir", async () => {
        const req = await request(app)
            .post('/auth/login')
            .set("Accept", "application/json")
            .send({
                email: "usuario_inexistente@teste.com",
                senha: "123456"
            })
        expect(req.status).toBe(401)
        expect(req.body.success).toBe(false)
        expect(req.body.message).toContain("Credenciais inválidas")
    })

    it("3-Deve deve retornar um erro quando a senha estiver errada", async () => {
        const req = await request(app)
            .post('/auth/login')
            .set("Accept", "application/json")
            .send({
                email: "admin@teste.com",
                senha: "senha_errada"
            })
        expect(req.status).toBe(401)
        expect(req.body.success).toBe(false)
        expect(req.body.message).toContain("Credenciais inválidas")
    })

    it("4-Deve registrar um novo usuário", async () => {
        const novoUsuario = {
            nome: "Usuário Teste",
            email: `teste_${Date.now()}@teste.com`,
            senha: "123456"
        }

        const res = await request(app)
            .post('/auth/register')
            .set("Accept", "application/json")
            .send(novoUsuario)

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty('token')
        expect(res.body.data.usuario.email).toBe(novoUsuario.email)
    })

    it("5-Deve retornar erro ao tentar registrar com email já existente", async () => {
        const usuarioExistente = {
            nome: "Usuário Teste",
            email: "admin@teste.com",
            senha: "123456"
        }

        const res = await request(app)
            .post('/auth/register')
            .set("Accept", "application/json")
            .send(usuarioExistente)

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
        expect(res.body.message).toContain("já existe")
    })

    it("6-Deve validar campos obrigatórios no login", async () => {
        const res = await request(app)
            .post('/auth/login')
            .set("Accept", "application/json")
            .send({
                email: "",
                senha: ""
            })

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })

    it("7-Deve validar formato de email", async () => {
        const res = await request(app)
            .post('/auth/register')
            .set("Accept", "application/json")
            .send({
                nome: "Teste",
                email: "email_invalido",
                senha: "123456"
            })

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })
});