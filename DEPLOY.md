# 🚀 Instruções de Deploy no Vercel

## ✅ Correções Aplicadas

Agora o projeto está pronto para o Vercel com:

1. ✅ **vercel.json** - Configuração serverless
2. ✅ **api/index.ts** - Handler do Vercel (sem app.listen)
3. ✅ **Swagger dinâmico** - URL ajusta automaticamente para produção
4. ✅ **Build otimizado** - TypeScript compilado corretamente

## 📋 Como Fazer o Deploy

### Opção 1: Via Dashboard Vercel (Mais Fácil)

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as **Environment Variables**:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_9Zuheo8UAkFV@ep-floral-king-ai9tjmy4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   FRONTEND_URL=http://26.94.10.153:3000
   NODE_ENV=production
   API_URL=https://seu-projeto.vercel.app
   ```
5. Clique em "Deploy"

### Opção 2: Via CLI

```bash
# Instale o CLI do Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

Durante o deploy, configure as variáveis de ambiente quando solicitado.

## 🔧 Configurar Variáveis de Ambiente no Vercel

Após fazer o deploy:

1. Acesse o dashboard do seu projeto no Vercel
2. Clique em "Settings"
3. Clique em "Environment Variables"
4. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | Sua connection string do Neon PostgreSQL |
| `FRONTEND_URL` | URL do seu frontend (para CORS) |
| `NODE_ENV` | `production` |
| `BLOB_READ_WRITE_TOKEN` | (Opcional) Token do Vercel Blob |

5. Clique em "Redeploy" para aplicar as variáveis

## 🌐 Acessar a Documentação

Após o deploy, acesse:
- **API**: https://seu-projeto.vercel.app
- **Swagger Docs**: https://seu-projeto.vercel.app/api-docs

## ⚠️ Importante

1. **Não commite o arquivo .env** - Ele está no .gitignore
2. **Atualize a variável API_URL** - Use a URL real do seu projeto depois do deploy
3. **Configure CORS** - Adicione a URL de produção do frontend na variável `FRONTEND_URL`
4. **Banco de Dados** - Certifique-se de que as tabelas foram criadas no PostgreSQL

## 🐛 Solução de Problemas

### Se o /api-docs aparecer em branco:

**SOLUÇÃO APLICADA**: Agora usamos uma spec JSON estática em vez de JSDoc parsing, que é muito mais confiável no Vercel.

1. **Certifique-se de que o projeto foi re-deployado** após as últimas alterações
2. **Limpe o cache do Vercel**:
   - No dashboard: Settings → General → "Clear Build Cache & Redeploy"
3. **Verifique as variáveis de ambiente no Vercel**:
   ```
   DATABASE_URL=sua-connection-string
   NODE_ENV=production
   FRONTEND_URL=sua-url-do-frontend
   ```
4. **Teste localmente primeiro**:
   ```bash
   npm run build
   npm run dev
   # Acesse: http://localhost:3001/api-docs
   ```
5. **Verifique os logs no Vercel**:
   - Dashboard → Deployments → Clique no deploy → Functions → Logs

### Se aparecer erro 500:

1. Verifique se a `DATABASE_URL` está correta
2. Teste a conexão localmente com `npm run dev`
3. Verifique os logs no Vercel

## 📝 Testando Localmente

Antes de fazer o deploy, teste localmente:

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção local
npm start
```

Acesse: http://localhost:3001/api-docs

## 🎯 Próximos Passos

1. Faça o deploy no Vercel
2. Anote a URL gerada (ex: https://seu-projeto.vercel.app)
3. Atualize a variável `API_URL` no Vercel com essa URL
4. Configure o CORS com a URL do frontend
5. Teste todos os endpoints no Swagger
