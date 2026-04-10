import { Router, Request, Response } from "express";
import multer from "multer";
import { getDb } from "../config/database";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Faz upload de arquivos
 *     tags: [Upload]
 *     description: Faz upload de um ou múltiplos arquivos para uma pasta específica
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - folder_id
 *               - files
 *             properties:
 *               folder_id:
 *                 type: integer
 *                 description: ID da pasta de destino
 *                 example: 1
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos para upload
 *     responses:
 *       201:
 *         description: Arquivos enviados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       400:
 *         description: folder_id ou arquivos não fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro no upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/upload - Upload files
router.post("/", upload.array("files"), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const folderIdParam = req.body.folder_id;
    
    // Validar folder_id
    if (!folderIdParam) {
      res.status(400).json({ error: "folder_id is required" });
      return;
    }

    const folder_id = parseInt(folderIdParam);
    if (isNaN(folder_id)) {
      res.status(400).json({ error: "folder_id must be a valid integer" });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files provided" });
      return;
    }

    const sql = getDb();
    const uploaded = [];

    for (const file of files) {
      // Store file reference with simple URL
      const blobUrl = `file://${file.originalname}`;
      
      console.log(`[DEBUG] Registering file: ${file.originalname}, size: ${file.size}`);

      // Save record to database
      try {
        const result = await sql`
          INSERT INTO files (name, folder_id, blob_url, size, mime_type)
          VALUES (${file.originalname}, ${folder_id}, ${blobUrl}, ${file.size}, ${file.mimetype})
          RETURNING id, name, folder_id, size, mime_type, created_at, updated_at
        `;
        console.log(`[DEBUG] File registered in database:`, result[0]);
        uploaded.push(result[0]);
      } catch (dbError) {
        console.error(`[ERROR] Failed to save to database:`, dbError);
        res.status(500).json({ 
          error: "Failed to save file to database", 
          details: String(dbError)
        });
        return;
      }
    }

    res.status(201).json(uploaded);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed", details: String(error) });
  }
});

export default router;
