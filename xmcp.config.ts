import { type XmcpConfig } from "xmcp"

const config: XmcpConfig = {
  stdio: {
    debug: true, // adds extra logging to the console
  },
  http: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  },
  paths: {
    tools: "./src/tools",
    prompts: "./src/prompts",
    resources: "./src/resources",
  }
}

export default config;
