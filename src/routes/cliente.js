import express from 'express';
import ClienteService from '../services/clienteService.js';

const router = express.Router();

// GET /clientes
router.get('/', async (req, res) => {
  const clientes = await ClienteService.getAllClientes();
  res.json(clientes);
});

// GET /clientes/:id
router.get('/:id', async (req, res) => {
  const cliente = await ClienteService.getClienteById(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json(cliente);
});

// POST /clientes
router.post('/', async (req, res) => {
  try {
    const cliente = await ClienteService.createCliente(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const cliente = await ClienteService.updateCliente(req.params.id, req.body);
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    await ClienteService.deleteCliente(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
