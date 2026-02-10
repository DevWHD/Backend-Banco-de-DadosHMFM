import { Router, Request, Response } from "express";
import { getDb } from "../config/database";
import { del } from "@vercel/blob";

const router = Router();

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Lista arquivos de uma pasta
 *     tags: [Files]
 *     description: Retorna todos os arquivos de uma pasta específica
 *     parameters:
 *       - in: query
 *         name: folder_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pasta
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de arquivos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       400:
 *         description: folder_id é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao buscar arquivos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/files?folder_id=X - Get files from a folder
router.get("/", async (req: Request, res: Response) => {
  try {
    const { folder_id } = req.query;

    if (!folder_id) {
      res.status(400).json({ error: "folder_id is required" });
      return;
    }

    const sql = getDb();
    const files = await sql`
      SELECT * FROM files WHERE folder_id = ${parseInt(folder_id as string)} ORDER BY name ASC
    `;

    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Deleta um arquivo
 *     tags: [Files]
 *     description: Deleta um arquivo do banco de dados e do Vercel Blob (se configurado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do arquivo
 *         example: 1
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Arquivo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao deletar arquivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE /api/files/:id - Delete file
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sql = getDb();

    // Get file to retrieve blob URL before deleting
    const files = await sql`SELECT * FROM files WHERE id = ${parseInt(id)}`;

    if (files.length === 0) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Delete from Vercel Blob (if BLOB_READ_WRITE_TOKEN is set)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(files[0].blob_url);
      } catch (e) {
        console.error("Error deleting blob:", e);
      }
    }

    // Delete from database
    await sql`DELETE FROM files WHERE id = ${parseInt(id)}`;

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
