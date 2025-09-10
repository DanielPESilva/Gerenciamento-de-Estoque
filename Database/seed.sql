-- --------------------------------------------------------
-- Seeds para o banco DressFy - Gerenciamento de Estoque
-- Data: 9 de setembro de 2025
-- --------------------------------------------------------

USE `dressfy_db`;

-- Inserindo dados na tabela `usuarios`
INSERT INTO usuarios (nome, email, senha) VALUES 
    ('Admin Dressfy', 'admin@dressfy.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'),
    ('Vendedora Ana', 'ana@dressfy.com', '55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251'),
    ('Vendedora Maria', 'maria@dressfy.com', '55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251');

-- Inserindo dados na tabela `cliente`
INSERT INTO cliente (nome, email, cpf, telefone, endereco) VALUES 
    ('Gilberto Silva', 'gilberto@example.com', '123.456.789-00', '69999999999', 'Rua das Flores, 123'),
    ('Maria Oliveira', 'maria@example.com', '987.654.321-00', '69888888888', 'Av Central, 456'),
    ('João Souza', 'joao@example.com', '555.666.777-88', '69777777777', 'Rua do Comércio, 789'),
    ('Ana Costa', 'ana@example.com', '111.222.333-44', '69666666666', 'Av das Palmeiras, 321'),
    ('Pedro Santos', 'pedro@example.com', '444.555.666-77', '69555555555', 'Rua Nova, 654');

-- Inserindo dados na tabela `roupas`
INSERT INTO roupas (nome, descricao, tipo, tamanho, cor, preco, quantidade, usuarios_id) VALUES 
    ('Vestido Floral', 'Vestido estampado floral verão', 'Vestido', 'M', 'Azul', 120.00, 15, 1),
    ('Camisa Social', 'Camisa social algodão', 'Camisa', 'G', 'Branco', 80.00, 20, 2),
    ('Calça Jeans', 'Calça jeans modelo slim', 'Calça', '38', 'Azul Escuro', 100.00, 25, 2),
    ('Blusa de Seda', 'Blusa elegante de seda', 'Blusa', 'P', 'Rosa', 150.00, 10, 1),
    ('Saia Midi', 'Saia midi rodada', 'Saia', 'M', 'Preto', 90.00, 18, 3),
    ('Blazer Feminino', 'Blazer social feminino', 'Blazer', 'G', 'Cinza', 200.00, 8, 1),
    ('Short Jeans', 'Short jeans destroyed', 'Short', 'P', 'Azul Claro', 60.00, 22, 2),
    ('Vestido Longo', 'Vestido longo para festa', 'Vestido', 'M', 'Vermelho', 180.00, 5, 3),
    ('Camiseta Básica', 'Camiseta básica de algodão', 'Camiseta', 'G', 'Branco', 35.00, 30, 1),
    ('Calça Legging', 'Calça legging fitness', 'Calça', 'M', 'Preto', 45.00, 25, 2);

-- Inserindo dados na tabela `compras`
INSERT INTO compras (data_compra, forma_pgto, valor_pago, fornecendor, telefone_forncedor) VALUES 
    ('2025-06-20', 'Cartão', 1000.00, 'Fornecedor A', '11999999999'),
    ('2025-06-28', 'Boleto', 1500.00, 'Fornecedor B', '11988888888'),
    ('2025-07-10', 'Pix', 800.00, 'Fornecedor C', '11977777777');

-- Inserindo dados na tabela `compras_itens`
INSERT INTO compras_itens (roupas_id, compras_id, quatidade, valor_peça) VALUES 
    (1, 1, 5, 100),
    (2, 1, 8, 70),
    (3, 2, 10, 90),
    (4, 2, 4, 120),
    (5, 3, 6, 75),
    (6, 3, 2, 180);

-- Inserindo dados na tabela `vendas`
INSERT INTO vendas (data_venda, forma_pgto, valor_total, desconto, valor_pago) VALUES 
    ('2025-07-02', 'Pix', 200.00, 0, 200.00),
    ('2025-07-03', 'Dinheiro', 150.00, 10, 140.00),
    ('2025-07-05', 'Cartão', 350.00, 20, 330.00),
    ('2025-07-08', 'Pix', 90.00, 0, 90.00);

-- Inserindo dados na tabela `vendas_itens`
INSERT INTO vendas_itens (roupas_id, vendas_id, quatidade) VALUES 
    (1, 1, 1),
    (2, 1, 1),
    (3, 2, 1),
    (4, 2, 1),
    (5, 3, 2),
    (6, 3, 1),
    (7, 4, 1);

-- Inserindo dados na tabela `condicionais`
INSERT INTO condicionais (cliente_id, data, data_devolucao, devolvido) VALUES 
    (1, '2025-07-01', '2025-07-05', 0),
    (2, '2025-06-30', '2025-07-04', 1),
    (3, '2025-07-03', '2025-07-08', 0);

-- Inserindo dados na tabela `condicionais_itens`
INSERT INTO condicionais_itens (roupas_id, condicionais_id, quatidade) VALUES 
    (8, 1, 1),
    (9, 1, 1),
    (10, 2, 2),
    (1, 3, 1);

-- Inserindo dados na tabela `historico_status`
INSERT INTO historico_status (roupas_id, status_anterior, status_novo, alterado_em) VALUES 
    (1, 'disponivel', 'em_condicional', '2025-07-01 10:30:00'),
    (2, 'disponivel', 'vendido', '2025-07-02 14:15:00'),
    (3, 'em_condicional', 'vendido', '2025-07-03 16:45:00'),
    (8, 'disponivel', 'em_condicional', '2025-07-01 11:00:00'),
    (10, 'em_condicional', 'disponivel', '2025-07-04 09:20:00');

-- Inserindo dados na tabela `baixa`
INSERT INTO baixa (roupa_id, quantidade, data_baixa, motivo) VALUES 
    (4, 1, '2025-07-02', 'Peça danificada irreparavelmente'),
    (6, 1, '2025-07-05', 'Perda durante transporte'),
    (9, 2, '2025-07-08', 'Defeito de fábrica');
