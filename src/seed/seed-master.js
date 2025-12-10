import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

/**
 * SEED MASTER - Arquivo consolidado para todas as operações de banco de dados
 * Este arquivo substitui todos os scripts separados de seed/update/reset
 */

// =============================================================================
// FUNÇÕES DE LIMPEZA
// =============================================================================

async function clearDatabase() {
  console.log("🧹 Limpando banco de dados...");
  try {
    // Deletar em ordem para respeitar foreign keys
    await prisma.vendasItens.deleteMany({});
    await prisma.vendas.deleteMany({});
    await prisma.comprasItens.deleteMany({});
    await prisma.compras.deleteMany({});
    await prisma.condicionaisItens.deleteMany({});
    await prisma.condicionais.deleteMany({});
    await prisma.historicoStatus.deleteMany({});
    await prisma.baixa.deleteMany({});
    await prisma.roupas.deleteMany({});
    await prisma.usuarios.deleteMany({});
    await prisma.cliente.deleteMany({});
    console.log("✅ Banco de dados limpo!");
  } catch (error) {
    console.error("❌ Erro ao limpar o banco de dados:", error);
    throw error;
  }
}

// =============================================================================
// DADOS BÁSICOS
// =============================================================================

const hashPasswordSync = (plain) => bcrypt.hashSync(plain, 10);

const USUARIOS_DATA = [
  { 
    nome: 'Admin Dressfy', 
    email: 'admin@dressfy.com', 
    senha: hashPasswordSync('password')
  },
  { 
    nome: 'Vendedora Ana', 
    email: 'ana@dressfy.com', 
    senha: hashPasswordSync('123456')
  },
  { 
    nome: 'Vendedora Maria', 
    email: 'maria@dressfy.com', 
    senha: hashPasswordSync('123456')
  },
];

const CLIENTES_DATA = [
  { nome: 'Gilberto Silva', email: 'gilberto@email.com', cpf: '123.456.789-01', telefone: '(11) 99999-9999' },
  { nome: 'Maria Oliveira', email: 'maria@email.com', cpf: '234.567.890-12', telefone: '(11) 88888-8888' },
  { nome: 'João Santos', email: 'joao@email.com', cpf: '345.678.901-23', telefone: '(11) 77777-7777' },
  { nome: 'Ana Costa', email: 'ana@email.com', cpf: '456.789.012-34', telefone: '(11) 66666-6666' },
  { nome: 'Pedro Lima', email: 'pedro@email.com', cpf: '567.890.123-45', telefone: '(11) 55555-5555' },
];

const ROUPAS_DATA = [
  { nome: 'Vestido Floral', descricao: 'Vestido estampado com flores', tipo: 'Vestido', tamanho: 'M', cor: 'Azul', preco: 120.00, quantidade: 10, usuarios_id: 1 },
  { nome: 'Camisa Social', descricao: 'Camisa social masculina', tipo: 'Camisa', tamanho: 'G', cor: 'Branco', preco: 80.00, quantidade: 15, usuarios_id: 1 },
  { nome: 'Calça Jeans', descricao: 'Calça jeans feminina', tipo: 'Calça', tamanho: '38', cor: 'Azul Escuro', preco: 100.00, quantidade: 8, usuarios_id: 2 },
  { nome: 'Blusa de Seda', descricao: 'Blusa feminina em seda', tipo: 'Blusa', tamanho: 'P', cor: 'Rosa', preco: 150.00, quantidade: 5, usuarios_id: 2 },
  { nome: 'Jaqueta Jeans', descricao: 'Jaqueta jeans unissex', tipo: 'Jaqueta', tamanho: 'M', cor: 'Azul', preco: 180.00, quantidade: 6, usuarios_id: 3 },
  { nome: 'Saia Plissada', descricao: 'Saia plissada feminina', tipo: 'Saia', tamanho: 'G', cor: 'Preto', preco: 90.00, quantidade: 12, usuarios_id: 3 },
  { nome: 'Blazer Feminino', descricao: 'Blazer elegante feminino', tipo: 'Blazer', tamanho: 'M', cor: 'Cinza', preco: 200.00, quantidade: 4, usuarios_id: 1 },
  { nome: 'Camiseta Básica', descricao: 'Camiseta básica algodão', tipo: 'Camiseta', tamanho: 'G', cor: 'Branco', preco: 35.00, quantidade: 20, usuarios_id: 2 },
  { nome: 'Short Jeans', descricao: 'Short jeans feminino', tipo: 'Short', tamanho: 'M', cor: 'Azul', preco: 60.00, quantidade: 15, usuarios_id: 3 },
  { nome: 'Casaco de Lã', descricao: 'Casaco quente de lã', tipo: 'Casaco', tamanho: 'G', cor: 'Bege', preco: 250.00, quantidade: 3, usuarios_id: 1 },
];

const VENDAS_BASICAS_DATA = [
  { data_venda: new Date('2025-01-15'), forma_pgto: 'Pix', valor_total: 240.00, desconto: 10, valor_pago: 230.00 },
  { data_venda: new Date('2025-01-16'), forma_pgto: 'Dinheiro', valor_total: 180.00, desconto: 0, valor_pago: 180.00 },
  { data_venda: new Date('2025-01-17'), forma_pgto: 'Cartão de Crédito', valor_total: 350.00, desconto: 20, valor_pago: 330.00 },
  { data_venda: new Date('2025-01-18'), forma_pgto: 'Cartão de Débito', valor_total: 120.00, desconto: 5, valor_pago: 115.00 },
  { data_venda: new Date('2025-01-19'), forma_pgto: 'Boleto', valor_total: 280.00, desconto: 0, valor_pago: 280.00 },
  { data_venda: new Date('2025-01-20'), forma_pgto: 'Cheque', valor_total: 160.00, desconto: 10, valor_pago: 150.00 },
];

const VENDAS_PERMUTA_DATA = [
  { 
    data_venda: new Date('2025-01-21'), 
    forma_pgto: 'Permuta', 
    valor_total: 0, 
    desconto: 0, 
    valor_pago: 0,
    descricao_permuta: "Troca de 1x Calça Jeans por 1x Camiseta Básica + 1x Short Jeans" 
  },
  { 
    data_venda: new Date('2025-01-22'), 
    forma_pgto: 'Permuta', 
    valor_total: 0, 
    desconto: 0, 
    valor_pago: 0,
    descricao_permuta: "Troca de 2x Camisetas Básicas por 1x Blazer Feminino" 
  },
  { 
    data_venda: new Date('2025-01-23'), 
    forma_pgto: 'Permuta', 
    valor_total: 0, 
    desconto: 0, 
    valor_pago: 0,
    descricao_permuta: "Troca de 1x Jaqueta Jeans por serviços de costura em 3 peças" 
  },
  { 
    data_venda: new Date('2025-01-24'), 
    forma_pgto: 'Permuta', 
    valor_total: 0, 
    desconto: 0, 
    valor_pago: 0,
    descricao_permuta: "Troca de 1x Vestido Floral por 2x Blusas de Seda (pequeno defeito)" 
  },
  { 
    data_venda: new Date('2025-01-25'), 
    forma_pgto: 'Permuta', 
    valor_total: 0, 
    desconto: 0, 
    valor_pago: 0,
    descricao_permuta: "Troca de 1x Casaco de Lã por reforma completa de 5 peças vintage" 
  },
];

const CONDICIONAIS_DATA = [
  {
    data: new Date('2025-01-10'),
    data_devolucao: new Date('2025-02-10'),
    devolvido: false
  },
  {
    data: new Date('2025-01-12'),
    data_devolucao: new Date('2025-02-12'),
    devolvido: false
  },
  {
    data: new Date('2025-01-15'),
    data_devolucao: new Date('2025-02-15'),
    devolvido: false
  },
  {
    data: new Date('2024-12-20'),
    data_devolucao: new Date('2025-01-20'),
    devolvido: true
  },
  {
    data: new Date('2025-01-05'),
    data_devolucao: new Date('2025-02-05'),
    devolvido: false
  },
];

// =============================================================================
// FUNÇÕES DE CRIAÇÃO
// =============================================================================

async function createUsuarios() {
  console.log("👥 Criando usuários...");
  const usuarios = await prisma.usuarios.createMany({
    data: USUARIOS_DATA,
  });
  console.log(`✅ ${usuarios.count} usuários criados`);
  return usuarios;
}

async function createClientes() {
  console.log("👤 Criando clientes...");
  const clientes = await prisma.cliente.createMany({
    data: CLIENTES_DATA,
  });
  console.log(`✅ ${clientes.count} clientes criados`);
  return clientes;
}

async function createRouPas() {
  console.log("👕 Criando itens/roupas...");
  
  // Buscar usuários criados para obter IDs válidos
  const usuarios = await prisma.usuarios.findMany({ orderBy: { id: 'asc' } });
  
  if (usuarios.length === 0) {
    throw new Error("Nenhum usuário encontrado. Crie usuários primeiro.");
  }
  
  // Ajustar os dados das roupas com IDs válidos de usuários
  const roupasDataWithValidIds = ROUPAS_DATA.map(roupa => ({
    ...roupa,
    usuarios_id: usuarios[Math.min(roupa.usuarios_id - 1, usuarios.length - 1)].id
  }));
  
  const roupas = await prisma.roupas.createMany({
    data: roupasDataWithValidIds,
  });
  console.log(`✅ ${roupas.count} itens criados`);
  return roupas;
}

async function createVendasBasicas() {
  console.log("💰 Criando vendas básicas...");
  const vendas = await prisma.vendas.createMany({
    data: VENDAS_BASICAS_DATA,
  });
  console.log(`✅ ${vendas.count} vendas básicas criadas`);
  return vendas;
}

async function createVendasPermuta() {
  console.log("🔄 Criando vendas de permuta...");
  const vendasPermuta = await prisma.vendas.createMany({
    data: VENDAS_PERMUTA_DATA,
  });
  console.log(`✅ ${vendasPermuta.count} vendas de permuta criadas`);
  return vendasPermuta;
}

async function createVendasItens() {
  console.log("📦 Associando itens às vendas...");
  
  // Buscar vendas e roupas criadas
  const vendas = await prisma.vendas.findMany({ orderBy: { id: 'asc' } });
  const roupas = await prisma.roupas.findMany({ orderBy: { id: 'asc' } });

  if (vendas.length === 0 || roupas.length === 0) {
    console.log("⚠️ Nenhuma venda ou roupa encontrada para associar");
    return;
  }

  // Criar associações vendas-itens para vendas básicas (primeiras 6)
  const vendasItensData = [];
  
  // Venda 1: Vestido + Camisa
  if (vendas[0]) vendasItensData.push(
    { roupas_id: roupas[0]?.id, vendas_id: vendas[0].id, quatidade: 1 },
    { roupas_id: roupas[1]?.id, vendas_id: vendas[0].id, quatidade: 1 }
  );
  
  // Venda 2: Calça Jeans
  if (vendas[1]) vendasItensData.push(
    { roupas_id: roupas[2]?.id, vendas_id: vendas[1].id, quatidade: 1 }
  );
  
  // Venda 3: Blusa + Jaqueta
  if (vendas[2]) vendasItensData.push(
    { roupas_id: roupas[3]?.id, vendas_id: vendas[2].id, quatidade: 1 },
    { roupas_id: roupas[4]?.id, vendas_id: vendas[2].id, quatidade: 1 }
  );
  
  // Venda 4: Saia
  if (vendas[3]) vendasItensData.push(
    { roupas_id: roupas[5]?.id, vendas_id: vendas[3].id, quatidade: 1 }
  );
  
  // Venda 5: Blazer + Camiseta
  if (vendas[4]) vendasItensData.push(
    { roupas_id: roupas[6]?.id, vendas_id: vendas[4].id, quatidade: 1 },
    { roupas_id: roupas[7]?.id, vendas_id: vendas[4].id, quatidade: 2 }
  );
  
  // Venda 6: Short
  if (vendas[5]) vendasItensData.push(
    { roupas_id: roupas[8]?.id, vendas_id: vendas[5].id, quatidade: 1 }
  );

  // Para vendas de permuta, também associar alguns itens (para histórico)
  if (vendas[6]) vendasItensData.push(
    { roupas_id: roupas[2]?.id, vendas_id: vendas[6].id, quatidade: 1 } // Calça Jeans
  );
  
  if (vendas[7]) vendasItensData.push(
    { roupas_id: roupas[7]?.id, vendas_id: vendas[7].id, quatidade: 2 } // Camisetas
  );

  if (vendasItensData.length > 0) {
    const vendasItens = await prisma.vendasItens.createMany({
      data: vendasItensData,
    });
    console.log(`✅ ${vendasItens.count} associações vendas-itens criadas`);
  }
}

async function createCondicionais() {
  console.log("📋 Criando condicionais...");
  
  // Buscar clientes criados
  const clientes = await prisma.cliente.findMany({ orderBy: { id: 'asc' } });
  
  if (clientes.length === 0) {
    console.log("⚠️ Nenhum cliente encontrado para criar condicionais");
    return;
  }
  
  // Associar cada condicional a um cliente
  const condicionaisDataWithCliente = CONDICIONAIS_DATA.map((condicional, index) => ({
    ...condicional,
    cliente_id: clientes[index % clientes.length].id
  }));
  
  const condicionais = await prisma.condicionais.createMany({
    data: condicionaisDataWithCliente,
  });
  console.log(`✅ ${condicionais.count} condicionais criadas`);
  return condicionais;
}

async function createCondicionaisItens() {
  console.log("📦 Associando itens às condicionais...");
  
  // Buscar condicionais e roupas criadas
  const condicionais = await prisma.condicionais.findMany({ orderBy: { id: 'asc' } });
  const roupas = await prisma.roupas.findMany({ orderBy: { id: 'asc' } });

  if (condicionais.length === 0 || roupas.length === 0) {
    console.log("⚠️ Nenhuma condicional ou roupa encontrada para associar");
    return;
  }

  // Criar associações condicionais-itens
  const condicionaisItensData = [];
  
  // Condicional 1: Vestido + Saia + Blusa
  if (condicionais[0]) condicionaisItensData.push(
    { roupas_id: roupas[0]?.id, condicionais_id: condicionais[0].id, quatidade: 1 },
    { roupas_id: roupas[5]?.id, condicionais_id: condicionais[0].id, quatidade: 2 },
    { roupas_id: roupas[3]?.id, condicionais_id: condicionais[0].id, quatidade: 1 }
  );
  
  // Condicional 2: Camisa + Camiseta
  if (condicionais[1]) condicionaisItensData.push(
    { roupas_id: roupas[1]?.id, condicionais_id: condicionais[1].id, quatidade: 1 },
    { roupas_id: roupas[7]?.id, condicionais_id: condicionais[1].id, quatidade: 4 }
  );
  
  // Condicional 3: Jaqueta + Short
  if (condicionais[2]) condicionaisItensData.push(
    { roupas_id: roupas[4]?.id, condicionais_id: condicionais[2].id, quatidade: 1 },
    { roupas_id: roupas[8]?.id, condicionais_id: condicionais[2].id, quatidade: 2 }
  );
  
  // Condicional 4: Blazer + Casaco (Devolvida)
  if (condicionais[3]) condicionaisItensData.push(
    { roupas_id: roupas[6]?.id, condicionais_id: condicionais[3].id, quatidade: 1 },
    { roupas_id: roupas[9]?.id, condicionais_id: condicionais[3].id, quatidade: 1 }
  );
  
  // Condicional 5: Calça Jeans
  if (condicionais[4]) condicionaisItensData.push(
    { roupas_id: roupas[2]?.id, condicionais_id: condicionais[4].id, quatidade: 1 }
  );

  if (condicionaisItensData.length > 0) {
    const condicionaisItens = await prisma.condicionaisItens.createMany({
      data: condicionaisItensData,
    });
    console.log(`✅ ${condicionaisItens.count} associações condicionais-itens criadas`);
  }
}

// =============================================================================
// FUNÇÕES PRINCIPAIS
// =============================================================================

async function seedBasicData() {
  console.log("🌱 Populando dados básicos...");
  try {
    await createUsuarios();
    await createClientes();
    await createRouPas();
    await createVendasBasicas();
    await createVendasItens();
    await createCondicionais();
    await createCondicionaisItens();
    console.log("✅ Dados básicos criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar dados básicos:", error);
    throw error;
  }
}

async function seedPermutaData() {
  console.log("🔄 Populando dados de permuta...");
  try {
    await createVendasPermuta();
    console.log("✅ Dados de permuta criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar dados de permuta:", error);
    throw error;
  }
}

async function seedFullDatabase() {
  console.log("🌱 Populando banco completo...");
  try {
    await seedBasicData();
    await seedPermutaData();
    console.log("✅ Banco de dados totalmente populado!");
  } catch (error) {
    console.error("❌ Erro ao popular banco completo:", error);
    throw error;
  }
}

async function resetAndSeed() {
  console.log("🔄 Reset completo do banco de dados...");
  try {
    await clearDatabase();
    await seedFullDatabase();
    console.log("✅ Reset e seed completos!");
  } catch (error) {
    console.error("❌ Erro no reset:", error);
    throw error;
  }
}

// =============================================================================
// FUNÇÕES DE ESTATÍSTICAS E VERIFICAÇÃO
// =============================================================================

async function showStatistics() {
  console.log("\n📊 Estatísticas do banco de dados:");
  try {
    const usuariosCount = await prisma.usuarios.count();
    const clientesCount = await prisma.cliente.count();
    const roupasCount = await prisma.roupas.count();
    const vendasCount = await prisma.vendas.count();
    const vendasItensCount = await prisma.vendasItens.count();
    const condicionaisCount = await prisma.condicionais.count();
    const condicionaisItensCount = await prisma.condicionaisItens.count();
    
    // Contar vendas por forma de pagamento
    const vendasPorFormaPgto = await prisma.vendas.groupBy({
      by: ['forma_pgto'],
      _count: { forma_pgto: true },
    });

    console.log(`👥 Usuários: ${usuariosCount}`);
    console.log(`👤 Clientes: ${clientesCount}`);
    console.log(`👕 Itens: ${roupasCount}`);
    console.log(`💰 Vendas: ${vendasCount}`);
    console.log(`📦 Vendas-Itens: ${vendasItensCount}`);
    console.log(`📋 Condicionais: ${condicionaisCount}`);
    console.log(`📦 Condicionais-Itens: ${condicionaisItensCount}`);
    
    console.log("\n💳 Vendas por forma de pagamento:");
    vendasPorFormaPgto.forEach(item => {
      console.log(`   ${item.forma_pgto}: ${item._count.forma_pgto}`);
    });
    
    // Mostrar vendas de permuta com descrições
    const vendasPermuta = await prisma.vendas.findMany({
      where: { forma_pgto: 'Permuta' },
      select: { id: true, data_venda: true, descricao_permuta: true }
    });
    
    if (vendasPermuta.length > 0) {
      console.log("\n🔄 Vendas de Permuta:");
      vendasPermuta.forEach((venda, index) => {
        console.log(`   ${index + 1}. ${venda.data_venda.toISOString().split('T')[0]}: ${venda.descricao_permuta}`);
      });
    }

    // Mostrar condicionais por status
    const condicionaisPorStatus = await prisma.condicionais.groupBy({
      by: ['devolvido'],
      _count: { devolvido: true },
    });
    
    if (condicionaisPorStatus.length > 0) {
      console.log("\n📋 Condicionais por status:");
      condicionaisPorStatus.forEach(item => {
        const status = item.devolvido ? 'Devolvidas' : 'Ativas';
        console.log(`   ${status}: ${item._count.devolvido}`);
      });
    }
  } catch (error) {
    console.error("❌ Erro ao mostrar estatísticas:", error);
  }
}

// =============================================================================
// FUNÇÕES DE UTILIDADE
// =============================================================================

async function addMoreProducts() {
  console.log("📦 Adicionando 50 produtos extras para teste de paginação...");
  
  const usuario = await prisma.usuarios.findUnique({
    where: { email: 'danielpereiraestevao6@gmail.com' }
  });
  
  if (!usuario) {
    console.log("⚠️ Usuário de teste não encontrado. Use 'node Database/seed-master.js reset' primeiro.");
    return;
  }
  
  const tipos = ['Vestido', 'Camisa', 'Calça', 'Blusa', 'Jaqueta', 'Saia', 'Blazer', 'Camiseta', 'Short', 'Casaco'];
  const tamanhos = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44'];
  const cores = ['Azul', 'Vermelho', 'Verde', 'Amarelo', 'Preto', 'Branco', 'Rosa', 'Roxo', 'Laranja', 'Cinza', 'Marrom', 'Bege'];
  
  const produtos = [];
  
  for (let i = 1; i <= 50; i++) {
    const tipo = tipos[i % tipos.length];
    const tamanho = tamanhos[i % tamanhos.length];
    const cor = cores[i % cores.length];
    const preco = (Math.random() * 200 + 50).toFixed(2);
    const quantidade = Math.floor(Math.random() * 20) + 1;
    
    produtos.push({
      nome: `${tipo} ${cor}`,
      descricao: `${tipo} ${cor} em tamanho ${tamanho}`,
      tipo: tipo,
      tamanho: tamanho,
      cor: cor,
      preco: parseFloat(preco),
      quantidade: quantidade,
      usuarios_id: usuario.id
    });
  }
  
  const result = await prisma.roupas.createMany({
    data: produtos
  });
  
  console.log(`✅ ${result.count} produtos adicionados!`);
  
  const total = await prisma.roupas.count({
    where: { usuarios_id: usuario.id }
  });
  
  console.log(`📊 Total de produtos do usuário: ${total}`);
}

async function addCondicionalProducts() {
  console.log("📋 Adicionando produtos em condicional (quantidade 0)...");
  
  const usuario = await prisma.usuarios.findUnique({
    where: { email: 'danielpereiraestevao6@gmail.com' }
  });
  
  if (!usuario) {
    console.log("⚠️ Usuário de teste não encontrado.");
    return;
  }
  
  const produtosCondicional = [
    {
      nome: 'Vestido Longo Vermelho',
      descricao: 'Vestido longo para festa - Em condicional',
      tipo: 'Vestido',
      tamanho: 'M',
      cor: 'Vermelho',
      preco: 320.00,
      quantidade: 0,
      usuarios_id: usuario.id
    },
    {
      nome: 'Terno Completo',
      descricao: 'Terno masculino completo - Em condicional',
      tipo: 'Terno',
      tamanho: '42',
      cor: 'Preto',
      preco: 580.00,
      quantidade: 0,
      usuarios_id: usuario.id
    },
    {
      nome: 'Casaco de Couro',
      descricao: 'Casaco de couro legítimo - Em condicional',
      tipo: 'Casaco',
      tamanho: 'G',
      cor: 'Marrom',
      preco: 450.00,
      quantidade: 0,
      usuarios_id: usuario.id
    },
    {
      nome: 'Conjunto Social Feminino',
      descricao: 'Conjunto blazer + calça - Em condicional',
      tipo: 'Conjunto',
      tamanho: 'M',
      cor: 'Cinza',
      preco: 380.00,
      quantidade: 0,
      usuarios_id: usuario.id
    },
    {
      nome: 'Vestido Floral Premium',
      descricao: 'Vestido floral de grife - Em condicional',
      tipo: 'Vestido',
      tamanho: 'P',
      cor: 'Amarelo',
      preco: 420.00,
      quantidade: 0,
      usuarios_id: usuario.id
    }
  ];
  
  const result = await prisma.roupas.createMany({
    data: produtosCondicional
  });
  
  console.log(`✅ ${result.count} produtos em condicional adicionados!`);
}

async function addCondicionalRecords() {
  console.log("📋 Criando registros de condicionais...");
  
  const clientes = await prisma.cliente.findMany({ orderBy: { id: 'asc' } });
  const roupas = await prisma.roupas.findMany({ orderBy: { id: 'asc' } });
  
  if (clientes.length === 0) {
    console.log("⚠️ Nenhum cliente encontrado");
    return;
  }
  
  // Criar condicionais
  const cond1 = await prisma.condicionais.create({
    data: {
      cliente_id: clientes[0].id,
      data: new Date('2025-01-10'),
      data_devolucao: new Date('2025-02-10'),
      devolvido: false
    }
  });
  
  const cond2 = await prisma.condicionais.create({
    data: {
      cliente_id: clientes[1].id,
      data: new Date('2025-01-12'),
      data_devolucao: new Date('2025-02-12'),
      devolvido: false
    }
  });
  
  const cond3 = await prisma.condicionais.create({
    data: {
      cliente_id: clientes[2].id,
      data: new Date('2025-01-15'),
      data_devolucao: new Date('2025-02-15'),
      devolvido: false
    }
  });
  
  const cond4 = await prisma.condicionais.create({
    data: {
      cliente_id: clientes[3 % clientes.length].id,
      data: new Date('2024-12-20'),
      data_devolucao: new Date('2025-01-20'),
      devolvido: true
    }
  });
  
  console.log('✅ 4 condicionais criadas');
  
  // Adicionar itens às condicionais
  if (roupas.length >= 10) {
    await prisma.condicionaisItens.createMany({
      data: [
        { roupas_id: roupas[0].id, condicionais_id: cond1.id, quatidade: 1 },
        { roupas_id: roupas[5].id, condicionais_id: cond1.id, quatidade: 2 },
        { roupas_id: roupas[1].id, condicionais_id: cond2.id, quatidade: 1 },
        { roupas_id: roupas[7].id, condicionais_id: cond2.id, quatidade: 3 },
        { roupas_id: roupas[4].id, condicionais_id: cond3.id, quatidade: 1 },
        { roupas_id: roupas[6].id, condicionais_id: cond4.id, quatidade: 1 },
      ]
    });
    console.log('✅ Itens associados às condicionais');
  }
}

async function updateEscamboToPermuta() {
  console.log("🔄 Atualizando 'Escambo' para 'Permuta'...");
  try {
    const result = await prisma.vendas.updateMany({
      where: { forma_pgto: 'Escambo' },
      data: { forma_pgto: 'Permuta' }
    });
    console.log(`✅ ${result.count} venda(s) atualizada(s) de 'Escambo' para 'Permuta'`);
  } catch (error) {
    console.error("❌ Erro ao atualizar escambo:", error);
  }
}

// =============================================================================
// FUNÇÃO PRINCIPAL E CLI
// =============================================================================

async function main() {
  const command = process.argv[2];
  
  console.log("🗃️  SEED MASTER - Gerenciador de Banco de Dados DressFy");
  console.log("=" .repeat(60));
  
  try {
    switch (command) {
      case 'clear':
        await clearDatabase();
        break;
        
      case 'basic':
        await seedBasicData();
        break;
        
      case 'permuta':
        await seedPermutaData();
        break;
        
      case 'full':
        await seedFullDatabase();
        break;
        
      case 'reset':
        await resetAndSeed();
        break;
        
      case 'stats':
        await showStatistics();
        break;
        
      case 'fix-escambo':
        await updateEscamboToPermuta();
        break;
        
      case 'add-products':
        await addMoreProducts();
        break;
        
      case 'add-condicional-products':
        await addCondicionalProducts();
        break;
        
      case 'add-condicionais':
        await addCondicionalRecords();
        break;
        
      default:
        console.log("💡 Comandos disponíveis:");
        console.log("   node Database/seed-master.js clear                  - Limpar banco");
        console.log("   node Database/seed-master.js basic                  - Dados básicos");
        console.log("   node Database/seed-master.js permuta                - Dados de permuta");
        console.log("   node Database/seed-master.js full                   - Dados completos");
        console.log("   node Database/seed-master.js reset                  - Reset completo");
        console.log("   node Database/seed-master.js stats                  - Mostrar estatísticas");
        console.log("   node Database/seed-master.js fix-escambo            - Corrigir escambo→permuta");
        console.log("   node Database/seed-master.js add-products           - Adicionar 50 produtos extras");
        console.log("   node Database/seed-master.js add-condicional-products - Adicionar produtos em condicional");
        console.log("   node Database/seed-master.js add-condicionais       - Criar registros de condicionais");
        break;
    }
  } catch (error) {
    console.error("❌ Erro na execução:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (process.argv[1] && process.argv[1].endsWith('seed-master.js')) {
  main();
}

// Exportar funções para uso em outros arquivos
export {
  clearDatabase,
  seedBasicData,
  seedPermutaData,
  seedFullDatabase,
  resetAndSeed,
  showStatistics,
  updateEscamboToPermuta,
  addMoreProducts,
  addCondicionalProducts,
  addCondicionalRecords,
  main
};



