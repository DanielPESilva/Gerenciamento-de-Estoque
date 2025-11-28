import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  console.log('👤 Criando usuário de teste...\n');
  
  const email = 'danielpereiraestevao6@gmail.com';
  const senha = 'Hue@123123';
  const cpf = '07895934163';
  
  // Verificar se já existe
  const existing = await prisma.usuarios.findUnique({
    where: { email }
  });
  
  if (existing) {
    console.log('⚠️  Usuário já existe. Atualizando senha...');
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    await prisma.usuarios.update({
      where: { email },
      data: { senha: hashedPassword }
    });
    
    console.log('✅ Senha atualizada!');
  } else {
    console.log('📝 Criando novo usuário...');
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const usuario = await prisma.usuarios.create({
      data: {
        nome: 'Daniel Pereira Estevao',
        email: email,
        senha: hashedPassword,
        cpf: cpf
      }
    });
    
    console.log('✅ Usuário criado com sucesso!');
    console.log(`  ID: ${usuario.id}`);
    console.log(`  Nome: ${usuario.nome}`);
    console.log(`  Email: ${usuario.email}`);
    console.log(`  CPF: ${usuario.cpf}`);
  }
  
  console.log('\n📋 Credenciais de login:');
  console.log(`  Email: ${email}`);
  console.log(`  Senha: ${senha}`);
  
  await prisma.$disconnect();
}

createUser();
