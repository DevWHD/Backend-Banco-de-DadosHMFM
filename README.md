# Backend API - Hospital Document Explorer

API REST para gerenciamento de documentos hospitalares.

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
   - `DATABASE_URL`: String de conexão do PostgreSQL (Neon)
   - `BLOB_READ_WRITE_TOKEN`: Token do Vercel Blob (opcional)
   - `PORT`: Porta do servidor (padrão: 3001)
   - `FRONTEND_URL`: URL do frontend para CORS (padrão: http://localhost:3000)

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📡 Endpoints

### Folders
- `GET /api/folders` - Lista todas as pastas
- `POST /api/folders` - Cria uma pasta
- `PATCH /api/folders/:id` - Atualiza o nome de uma pasta
- `DELETE /api/folders/:id` - Deleta uma pasta

### Files
- `GET /api/files?folder_id=X` - Lista arquivos de uma pasta
- `DELETE /api/files/:id` - Deleta um arquivo

### Upload
- `POST /api/upload` - Faz upload de arquivos (multipart/form-data)

## 🗄️ Banco de Dados

Execute o script SQL para criar as tabelas:
```bash
psql $DATABASE_URL -f ../scripts/001-create-schema.sql
```

## 🌐 Deploy

### Vercel (Recomendado)
1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça o deploy:
```bash
vercel --prod
```

3. Configure as variáveis de ambiente no dashboard da Vercel:
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN` (opcional)
   - `FRONTEND_URL`
   - `NODE_ENV=production`

4. A documentação estará disponível em: `https://seu-projeto.vercel.app/api-docs`

**Nota**: O projeto já está configurado com:
- `vercel.json` - Configuração serverless
- `api/index.ts` - Handler para Vercel
- Swagger com URL dinâmica

### Railway
```bash
railway up
```

### Render
Conecte o repositório no dashboard do Render e configure as variáveis de ambiente.

### Outras plataformas
Configure as variáveis de ambiente e execute `npm start`.
