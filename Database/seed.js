import prisma from '../src/models/prisma.js';

async function clearDatabase() {
  try {
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
    await prisma.$executeRaw`TRUNCATE TABLE baixa;`;
    await prisma.$executeRaw`TRUNCATE TABLE condicionais_itens;`;
    await prisma.$executeRaw`TRUNCATE TABLE condicionais;`;
    await prisma.$executeRaw`TRUNCATE TABLE compras_itens;`;
    await prisma.$executeRaw`TRUNCATE TABLE compras;`;
    await prisma.$executeRaw`TRUNCATE TABLE vendas_itens;`;
    await prisma.$executeRaw`TRUNCATE TABLE vendas;`;
    await prisma.$executeRaw`TRUNCATE TABLE historico_status;`;
    await prisma.$executeRaw`TRUNCATE TABLE roupas;`;
    await prisma.$executeRaw`TRUNCATE TABLE cliente;`;
    await prisma.$executeRaw`TRUNCATE TABLE usuarios;`;
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
  } catch (error) {
    console.error('Erro ao limpar o banco de dados:', error);
  }
}

async function seedDatabase() {
  try {
    // Inserindo dados na tabela `usuarios`
    const usuarios = await prisma.usuarios.createMany({
      data: [
        { 
          nome: 'Admin Dressfy', 
          email: 'admin@dressfy.com', 
          senha: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // senha: "password"
        },
        { 
          nome: 'Vendedora Ana', 
          email: 'ana@dressfy.com', 
          senha: '55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251' // senha: "123456"
        },
        { 
          nome: 'Vendedora Maria', 
          email: 'maria@dressfy.com', 
          senha: '55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251' // senha: "123456"
        },
      ],
    });

    // Inserindo dados na tabela `cliente`
    const clientes = await prisma.cliente.createMany({
      data: [
        { 
          nome: 'Gilberto Silva', 
          email: 'gilberto@example.com', 
          cpf: '123.456.789-00', 
          telefone: '69999999999', 
          endereco: 'Rua das Flores, 123' 
        },
        { 
          nome: 'Maria Oliveira', 
          email: 'maria@example.com', 
          cpf: '987.654.321-00', 
          telefone: '69888888888', 
          endereco: 'Av Central, 456' 
        },
        { 
          nome: 'João Souza', 
          email: 'joao@example.com', 
          cpf: '555.666.777-88', 
          telefone: '69777777777', 
          endereco: 'Rua do Comércio, 789' 
        },
        { 
          nome: 'Ana Costa', 
          email: 'ana@example.com', 
          cpf: '111.222.333-44', 
          telefone: '69666666666', 
          endereco: 'Av das Palmeiras, 321' 
        },
        { 
          nome: 'Pedro Santos', 
          email: 'pedro@example.com', 
          cpf: '444.555.666-77', 
          telefone: '69555555555', 
          endereco: 'Rua Nova, 654' 
        },
      ],
    });

    // Inserindo dados na tabela `roupas`
    const roupas = await prisma.roupas.createMany({
      data: [
        { nome: 'Vestido Floral', descricao: 'Vestido estampado floral verão', tipo: 'Vestido', tamanho: 'M', cor: 'Azul', preco: 120.00, quantidade: 15, usuarios_id: 1 },
        { nome: 'Camisa Social', descricao: 'Camisa social algodão', tipo: 'Camisa', tamanho: 'G', cor: 'Branco', preco: 80.00, quantidade: 20, usuarios_id: 2 },
        { nome: 'Calça Jeans', descricao: 'Calça jeans modelo slim', tipo: 'Calça', tamanho: '38', cor: 'Azul Escuro', preco: 100.00, quantidade: 25, usuarios_id: 2 },
        { nome: 'Blusa de Seda', descricao: 'Blusa elegante de seda', tipo: 'Blusa', tamanho: 'P', cor: 'Rosa', preco: 150.00, quantidade: 10, usuarios_id: 1 },
        { nome: 'Saia Midi', descricao: 'Saia midi rodada', tipo: 'Saia', tamanho: 'M', cor: 'Preto', preco: 90.00, quantidade: 18, usuarios_id: 3 },
        { nome: 'Blazer Feminino', descricao: 'Blazer social feminino', tipo: 'Blazer', tamanho: 'G', cor: 'Cinza', preco: 200.00, quantidade: 8, usuarios_id: 1 },
        { nome: 'Short Jeans', descricao: 'Short jeans destroyed', tipo: 'Short', tamanho: 'P', cor: 'Azul Claro', preco: 60.00, quantidade: 22, usuarios_id: 2 },
        { nome: 'Vestido Longo', descricao: 'Vestido longo para festa', tipo: 'Vestido', tamanho: 'M', cor: 'Vermelho', preco: 180.00, quantidade: 5, usuarios_id: 3 },
        { nome: 'Camiseta Básica', descricao: 'Camiseta básica de algodão', tipo: 'Camiseta', tamanho: 'G', cor: 'Branco', preco: 35.00, quantidade: 30, usuarios_id: 1 },
        { nome: 'Calça Legging', descricao: 'Calça legging fitness', tipo: 'Calça', tamanho: 'M', cor: 'Preto', preco: 45.00, quantidade: 25, usuarios_id: 2 },
      ],
    });

    // Inserindo dados na tabela `compras`
    const compras = await prisma.compras.createMany({
      data: [
        { data_compra: new Date('2025-06-20'), forma_pgto: 'Cartão', valor_pago: 1000.00, fornecendor: 'Fornecedor A', telefone_forncedor: '11999999999' },
        { data_compra: new Date('2025-06-28'), forma_pgto: 'Boleto', valor_pago: 1500.00, fornecendor: 'Fornecedor B', telefone_forncedor: '11988888888' },
        { data_compra: new Date('2025-07-10'), forma_pgto: 'Pix', valor_pago: 800.00, fornecendor: 'Fornecedor C', telefone_forncedor: '11977777777' },
      ],
    });

    // Inserindo dados na tabela `compras_itens`
    const comprasItens = await prisma.comprasItens.createMany({
      data: [
        { roupas_id: 1, compras_id: 1, quatidade: 5, valor_peça: 100 },
        { roupas_id: 2, compras_id: 1, quatidade: 8, valor_peça: 70 },
        { roupas_id: 3, compras_id: 2, quatidade: 10, valor_peça: 90 },
        { roupas_id: 4, compras_id: 2, quatidade: 4, valor_peça: 120 },
        { roupas_id: 5, compras_id: 3, quatidade: 6, valor_peça: 75 },
        { roupas_id: 6, compras_id: 3, quatidade: 2, valor_peça: 180 },
      ],
    });

    // Inserindo dados na tabela `vendas`
    const vendas = await prisma.vendas.createMany({
      data: [
        { data_venda: new Date('2025-07-02'), forma_pgto: 'Pix', valor_total: 200.00, desconto: 0, valor_pago: 200.00 },
        { data_venda: new Date('2025-07-03'), forma_pgto: 'Dinheiro', valor_total: 150.00, desconto: 10, valor_pago: 140.00 },
        { data_venda: new Date('2025-07-05'), forma_pgto: 'Cartão', valor_total: 350.00, desconto: 20, valor_pago: 330.00 },
        { data_venda: new Date('2025-07-08'), forma_pgto: 'Pix', valor_total: 90.00, desconto: 0, valor_pago: 90.00 },
      ],
    });

    // Inserindo dados na tabela `vendas_itens`
    const vendasItens = await prisma.vendasItens.createMany({
      data: [
        { roupas_id: 1, vendas_id: 1, quatidade: 1 },
        { roupas_id: 2, vendas_id: 1, quatidade: 1 },
        { roupas_id: 3, vendas_id: 2, quatidade: 1 },
        { roupas_id: 4, vendas_id: 2, quatidade: 1 },
        { roupas_id: 5, vendas_id: 3, quatidade: 2 },
        { roupas_id: 6, vendas_id: 3, quatidade: 1 },
        { roupas_id: 7, vendas_id: 4, quatidade: 1 },
      ],
    });

    // Inserindo dados na tabela `condicionais`
    const condicionais = await prisma.condicionais.createMany({
      data: [
        { cliente_id: 1, data: new Date('2025-07-01'), data_devolucao: new Date('2025-07-05'), devolvido: false },
        { cliente_id: 2, data: new Date('2025-06-30'), data_devolucao: new Date('2025-07-04'), devolvido: true },
        { cliente_id: 3, data: new Date('2025-07-03'), data_devolucao: new Date('2025-07-08'), devolvido: false },
      ],
    });

    // Inserindo dados na tabela `condicionais_itens`
    const condicionaisItens = await prisma.condicionaisItens.createMany({
      data: [
        { roupas_id: 8, condicionais_id: 1, quatidade: 1 },
        { roupas_id: 9, condicionais_id: 1, quatidade: 1 },
        { roupas_id: 10, condicionais_id: 2, quatidade: 2 },
        { roupas_id: 1, condicionais_id: 3, quatidade: 1 },
      ],
    });

    // Inserindo dados na tabela `historico_status`
    const historicoStatus = await prisma.historicoStatus.createMany({
      data: [
        { roupas_id: 1, status_anterior: 'disponivel', status_novo: 'em_condicional', alterado_em: new Date('2025-07-01') },
        { roupas_id: 2, status_anterior: 'disponivel', status_novo: 'vendido', alterado_em: new Date('2025-07-02') },
        { roupas_id: 3, status_anterior: 'em_condicional', status_novo: 'vendido', alterado_em: new Date('2025-07-03') },
        { roupas_id: 8, status_anterior: 'disponivel', status_novo: 'em_condicional', alterado_em: new Date('2025-07-01') },
        { roupas_id: 10, status_anterior: 'em_condicional', status_novo: 'disponivel', alterado_em: new Date('2025-07-04') },
      ],
    });

    // Inserindo dados na tabela `baixa`
    const baixas = await prisma.baixa.createMany({
      data: [
        { roupa_id: 4, quantidade: 1, data_baixa: new Date('2025-07-02'), motivo: 'Peça danificada irreparavelmente' },
        { roupa_id: 6, quantidade: 1, data_baixa: new Date('2025-07-05'), motivo: 'Perda durante transporte' },
        { roupa_id: 9, quantidade: 2, data_baixa: new Date('2025-07-08'), motivo: 'Defeito de fábrica' },
      ],
    });

    console.log('Banco de dados preenchido com sucesso!');
    console.log(`- ${usuarios.count} usuários criados`);
    console.log(`- ${clientes.count} clientes criados`);
    console.log(`- ${roupas.count} roupas criadas`);
    console.log(`- ${compras.count} compras criadas`);
    console.log(`- ${comprasItens.count} itens de compra criados`);
    console.log(`- ${vendas.count} vendas criadas`);
    console.log(`- ${vendasItens.count} itens de venda criados`);
    console.log(`- ${condicionais.count} condicionais criados`);
    console.log(`- ${condicionaisItens.count} itens condicionais criados`);
    console.log(`- ${historicoStatus.count} históricos de status criados`);
    console.log(`- ${baixas.count} baixas criadas`);

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function main() {
  console.log('Iniciando limpeza do banco de dados...');
  await clearDatabase();
  console.log('Banco limpo! Iniciando inserção de dados...');
  await seedDatabase();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
