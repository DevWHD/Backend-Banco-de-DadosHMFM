import { Router, Request, Response } from "express";
import multer from "multer";
import { put } from "@vercel/blob";
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
    const { folder_id } = req.body;

    if (!folder_id) {
      res.status(400).json({ error: "folder_id is required" });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files provided" });
      return;
    }

    const sql = getDb();
    const uploaded = [];

    for (const file of files) {
      // Upload to Vercel Blob (if BLOB_READ_WRITE_TOKEN is set)
      let blobUrl = "";
      
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`hospital/${folder_id}/${file.originalname}`, file.buffer, {
          access: "public",
        });
        blobUrl = blob.url;
      } else {
        // Fallback: save URL placeholder if no blob storage
        blobUrl = `/uploads/${folder_id}/${file.originalname}`;
      }

      // Save record to database
      const result = await sql`
        INSERT INTO files (name, folder_id, blob_url, size, mime_type)
        VALUES (${file.originalname}, ${parseInt(folder_id)}, ${blobUrl}, ${file.size}, ${file.mimetype})
        RETURNING *
      `;

      uploaded.push(result[0]);
    }

    res.status(201).json(uploaded);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
