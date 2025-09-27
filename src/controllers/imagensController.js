import ImagensService from "../services/imagensService.js";
import { sendError, sendResponse } from "../utils/messages.js";
import { ZodError } from 'zod';
import { APIError } from "../utils/wrapException.js";
import path from "path";

class ImagensController {

  static listar = async (req, res) => {
    try {
      const { item_id } = req.query;

      const parametros = {
        item_id: item_id,
      }

      const imagens = await ImagensService.listar(parametros);

      return sendResponse(res, 200, { data: imagens });

    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        return sendError(res, 400, errors);

      } else if (err instanceof APIError) {
        return sendError(res, err.statusCode, err.errors);
      }

      return sendError(res, 500, "Ocorreu um erro interno no servidor!");
    }
  };

  static inserir = async (req, res) => {
    try {
      const { imagens } = req.files;

      if (!imagens || imagens.length === 0) {
        return sendError(res, 400, ['Nenhuma imagem enviada.']);
      }

      const parametros = {
        item_id: req.body.item_id,
        descricao: req.body.descricao || null
      };

      const imagensSalvas = await ImagensService.create(parametros, imagens);

      return sendResponse(res, 201, { data: imagensSalvas });

    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        return sendError(res, 400, errors);

      } else if (err instanceof APIError) {
        return sendError(res, err.statusCode, err.errors);
      }

      return sendError(res, 500, "Ocorreu um erro interno no servidor!");
    }
  };

  static buscar_imagem = async (req, res) => {
    try {
      const { itemId, filename } = req.params;
      const filePath = path.join(process.cwd(), './uploads/imagens', itemId, filename);

      res.sendFile(filePath, (err) => {
        if (err) {
          return sendError(res, 404, ['Imagem não foi encontrada']);
        }
      });

    } catch (err) {
      return sendError(res, 500, "Ocorreu um erro interno no servidor!");
    }
  };

  static deletar = async (req, res) => {
    try {
      const id = { id: parseInt(req.params.id) };

      const imagemDeletada = await ImagensService.deletar(id);

      return sendResponse(res, 200, { data: imagemDeletada });

    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        return sendError(res, 400, errors);

      } else if (err instanceof APIError) {
        return sendError(res, err.statusCode, err.errors);
      }

      return sendError(res, 500, "Ocorreu um erro interno no servidor!");
    }
  };
}

export default ImagensController;