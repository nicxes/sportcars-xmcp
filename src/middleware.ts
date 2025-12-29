import { apiKeyAuthMiddleware, type Middleware } from "xmcp";

const middleware: Middleware = apiKeyAuthMiddleware({
  headerName: "x-api-key",
  validateApiKey: async (apiKey) => {
    return apiKey === process.env.API_KEY;
  },
});

export default middleware;