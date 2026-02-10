import { Router, Request, Response } from "express";
import { getDb } from "../config/database";

const router = Router();

/**
 * @swagger
 * /api/folders:
 *   get:
 *     summary: Lista todas as pastas
 *     tags: [Folders]
 *     description: Retorna todas as pastas cadastradas ordenadas por nome
 *     responses:
 *       200:
 *         description: Lista de pastas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Folder'
 *       500:
 *         description: Erro ao buscar pastas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/folders - Get all folders
router.get("/", async (_req: Request, res: Response) => {
  try {
    const sql = getDb();
    const folders = await sql`SELECT * FROM folders ORDER BY name ASC`;
    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

/**
 * @swagger
 * /api/folders:
 *   post:
 *     summary: Cria uma nova pasta
 *     tags: [Folders]
 *     description: Cria uma nova pasta, opcionalmente como subpasta de outra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da pasta
 *                 example: "DOCUMENTOS ADMINISTRATIVOS"
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *                 description: ID da pasta pai (opcional)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pasta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Nome da pasta é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao criar pasta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/folders - Create a new folder
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, parent_id } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Folder name is required" });
      return;
    }

    const sql = getDb();

    const result = parent_id
      ? await sql`INSERT INTO folders (name, parent_id) VALUES (${name.trim()}, ${parent_id}) RETURNING *`
      : await sql`INSERT INTO folders (name, parent_id) VALUES (${name.trim()}, NULL) RETURNING *`;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

/**
 * @swagger
 * /api/folders/{id}:
 *   patch:
 *     summary: Atualiza o nome de uma pasta
 *     tags: [Folders]
 *     description: Atualiza o nome de uma pasta existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pasta
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome da pasta
 *                 example: "ALMOXARIFADO GERAL"
 *     responses:
 *       200:
 *         description: Pasta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Nome da pasta é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pasta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao atualizar pasta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// PATCH /api/folders/:id - Update folder name
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Folder name is required" });
      return;
    }

    const sql = getDb();
    const result = await sql`
      UPDATE folders SET name = ${name.trim()}, updated_at = NOW() 
      WHERE id = ${parseInt(Array.isArray(id) ? id[0] : id)} RETURNING *
    `;

    if (result.length === 0) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ error: "Failed to update folder" });
  }
});

/**
 * @swagger
 * /api/folders/{id}:
 *   delete:
 *     summary: Deleta uma pasta
 *     tags: [Folders]
 *     description: Deleta uma pasta e todos seus arquivos e subpastas (CASCADE)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pasta
 *         example: 1
 *     responses:
 *       200:
 *         description: Pasta deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Pasta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao deletar pasta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE /api/folders/:id - Delete folder
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sql = getDb();

    // Delete the folder (CASCADE will handle children and files)
    const result = await sql`DELETE FROM folders WHERE id = ${parseInt(Array.isArray(id) ? id[0] : id)} RETURNING *`;

    if (result.length === 0) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
});

export default router;
