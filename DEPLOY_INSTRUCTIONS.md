# 📦 Como Fazer Deploy Na Vercel

## 1️⃣ Commit e Push no Git

```bash
cd c:\Users\Admin\Documents\Backend-Banco-de-DadosHMFM

# Ver o status
git status

# Adicionar todas mudanças
git add .

# Fazer commit
git commit -m "fix: download 404 - reorder routes, add debug endpoints, simplify blob redirect"

# Push
git push origin main
```

## 2️⃣ Deploy Automático

Vercel fará deploy automaticamente quando você fazer push.

- Vá para: https://vercel.com/dashboard
- Seu projeto deve estar compilando/deployando
- Espere até ver "✅ Production" em verde

## 3️⃣ Verificar Build Logs

Se houver erro no build:
1. Clique no seu projeto no Vercel Dashboard
2. Deployments
3. Clique no deployment que falhou
4. Veja a aba "Logs"

## 4️⃣ Testar a Solução

Depois do deploy estar pronto (`✅ Production`):

```bash
# Seu site estava em qual URL?
# Exemplo: https://seu-projeto.vercel.app

# 1. Verificar configuração
curl https://seu-projeto.vercel.app/api/files/debug/storage-check

# 2. Se BLOB_READ_WRITE_TOKEN não estiver configurado:
#    Vá para Vercel Dashboard → Settings → Environment Variables
#    Adicione: BLOB_READ_WRITE_TOKEN=sua_token
#    Redeploy em Deployments → [últiimio] → → ⋯ → Redeploy

# 3. Depois do redeploy, limpar arquivos inválidos
curl -X DELETE https://seu-projeto.vercel.app/api/files/debug/cleanup-invalid

# 4. Fazer novo upload e testar
```

## 📝 Expected Output

### Ao verificar storage:
```json
{
  "blob_configured": true,
  "token_preview": "vercel_blob...",
  "message": "✅ Vercel Blob is configured"
}
```

### Ao listar arquivos válidos:
```json
{
  "count": 0,
  "message": "Found 0 files with fallback URLs",
  "files": []
}
```

### Ao fazer novo upload:
```bash
curl -X POST https://seu-projeto.vercel.app/api/upload \
  -F "folder_id=1" \
  -F "files=@seu_arquivo.pdf"
```

Resposta deve ter `blob_url` como `https://seu-site.vercel-storage.com/...`

### Ao fazer download:
```bash
curl -L https://seu-projeto.vercel.app/api/files/1/download -o arquivo.pdf
```

Arquivo deve baixar sem erros!

## 🚨 Se Ainda Não Funcionar

1. ✅ Você fez `git push`?
2. ✅ Deployment verde (✅ Production)?
3. ✅ `BLOB_READ_WRITE_TOKEN` configurado nas env vars?
4. ✅ Executou `/api/files/debug/cleanup-invalid`?
5. ✅ Fez novo upload dos arquivos?
6. ✅ Verificou que `blob_url` começa com `https://`?

Se sim em tudo, compartilhe o output de:
```bash
curl https://seu-projeto.vercel.app/api/files?folder_id=1
curl https://seu-projeto.vercel.app/api/files/1
```

---

**Seu projeto está pronto para deploy! 🚀**
