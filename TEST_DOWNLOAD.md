# Teste de Download de Arquivos

## Passo 1: Verificar Ambiente
Certifique-se de que `BLOB_READ_WRITE_TOKEN` está configurado nas variáveis de ambiente da Vercel:

```bash
# No .env.local ou variáveis de ambiente da Vercel
BLOB_READ_WRITE_TOKEN=sua_token_aqui
```

## Passo 2: Fazer Upload de Arquivo

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "folder_id=1" \
  -F "files=@seu_arquivo.pdf"
```

Resposta esperada:
```json
[{
  "id": 1,
  "name": "seu_arquivo.pdf",
  "folder_id": 1,
  "blob_url": "https://...",
  "size": 12345,
  "mime_type": "application/pdf"
}]
```

**IMPORTANTE:** Copie o `blob_url` da resposta!

## Passo 3: Verificar URL (GET /api/files/{id})

```bash
curl http://localhost:3001/api/files/1
```

Saída mostrará a URL do arquivo. Se `blob_url` começa com `https://`, está configurado corretamente.

## Passo 4: Baixar Arquivo (Opção A - Rota de Download)

```bash
curl -L http://localhost:3001/api/files/1/download -o arquivo_baixado.pdf
```

## Passo 5: Baixar Arquivo (Opção B - URL Direta)

Copie a URL do `blob_url` e acesse diretamente no navegador ou curl:

```bash
curl -L https://seu-blob-url.vercel-storage.com/... -o arquivo_baixado.pdf
```

## Possíveis Erros

| Erro | Causa | Solução |
|------|-------|--------|
| 500 ao fazer upload | `BLOB_READ_WRITE_TOKEN` não configurado | Configure a variável de ambiente |
| 404 ao fazer download | Token expirado ou arquivo deletado | Verifique se arquivo existe com GET /api/files/1 |
| Arquivo vazio | Problema ao transferir | Verifique tamanho com GET /api/files/1 |

## Logs de Debug

Os logs mostram o processo:
```
[DEBUG] Uploading to Vercel Blob: hospital/1/seu_arquivo.pdf
[DEBUG] Vercel Blob URL: https://...
[DEBUG] File saved to database with blob_url: https://...
[DEBUG] Download request for file ID: 1
[DEBUG] Found file: seu_arquivo.pdf, blob_url: https://...
[DEBUG] Redirecting to: https://...
```
