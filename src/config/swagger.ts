import swaggerSpec from "./swagger-spec.json";

// Update server URL based on environment
const spec = {
  ...swaggerSpec,
  servers: [
    {
      url: process.env.API_URL || (process.env.NODE_ENV === "production" 
        ? "https://backend-banco-de-dadoshmfm.vercel.app" 
        : "http://localhost:3001"),
      description: process.env.NODE_ENV === "production" 
        ? "Servidor de Produção" 
        : "Servidor de Desenvolvimento",
    },
  ],
};

export { spec as swaggerSpec };
