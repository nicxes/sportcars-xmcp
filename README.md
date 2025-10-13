# SportcarsLux MCP Server

Servidor MCP (Model Context Protocol) para SportcarsLux que permite consultar el inventario de vehículos desde Cursor o cualquier cliente MCP.

## 🚀 Características

- ✅ **get-vehicles**: Obtener vehículos de la base de datos de Supabase
- ✅ **greet**: Saludar usuarios
- ✅ **review-code**: Prompt para revisar código
- ✅ Soporte para STDIO (local) y HTTP (remoto)

## 📋 Requisitos

- Node.js 22+ (recomendado: 22.20.0)
- npm o yarn
- Cuenta de Supabase con credenciales

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd sportcars-xmcp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Compilar el proyecto

```bash
npm run build
```

### 5. Configurar en Cursor

Crear/editar `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sportcars-xmcp": {
      "command": "node",
      "args": [
        "--experimental-fetch",
        "-r", "dotenv/config",
        "/ruta/absoluta/a/sportcars-xmcp/dist/stdio.js"
      ],
      "env": {
        "DOTENV_CONFIG_PATH": "/ruta/absoluta/a/sportcars-xmcp/.env"
      }
    }
  }
}
```

### 6. Reiniciar Cursor

Después de configurar, reinicia Cursor para que cargue el servidor MCP.

## ☁️ Deployment en Vercel (Uso Remoto)

### 1. Preparar el proyecto

El proyecto ya está configurado para Vercel con:
- ✅ `vercel.json` configurado
- ✅ Servidor HTTP habilitado
- ✅ Variables de entorno configuradas

### 2. Instalar Vercel CLI (opcional)

```bash
npm install -g vercel
```

### 3. Configurar variables de entorno en Vercel

En el dashboard de Vercel o via CLI:

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. Desplegar

```bash
vercel deploy --prod
```

O conecta el repositorio desde el dashboard de Vercel.

### 5. Usar el servidor remoto

Una vez desplegado, obtendrás una URL como `https://sportcars-xmcp.vercel.app`

Configura en Cursor con HTTP:

```json
{
  "mcpServers": {
    "sportcars-xmcp-remote": {
      "transport": "http",
      "url": "https://sportcars-xmcp.vercel.app"
    }
  }
}
```

## 🧑‍💻 Uso para Compañeros

### Opción 1: Usar servidor remoto (Recomendado)

1. Obtén la URL del servidor desplegado
2. Configura en tu `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sportcars-xmcp": {
      "transport": "http",
      "url": "https://sportcars-xmcp.vercel.app"
    }
  }
}
```

3. Reinicia Cursor
4. ¡Listo! Ya puedes usar las herramientas MCP

### Opción 2: Instalación local

Sigue los pasos de "Instalación Local" arriba.

## 📝 Herramientas Disponibles

### get-vehicles

Obtiene vehículos de la base de datos.

**Parámetros:**
- `limit` (opcional): Número de vehículos a retornar (default: 5)
- `offset` (opcional): Número de vehículos a saltar (default: 0)

**Ejemplo:**
```
"Dame los primeros 10 vehículos"
```

### greet

Saluda a un usuario por nombre.

**Parámetros:**
- `name`: Nombre del usuario

**Ejemplo:**
```
"Salúdame con mi nombre Nicolas"
```

### review-code

Prompt para revisar código.

**Parámetros:**
- `code`: Código a revisar

## 🔧 Desarrollo

### Agregar nuevas herramientas

1. Crear archivo en `src/tools/nueva-herramienta.ts`
2. Exportar `schema`, `metadata` y función default
3. Compilar: `npm run build`
4. Reiniciar Cursor

Ejemplo:

```typescript
import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";

export const schema = {
  param: z.string().describe("Description"),
};

export const metadata: ToolMetadata = {
  name: "nueva-herramienta",
  description: "Descripción",
  annotations: {
    title: "Nueva Herramienta",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function nuevaHerramienta({ 
  param 
}: InferSchema<typeof schema>) {
  return `Resultado: ${param}`;
}
```

### Probar localmente

```bash
# Modo desarrollo (auto-reload)
npm run dev

# Servidor HTTP
npm run start:http

# Servidor STDIO
npm start
```

## 📚 Recursos

- [XMCP Documentation](https://xmcp.dev/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado de SportcarsLux.
