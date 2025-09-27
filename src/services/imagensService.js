import ImagensRepository from "../repository/imagensRepository.js";
import ImagensSchema from "../schemas/imagensSchema.js";
import fs from "fs";
import path from "path";
import { APIError } from "../utils/wrapException.js";
import { v4 as uuidv4 } from 'uuid';

class ImagensService {

    static async listar(parametros) {
        const parametrosValidados = ImagensSchema.itemIdSchema.parse(parametros);
       
        const imagens = await ImagensRepository.buscarImagensPorItem(parametrosValidados.item_id);
        
        if (imagens.length === 0) {
            return [];
        }

        return imagens;
    }

    static async create(parametros, imagens) {
        const dadosValidados = ImagensSchema.createSchema.parse(parametros);

        const item = await ImagensRepository.itemExists(dadosValidados.item_id);

        if (!item) {
            throw new APIError([{ 
                path: "item_id", 
                message: "O item informado não existe." 
            }], 404);
        }

        let imagensSalvas = [];

        const saveImages = (files, itemId) => {
            const folderPath = path.join(process.cwd(), `./uploads/imagens/${itemId}`);

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            files.forEach((file) => {
                // Gerar nome único para evitar conflitos
                const fileExtension = path.extname(file.originalname);
                const uniqueName = `${uuidv4()}${fileExtension}`;
                const filePath = path.join(folderPath, uniqueName);

                fs.writeFileSync(filePath, file.buffer);

                imagensSalvas.push({
                    url: `${itemId}/${uniqueName}`,
                    item_id: itemId,
                    descricao: dadosValidados.descricao
                });
            });
        };

        saveImages(imagens, item.id);

        const count = await ImagensRepository.create(imagensSalvas);
        
        return {
            message: `${count > 1 ? count + " imagens foram salvas." : count + " imagem foi salva."}`,
            imagens: imagensSalvas.map(img => {
                const [itemId, filename] = img.url.split('/');
                return {
                    url: `/api/imagens/${itemId}/${filename}`,
                    descricao: img.descricao,
                    item_id: img.item_id
                };
            })
        };
    }

    static async deletar(id) {
        const idValidado = ImagensSchema.idSchema.parse(id);

        const imagemExists = await ImagensRepository.buscarPorId(idValidado.id);

        if (!imagemExists) {
            throw new APIError([{ 
                path: "id", 
                message: "Nenhuma imagem encontrada." 
            }], 404);
        }

        const imagemDeletada = await ImagensRepository.deletarImagem(imagemExists.id);
        const imagensDuplicadas = await ImagensRepository.buscarPorUrl(imagemExists.item_id, imagemExists.url);

        const filePath = path.join(process.cwd(), './uploads/imagens', imagemDeletada.url);

        // Se não há imagens duplicadas, remove o arquivo físico
        if (imagensDuplicadas.length === 0) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Erro ao deletar arquivo físico:', err);
                }
            });
        }

        return imagemDeletada;
    }
}

export default ImagensService;