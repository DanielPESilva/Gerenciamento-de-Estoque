import request from "supertest";
import { describe, expect, it, beforeAll } from '@jest/globals';
import app from '../../app.js'

let token = null

describe('Autenticação', () => {
    it("1-Deve chamar a rota de autenticação e pegar o token", async () => {
        const req = await request(app)
            .post('/auth/login')
            .set("Accept", "application/json")
            .send({
                email: "admin@teste.com",
                senha: "123456"
            })
        token = req.body.data.token
        expect(req.status).toBe(200)
    })
});

describe('GET /usuarios - Listar todos os usuários', () => {
    it('1- Deve retornar todos os usuários', async () => {
        const res = await request(app)
            .get('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2- Deve retornar usuários com filtro por nome', async () => {
        const res = await request(app)
            .get('/usuarios')
            .query({ nome: 'admin' })
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('3- Deve retornar erro 401 quando não autenticado', async () => {
        const res = await request(app)
            .get('/usuarios')
            .set("Accept", "application/json");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('4- Deve retornar erro 403 para usuário sem permissão', async () => {
        // Primeiro, criar um usuário comum
        const usuarioComum = {
            nome: "Usuário Comum",
            email: `comum_${Date.now()}@teste.com`,
            senha: "123456",
            tipo: "funcionario"
        }

        const registerRes = await request(app)
            .post('/auth/register')
            .set("Accept", "application/json")
            .send(usuarioComum);

        const tokenComum = registerRes.body.data.token;

        // Tentar acessar lista de usuários com usuário comum
        const res = await request(app)
            .get('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${tokenComum}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });
});

describe('POST /usuarios - Criar novo usuário', () => {
    it('1- Deve criar um novo usuário', async () => {
        const novoUsuario = {
            nome: `Usuário Teste ${Date.now()}`,
            email: `usuario_${Date.now()}@teste.com`,
            senha: "senha123",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoUsuario);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(novoUsuario.nome);
        expect(res.body.data.email).toBe(novoUsuario.email);
        expect(res.body.data.tipo).toBe(novoUsuario.tipo);
        expect(res.body.data).not.toHaveProperty('senha'); // Senha não deve ser retornada
    });

    it('2- Deve retornar erro para email duplicado', async () => {
        const emailDuplicado = "email_duplicado@teste.com";
        
        const usuario1 = {
            nome: "Usuário 1",
            email: emailDuplicado,
            senha: "123456",
            tipo: "funcionario"
        }

        // Criar primeiro usuário
        await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(usuario1);

        // Tentar criar segundo usuário com mesmo email
        const usuario2 = {
            nome: "Usuário 2",
            email: emailDuplicado,
            senha: "654321",
            tipo: "admin"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(usuario2);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("já existe");
    });

    it('3- Deve validar campos obrigatórios', async () => {
        const usuarioInvalido = {
            nome: "",
            email: "email_invalido",
            senha: "123",
            tipo: "tipo_invalido"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(usuarioInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('4- Deve validar formato do email', async () => {
        const emailInvalido = {
            nome: "Usuário Teste",
            email: "email_sem_arroba",
            senha: "123456",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('5- Deve validar tamanho mínimo da senha', async () => {
        const senhaFraca = {
            nome: "Usuário Teste",
            email: `senha_fraca_${Date.now()}@teste.com`,
            senha: "123",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(senhaFraca);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("senha");
    });
});

describe('GET /usuarios/:id - Buscar usuário por ID', () => {
    let usuarioId = null;

    beforeAll(async () => {
        // Criar um usuário para os testes
        const novoUsuario = {
            nome: "Usuário Para Busca",
            email: `busca_${Date.now()}@teste.com`,
            senha: "123456",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoUsuario);

        usuarioId = res.body.data.id;
    });

    it('1- Deve retornar usuário por ID válido', async () => {
        const res = await request(app)
            .get(`/usuarios/${usuarioId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(usuarioId);
        expect(res.body.data).not.toHaveProperty('senha');
    });

    it('2- Deve retornar erro 404 para usuário inexistente', async () => {
        const res = await request(app)
            .get('/usuarios/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("não encontrado");
    });

    it('3- Deve retornar erro 400 para ID inválido', async () => {
        const res = await request(app)
            .get('/usuarios/id_invalido')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('PUT /usuarios/:id - Atualizar usuário', () => {
    let usuarioId = null;

    beforeAll(async () => {
        // Criar um usuário para os testes
        const novoUsuario = {
            nome: "Usuário Para Atualizar",
            email: `atualizar_${Date.now()}@teste.com`,
            senha: "123456",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoUsuario);

        usuarioId = res.body.data.id;
    });

    it('1- Deve atualizar usuário com sucesso', async () => {
        const dadosAtualizacao = {
            nome: "Usuário Atualizado",
            tipo: "admin"
        }

        const res = await request(app)
            .put(`/usuarios/${usuarioId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosAtualizacao);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(dadosAtualizacao.nome);
        expect(res.body.data.tipo).toBe(dadosAtualizacao.tipo);
    });

    it('2- Deve retornar erro 404 para usuário inexistente', async () => {
        const res = await request(app)
            .put('/usuarios/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({ nome: "Teste" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('3- Deve permitir atualização de senha', async () => {
        const novaSenha = {
            senha: "nova_senha_123"
        }

        const res = await request(app)
            .put(`/usuarios/${usuarioId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novaSenha);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("atualizado");
    });

    it('4- Deve validar nova senha', async () => {
        const senhaInvalida = {
            senha: "123" // Muito curta
        }

        const res = await request(app)
            .put(`/usuarios/${usuarioId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(senhaInvalida);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('PUT /usuarios/:id/status - Alterar status do usuário', () => {
    let usuarioId = null;

    beforeAll(async () => {
        // Criar um usuário para os testes
        const novoUsuario = {
            nome: "Usuário Status Teste",
            email: `status_${Date.now()}@teste.com`,
            senha: "123456",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoUsuario);

        usuarioId = res.body.data.id;
    });

    it('1- Deve desativar usuário', async () => {
        const statusData = {
            ativo: false,
            motivo: "Usuário solicitou desativação"
        }

        const res = await request(app)
            .put(`/usuarios/${usuarioId}/status`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(statusData);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.ativo).toBe(false);
    });

    it('2- Deve reativar usuário', async () => {
        const statusData = {
            ativo: true
        }

        const res = await request(app)
            .put(`/usuarios/${usuarioId}/status`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(statusData);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.ativo).toBe(true);
    });

    it('3- Deve retornar erro 404 para usuário inexistente', async () => {
        const res = await request(app)
            .put('/usuarios/99999/status')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({ ativo: false });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe('DELETE /usuarios/:id - Remover usuário', () => {
    let usuarioId = null;

    beforeAll(async () => {
        // Criar um usuário para os testes
        const novoUsuario = {
            nome: "Usuário Para Remover",
            email: `remover_${Date.now()}@teste.com`,
            senha: "123456",
            tipo: "funcionario"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoUsuario);

        usuarioId = res.body.data.id;
    });

    it('1- Deve remover usuário com sucesso', async () => {
        const res = await request(app)
            .delete(`/usuarios/${usuarioId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("removido");
    });

    it('2- Deve retornar erro 404 para usuário inexistente', async () => {
        const res = await request(app)
            .delete('/usuarios/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('3- Deve impedir remoção do próprio usuário', async () => {
        // Tentar remover o usuário atual (admin)
        const profileRes = await request(app)
            .get('/auth/profile')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        const currentUserId = profileRes.body.data.id;

        const res = await request(app)
            .delete(`/usuarios/${currentUserId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("próprio usuário");
    });
});

describe('Tipos de usuário', () => {
    const tiposValidos = ['admin', 'funcionario', 'vendedor'];

    tiposValidos.forEach(tipo => {
        it(`Deve aceitar tipo de usuário: ${tipo}`, async () => {
            const novoUsuario = {
                nome: `Usuário ${tipo}`,
                email: `${tipo}_${Date.now()}@teste.com`,
                senha: "123456",
                tipo: tipo
            }

            const res = await request(app)
                .post('/usuarios')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${token}`)
                .send(novoUsuario);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.tipo).toBe(tipo);
        });
    });

    it('Deve rejeitar tipo de usuário inválido', async () => {
        const usuarioTipoInvalido = {
            nome: "Usuário Inválido",
            email: `invalido_${Date.now()}@teste.com`,
            senha: "123456",
            tipo: "tipo_inexistente"
        }

        const res = await request(app)
            .post('/usuarios')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(usuarioTipoInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Perfil do usuário', () => {
    it('1- Deve retornar perfil do usuário logado', async () => {
        const res = await request(app)
            .get('/auth/profile')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('nome');
        expect(res.body.data).toHaveProperty('email');
        expect(res.body.data).not.toHaveProperty('senha');
    });

    it('2- Deve atualizar perfil do usuário logado', async () => {
        const dadosAtualizacao = {
            nome: "Nome Atualizado via Perfil"
        }

        const res = await request(app)
            .put('/auth/profile')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosAtualizacao);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(dadosAtualizacao.nome);
    });
});