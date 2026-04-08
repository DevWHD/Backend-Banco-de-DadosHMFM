# Debugging Download 404

## Passo 1: Verificar Configuração do Vercel Blob

```bash
# Check if BLOB_READ_WRITE_TOKEN is configured
curl http://localhost:3001/api/files/debug/storage-check
```

**Resposta esperada se configurado:**
```json
{
  "blob_configured": true,
  "token_preview": "vercel_blob...",
  "message": "✅ Vercel Blob is configured"
}
```

## Passo 2: Listar Arquivos de uma Pasta

```bash
# List all files in folder_id=1
curl http://localhost:3001/api/files?folder_id=1
```

**Procure pela resposta com:**
- `blob_url` começando com `https://` ✅ (armazenado no Vercel Blob)
- `blob_url` começando com `/uploads/` ⚠️ (fallback local - não funcionará)

## Passo 3: Obter Info Completa do Arquivo

```bash
# Get full file info including debug details
curl http://localhost:3001/api/files/1
```

**Procure por:**
```json
{
  "id": 1,
  "name": "seu_arquivo.pdf",
  "blob_url": "https://...",
  "size": 12345,
  "debug": {
    "blob_url_type": "VERCEL_BLOB",  // ✅ se for isso
    "download_url": "/api/files/1/download",
    "direct_blob_url": "https://..."
  }
}
```

## Passo 4: Testar Download

```bash
# Opção A: Via endpoint /download (proxy)
curl -L http://localhost:3001/api/files/1/download -o arquivo.pdf

# Opção B: Fazer download direto da URL (se quiser testar)
curl -L "https://sua-blob-url.vercel-storage.com/..." -o arquivo.pdf
```

## Possíveis Problemas e Soluções

### Caso 1: `blob_url_type` = `LOCAL_FALLBACK`
**Problema:** Arquivo foi feito upload quando `BLOB_READ_WRITE_TOKEN` NÃO estava configurado
**Solução:** 
1. Configure `BLOB_READ_WRITE_TOKEN` 
2. Delete os arquivos com upload antigos
3. Faça novo upload

### Caso 2: `blob_url_type` = `VERCEL_BLOB` mas 404 no download
**Problema:** URL salva mas arquivo não existe no Vercel Blob (token pode ter expirado)
**Solução:**
1. Verifique se o token é válido na Vercel console
2. Copie a URL do `direct_blob_url` e tente acessar diretamente no navegador
3. Se der 404, refaça o upload

### Caso 3: BLOB_READ_WRITE_TOKEN não configurado
**Problema:** Variável não está definida
**Solução:** Adicione em `.env.local`:
```
BLOB_READ_WRITE_TOKEN=seu_token_aqui
```

## Logs para Verificar

Se estiver rodando localmente, procure no console por logs como:

```
[DEBUG] Download request for file ID: 1
[DEBUG] Found file: arquivo.pdf, blob_url: https://..., size: 12345
[DEBUG] Attempting to fetch from: https://...
[DEBUG] Proxying file: arquivo.pdf (12345 bytes)
```

Se ver **erro**, procure por:
```
[ERROR] Failed to fetch file from blob: 404
[ERROR] Failed to fetch from blob URL: ...
```

## Solução Rápida

Se nada funcionar, faça isso:

1. Delete TODOS os arquivos antigos da tabela `files`
2. Configure `BLOB_READ_WRITE_TOKEN` corretamente
3. Redeploy na Vercel
4. Faça um novo upload
5. Teste o download

