import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital Document Explorer API",
      version: "1.0.0",
      description: "API REST para gerenciamento de documentos hospitalares da SMS Rio",
      contact: {
        name: "SMS Rio",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de Desenvolvimento",
      },
    ],
    tags: [
      {
        name: "Folders",
        description: "Gerenciamento de pastas",
      },
      {
        name: "Files",
        description: "Gerenciamento de arquivos",
      },
      {
        name: "Upload",
        description: "Upload de arquivos",
      },
    ],
    components: {
      schemas: {
        Folder: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID da pasta",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome da pasta",
              example: "ALMOXERIFADO",
            },
            parent_id: {
              type: "integer",
              nullable: true,
              description: "ID da pasta pai (null se for raiz)",
              example: null,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Data de criação",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Data de atualização",
            },
          },
        },
        File: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID do arquivo",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome do arquivo",
              example: "protocolo.pdf",
            },
            folder_id: {
              type: "integer",
              description: "ID da pasta",
              example: 1,
            },
            blob_url: {
              type: "string",
              description: "URL do arquivo no storage",
              example: "https://example.com/file.pdf",
            },
            size: {
              type: "integer",
              description: "Tamanho em bytes",
              example: 1024,
            },
            mime_type: {
              type: "string",
              description: "Tipo MIME do arquivo",
              example: "application/pdf",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Data de criação",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Data de atualização",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensagem de erro",
              example: "Failed to fetch folders",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
