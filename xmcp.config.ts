import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  stdio: true,
  http: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  paths: {
    tools: "./src/tools",
    prompts: "./src/prompts",
    resources: "./src/resources",
  }
};

export default config;
