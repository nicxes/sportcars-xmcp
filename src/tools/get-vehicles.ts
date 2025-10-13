import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { createClient } from '@supabase/supabase-js';

export const schema = {
  limit: z.number().optional().describe("Maximum number of vehicles to return"),
  offset: z.number().optional().describe("Number of vehicles to skip"),
};

export const metadata: ToolMetadata = {
  name: "get-vehicles",
  description: "Get all vehicles from SportcarsLux database",
  annotations: {
    title: "Get Vehicles",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getVehicles({ 
  limit = 5, 
  offset = 0 
}: InferSchema<typeof schema>) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return `Error: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file`;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      return `Error fetching vehicles: ${error.message}`;
    }

    if (!data || data.length === 0) {
      return `No vehicles found.`;
    }

    // Formatear la respuesta como texto
    const vehicleList = data.map((v: any, i: number) => 
      `${i + 1}. ${v.year || ''} ${v.make || ''} ${v.model || ''} ${v.series || ''}\n` +
      `   - Price: $${v.price || 'N/A'}\n` +
      `   - Mileage: ${v.odometer?.toLocaleString() || 'N/A'} miles\n` +
      `   - Color: ${v.colour || 'N/A'}\n` +
      `   - VIN: ${v.vin || 'N/A'}`
    ).join('\n\n');

    return `Found ${data.length} vehicle(s):\n\n${vehicleList}`;
    
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}
