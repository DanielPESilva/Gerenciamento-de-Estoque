const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tipos = ['Vestido', 'Camisa', 'Calça', 'Blusa', 'Jaqueta', 'Saia', 'Blazer', 'Camiseta', 'Short', 'Casaco'];
const tamanhos = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44'];
const cores = ['Azul', 'Vermelho', 'Verde', 'Amarelo', 'Preto', 'Branco', 'Rosa', 'Roxo', 'Laranja', 'Cinza', 'Marrom', 'Bege'];

async function addMoreProducts() {
  console.log('📦 Adicionando mais produtos...');
  
  const usuario = await prisma.usuarios.findUnique({
    where: { email: 'danielpereiraestevao6@gmail.com' }
  });
  
  if (!usuario) {
    console.log('❌ Usuário não encontrado');
    return;
  }
  
  const produtos = [];
  
  for (let i = 1; i <= 50; i++) {
    const tipo = tipos[i % tipos.length];
    const tamanho = tamanhos[i % tamanhos.length];
    const cor = cores[i % cores.length];
    const preco = (Math.random() * 200 + 50).toFixed(2);
    const quantidade = Math.floor(Math.random() * 20) + 1;
    
    produtos.push({
      nome: tipo + ' ' + cor + ' #' + i,
      descricao: tipo + ' ' + cor + ' em tamanho ' + tamanho,
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
  
  console.log('✅ ' + result.count + ' produtos adicionados!');
  
  const total = await prisma.roupas.count({
    where: { usuarios_id: usuario.id }
  });
  
  console.log('📊 Total de produtos do usuário: ' + total);
  
  await prisma.$disconnect();
}

addMoreProducts();
