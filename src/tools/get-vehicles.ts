import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { createClient } from '@supabase/supabase-js';

export const schema = {
  // Basic filters
  make: z.string().optional().describe("Filter by vehicle make/brand (e.g., 'Ferrari', 'Porsche')"),
  model: z.string().optional().describe("Filter by vehicle model (e.g., '911', 'F8')"),
  year: z.number().optional().describe("Filter by specific year"),
  minYear: z.number().optional().describe("Filter by minimum year"),
  maxYear: z.number().optional().describe("Filter by maximum year"),
  
  // Price filters
  minPrice: z.number().optional().describe("Filter by minimum price"),
  maxPrice: z.number().optional().describe("Filter by maximum price"),
  hasPrice: z.boolean().optional().describe("Filter vehicles that have a price (true) or don't have a price (false/null)"),
  
  // Color filters
  colour: z.string().optional().describe("Filter by exterior color"),
  interiorColor: z.string().optional().describe("Filter by interior color"),
  
  // Condition & Type
  newUsed: z.string().optional().describe("Filter by condition: 'New' or 'Used'"),
  certified: z.string().optional().describe("Filter by certified status"),
  
  // Mechanical specs
  transmission: z.string().optional().describe("Filter by transmission type"),
  drivetrain: z.string().optional().describe("Filter by drivetrain description"),
  fuel: z.string().optional().describe("Filter by fuel type"),
  
  // Mileage
  maxOdometer: z.number().optional().describe("Filter by maximum odometer/mileage"),
  
  // Other
  body: z.string().optional().describe("Filter by body type (e.g., 'Coupe', 'Sedan')"),
  dealerName: z.string().optional().describe("Filter by dealer name"),
};

export const metadata: ToolMetadata = {
  name: "get-vehicles",
  description: "Get all vehicles from SportcarsLux database with optional filters",
  annotations: {
    title: "Get Vehicles",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getVehicles({
  make,
  model,
  year,
  minYear,
  maxYear,
  minPrice,
  maxPrice,
  hasPrice,
  colour,
  interiorColor,
  newUsed,
  certified,
  transmission,
  drivetrain,
  fuel,
  maxOdometer,
  body,
  dealerName,
}: InferSchema<typeof schema>) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return `Error: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file`;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Start building the query - exclude soft deleted vehicles
    let query = supabase.from('vehicles').select('*').is('deleted_at', null);

    // Apply filters dynamically
    if (make) {
      query = query.ilike('make', `%${make}%`);
    }
    
    if (model) {
      query = query.ilike('model', `%${model}%`);
    }
    
    if (year) {
      query = query.eq('year', year);
    }
    
    if (minYear) {
      query = query.gte('year', minYear);
    }
    
    if (maxYear) {
      query = query.lte('year', maxYear);
    }
    
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }
    
    if (hasPrice !== undefined) {
      if (hasPrice) {
        query = query.not('price', 'is', null);
      } else {
        query = query.is('price', null);
      }
    }
    
    if (colour) {
      query = query.ilike('colour', `%${colour}%`);
    }
    
    if (interiorColor) {
      query = query.ilike('interior_color', `%${interiorColor}%`);
    }
    
    if (newUsed) {
      query = query.ilike('new_used', `%${newUsed}%`);
    }
    
    if (certified) {
      query = query.ilike('certified', `%${certified}%`);
    }
    
    if (transmission) {
      query = query.ilike('transmission', `%${transmission}%`);
    }
    
    if (drivetrain) {
      query = query.ilike('drivetrain_desc', `%${drivetrain}%`);
    }
    
    if (fuel) {
      query = query.ilike('fuel', `%${fuel}%`);
    }
    
    if (maxOdometer !== undefined) {
      query = query.lte('odometer', maxOdometer);
    }
    
    if (body) {
      query = query.ilike('body', `%${body}%`);
    }
    
    if (dealerName) {
      query = query.ilike('dealer_name', `%${dealerName}%`);
    }

    const { data, error } = await query;

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
