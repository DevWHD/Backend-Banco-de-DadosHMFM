# Guia de Troubleshooting - Download 404 na Vercel

## 🔴 O Problema

Você está recebendo erro 404 ao tentar fazer download de arquivos, mesmo que o upload tenha "funcionado".

## ✅ A Solução em 3 Passos

### Passo 1: Verificar Configuração do Vercel Blob

```bash
# Acesse o endpoint de verificação
curl https://seu-site.vercel.app/api/files/debug/storage-check
```

**Se retornar:**
```json
{
  "blob_configured": false,
  "message": "❌ BLOB_READ_WRITE_TOKEN not configured"
}
```

**Ação necessária:**
1. Vá para Vercel Dashboard → seu projeto
2. Settings → Environment Variables
3. Adicione: `BLOB_READ_WRITE_TOKEN=sua_token_aqui`
4. Redeploy o projeto

### Passo 2: Verificar Quais Arquivos Têm URLs Inválidas

```bash
# Listar arquivos com fallback local (não funcionam no Vercel)
curl https://seu-site.vercel.app/api/files/debug/invalid-files
```

**Se retornar arquivos com `blob_url` começando com `/uploads/`:**

Esses arquivos foram feitos upload SEM Vercel Blob configurado. Eles não funcionarão nunca.

### Passo 3: Limpar Arquivos Inválidos e Refazer Upload

```bash
# Deletar todos os arquivos com URLs inválidas
curl -X DELETE https://seu-site.vercel.app/api/files/debug/cleanup-invalid
```

**Depois:**
1. Certifique-se `BLOB_READ_WRITE_TOKEN` está configurado
2. Faça novo upload dos arquivos
3. Teste o download

## 📊 Verificação Final

Depois de fazer novo upload, verifique:

```bash
# Listar arquivos da pasta
curl https://seu-site.vercel.app/api/files?folder_id=1

# Verificar arquivo específico
curl https://seu-site.vercel.app/api/files/1
```

**Procure por:**
- `blob_url` começando com `https://...vercel-storage.com/...` ✅ (correto)
- **Não** `/uploads/...` ❌ (fallback local, não funciona)

## 🚨 Checklist de Verificação

- [ ] `BLOB_READ_WRITE_TOKEN` está configurado nas env vars da Vercel
- [ ] Executei `/api/files/debug/cleanup-invalid` para remover arquivos inválidos
- [ ] Fiz novo upload dos arquivos
- [ ] Verifiquei que `blob_url` começa com `https://`
- [ ] Tentei fazer download novamente

## 🔧 Se Ainda Não Funcionar

Execute esses comandos de debug:

```bash
# 1. Verificar token
curl https://seu-site.vercel.app/api/files/debug/storage-check

# 2. Listar todos os arquivos inválidos
curl https://seu-site.vercel.app/api/files/debug/invalid-files

# 3. Verificar arquivo específico com ID=1
curl https://seu-site.vercel.app/api/files/1
```

**Compartilhe o output** desses comandos se o problema persistir.

## 💡 Causa Raiz

O problema ocorre porque:

1. **Antes:** Você fez upload de arquivos **sem** `BLOB_READ_WRITE_TOKEN`
2. O sistema usou fallback URL: `/uploads/...`
3. **Agora:** Você configurou o token, mas esses arquivos antigos ainda têm URLs inválidas
4. **Solução:** Limpar os arquivos antigos e refazer upload com o token configurado

---

**Próximos passos:**
1. Configure `BLOB_READ_WRITE_TOKEN` na Vercel
2. Redeploy
3. Execute `/api/files/debug/cleanup-invalid`
4. Faça novo upload
5. Teste download
