import swaggerHead from './configs/head.js';
import commonResponses from './utils/commonResponses.js';
import itensSchema from './schemas/itensSchema.js';
import usuariosSchema from './schemas/usuariosSchema.js';
import vendasSchema from './schemas/vendasSchema.js';
import condicionaisSchema from './schemas/CondicionaisSchema.js';
import itensRouter from './routes/itensRouter.js';
import usuariosRouter from './routes/usuariosRouter.js';
import vendasRouter from './routes/vendasRouter.js';

const swaggerDocument = {
  ...swaggerHead,
  paths: {
    ...itensRouter,
    ...usuariosRouter,
    ...vendasRouter
  },
  components: {
    schemas: {
      // Schemas de Itens
      Item: itensSchema.Item,
      CreateItemRequest: itensSchema.CreateItemRequest,
      UpdateItemRequest: itensSchema.UpdateItemRequest,
      QuantityRequest: itensSchema.QuantityRequest,
      SearchRequest: itensSchema.SearchRequest,
      
      // Schemas de Usuários
      Usuario: usuariosSchema.Usuario,
      CreateUsuarioRequest: usuariosSchema.CreateUsuarioRequest,
      UpdateUsuarioRequest: usuariosSchema.UpdateUsuarioRequest,
      
      // Schemas de Vendas
      Venda: vendasSchema.Venda,
      CreateVendaRequest: vendasSchema.CreateVendaRequest,
      UpdateVendaRequest: vendasSchema.UpdateVendaRequest
    },
    responses: {
      ...commonResponses
    }
  }
};

export default swaggerDocument;