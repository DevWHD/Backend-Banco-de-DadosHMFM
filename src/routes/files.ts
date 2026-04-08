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

    console.log(`[DEBUG] Listed ${files.length} files for folder_id: ${folder_id}`);
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files", details: String(error) });
  }
});

/**
 * @swagger
 * /api/files/debug/storage-check:
 *   get:
 *     summary: Verifica se o Vercel Blob está configurado
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Status da configuração
 */
// GET /api/files/debug/storage-check - Check storage configuration
router.get("/debug/storage-check", (_req: Request, res: Response) => {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const tokenPreview = hasToken ? `${process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10)}...` : "NOT_SET";
  
  res.json({
    blob_configured: hasToken,
    token_preview: tokenPreview,
    message: hasToken ? "✅ Vercel Blob is configured" : "❌ BLOB_READ_WRITE_TOKEN not configured"
  });
});

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Baixa um arquivo
 *     tags: [Files]
 *     description: Faz o download de um arquivo específico
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
 *         description: Arquivo baixado com sucesso
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       302:
 *         description: Redirecionamento para URL do arquivo (Vercel Blob)
 *       404:
 *         description: Arquivo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao baixar arquivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/files/:id/download - Download file (MUST be before /:id route)
router.get("/:id/download", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sql = getDb();

    console.log(`[DEBUG] Download request for file ID: ${id}`);

    const files = await sql`SELECT * FROM files WHERE id = ${parseInt(Array.isArray(id) ? id[0] : id)}`;

    if (files.length === 0) {
      console.log(`[DEBUG] File not found with ID: ${id}`);
      res.status(404).json({ error: "File not found" });
      return;
    }

    const file = files[0];
    console.log(`[DEBUG] Found file: ${file.name}, blob_url: ${file.blob_url}, size: ${file.size}`);

    // If it's a Vercel Blob URL (starts with https), try to fetch and proxy it
    if (file.blob_url && (file.blob_url.startsWith("https://") || file.blob_url.startsWith("http://"))) {
      console.log(`[DEBUG] Attempting to fetch from: ${file.blob_url}`);
      
      try {
        // Fetch the file from Vercel Blob
        const response = await fetch(file.blob_url);
        
        if (!response.ok) {
          console.error(`[ERROR] Failed to fetch file from blob: ${response.status} ${response.statusText}`);
          res.status(404).json({ error: "File not found in storage", status: response.status });
          return;
        }

        // Set proper headers
        res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
        res.setHeader("Content-Length", file.size);

        console.log(`[DEBUG] Proxying file: ${file.name} (${file.size} bytes)`);
        
        // Pipe the response to the client
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
        
      } catch (fetchError) {
        console.error(`[ERROR] Failed to fetch from blob URL:`, fetchError);
        res.status(502).json({ error: "Failed to retrieve file from storage", details: String(fetchError) });
      }
      return;
    }

    // If it's a local path (fallback URL)
    if (file.blob_url && file.blob_url.startsWith("/uploads/")) {
      console.log(`[DEBUG] Local path detected (fallback): ${file.blob_url}`);
      res.status(404).json({ error: "File stored locally - storage not available", path: file.blob_url });
      return;
    }

    console.log(`[DEBUG] Unrecognized blob_url format: ${file.blob_url}`);
    res.status(404).json({ error: "File storage not properly configured", blob_url: file.blob_url });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file", details: String(error) });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Obtém informações de um arquivo
 *     tags: [Files]
 *     description: Retorna as informações de um arquivo específico
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
 *         description: Informações do arquivo retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: Arquivo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/files/:id - Get file info
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sql = getDb();

    console.log(`[DEBUG] File info request for ID: ${id}`);
    const files = await sql`SELECT * FROM files WHERE id = ${parseInt(Array.isArray(id) ? id[0] : id)}`;

    if (files.length === 0) {
      console.log(`[DEBUG] File not found with ID: ${id}`);
      res.status(404).json({ error: "File not found" });
      return;
    }

    const file = files[0];
    
    // Add debug info
    const fileWithDebug = {
      ...file,
      debug: {
        blob_url_type: file.blob_url?.startsWith("https://") ? "VERCEL_BLOB" : 
                       file.blob_url?.startsWith("/uploads/") ? "LOCAL_FALLBACK" : "UNKNOWN",
        download_url: `/api/files/${file.id}/download`,
        direct_blob_url: file.blob_url
      }
    };

    console.log(`[DEBUG] File info:`, JSON.stringify(fileWithDebug, null, 2));
    res.json(fileWithDebug);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Failed to fetch file", details: String(error) });
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
    const files = await sql`SELECT * FROM files WHERE id = ${parseInt(Array.isArray(id) ? id[0] : id)}`;

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
    await sql`DELETE FROM files WHERE id = ${parseInt(Array.isArray(id) ? id[0] : id)}`;

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
