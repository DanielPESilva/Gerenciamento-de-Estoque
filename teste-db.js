// Teste simples para verificar conexão com o banco
import prisma from './src/models/prisma.js';

async function testeConexao() {
    try {
        console.log("Testando conexão com o banco...");
        
        // Teste 1: Buscar usuários
        const usuarios = await prisma.usuarios.findMany();
        console.log(`✅ Usuários encontrados: ${usuarios.length}`);
        
        // Teste 2: Buscar roupas 
        const roupas = await prisma.roupas.findMany();
        console.log(`✅ Roupas encontradas: ${roupas.length}`);
        
        // Teste 3: Buscar vendas
        const vendas = await prisma.vendas.findMany();
        console.log(`✅ Vendas encontradas: ${vendas.length}`);
        
        // Teste 4: Tentar criar uma venda simples (sem transação)
        console.log("Testando criação de venda...");
        
        const novaVenda = await prisma.vendas.create({
            data: {
                forma_pgto: "Teste",
                valor_total: 100,
                desconto: 0,
                valor_pago: 100
            }
        });
        
        console.log(`✅ Venda criada com ID: ${novaVenda.id}`);
        
        // Limpar o teste
        await prisma.vendas.delete({
            where: { id: novaVenda.id }
        });
        
        console.log("✅ Teste de venda limpo");
        
    } catch (error) {
        console.error("❌ Erro no teste:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testeConexao();
