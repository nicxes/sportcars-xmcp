import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { createClient } from '@supabase/supabase-js';

/**
 * SportcarsLux Vehicle Database Tool
 * 
 * Data Source: vAuto.com
 * Update Frequency: Every 2 hours
 * Database: SportcarsLux Supabase instance
 * 
 * This tool provides access to luxury and sports vehicle inventory
 * with real-time pricing and availability information.
 */

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
  
  // Sorting and ordering
  sortBy: z.enum(['updated_at', 'created_at', 'year', 'price', 'odometer']).optional().describe("Sort by field"),
  sortOrder: z.enum(['asc', 'desc']).optional().describe("Sort order: 'asc' for ascending, 'desc' for descending"),
  limit: z.number().optional().describe("Limit number of results returned"),
};

export const metadata: ToolMetadata = {
  name: "get-vehicles",
  description: "Get all vehicles from SportcarsLux database with optional filters. Data source: vAuto.com, updated every 2 hours",
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
  sortBy,
  sortOrder,
  limit,
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

    // Apply sorting
    if (sortBy) {
      const order = sortOrder || 'desc';
      query = query.order(sortBy, { ascending: order === 'asc' });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return `Error fetching vehicles: ${error.message}`;
    }

    if (!data || data.length === 0) {
      return `No vehicles found.`;
    }

    // Formatear la respuesta como texto con todos los campos disponibles
    const vehicleList = data.map((v: any, i: number) => {
      const fields: string[] = [];
      
      // Basic identification
      fields.push(`Vehicle ${i + 1}:`);
      if (v.year || v.make || v.model || v.series) {
        fields.push(`   ${[v.year, v.make, v.model, v.series].filter(Boolean).join(' ')}`);
      }
      if (v.id !== null && v.id !== undefined) fields.push(`   ID: ${v.id}`);
      if (v.vin) fields.push(`   VIN: ${v.vin}`);
      if (v.stock_number) fields.push(`   Stock Number: ${v.stock_number}`);
      if (v.model_code) fields.push(`   Model Code: ${v.model_code}`);
      if (v.series_detail) fields.push(`   Series Detail: ${v.series_detail}`);
      if (v.slug) fields.push(`   Slug: ${v.slug}`);
      
      // Pricing
      if (v.price !== null && v.price !== undefined) fields.push(`   Price: $${v.price.toLocaleString()}`);
      if (v.custom_price !== null && v.custom_price !== undefined) fields.push(`   Custom Price: $${v.custom_price.toLocaleString()}`);
      if (v.msrp !== null && v.msrp !== undefined) fields.push(`   MSRP: $${v.msrp.toLocaleString()}`);
      
      // Physical attributes
      if (v.colour) fields.push(`   Exterior Color: ${v.colour}`);
      if (v.interior_color) fields.push(`   Interior Color: ${v.interior_color}`);
      if (v.body) fields.push(`   Body Type: ${v.body}`);
      if (v.door_count !== null && v.door_count !== undefined) fields.push(`   Door Count: ${v.door_count}`);
      
      // Condition & Type
      if (v.new_used) fields.push(`   Condition: ${v.new_used}`);
      if (v.certified) fields.push(`   Certified: ${v.certified}`);
      if (v.age !== null && v.age !== undefined) fields.push(`   Age: ${v.age} days`);
      
      // Mechanical specs
      if (v.odometer !== null && v.odometer !== undefined) fields.push(`   Mileage: ${v.odometer.toLocaleString()} miles`);
      if (v.transmission) fields.push(`   Transmission: ${v.transmission}`);
      if (v.drivetrain_desc) fields.push(`   Drivetrain: ${v.drivetrain_desc}`);
      if (v.fuel) fields.push(`   Fuel Type: ${v.fuel}`);
      if (v.engine) fields.push(`   Engine: ${v.engine}`);
      if (v.engine_cylinder_count !== null && v.engine_cylinder_count !== undefined) fields.push(`   Cylinders: ${v.engine_cylinder_count}`);
      if (v.engine_displacement) fields.push(`   Engine Displacement: ${v.engine_displacement}`);
      
      // MPG
      if (v.city_mpg !== null && v.city_mpg !== undefined) fields.push(`   City MPG: ${v.city_mpg}`);
      if (v.highway_mpg !== null && v.highway_mpg !== undefined) fields.push(`   Highway MPG: ${v.highway_mpg}`);
      
      // Descriptions
      if (v.description) fields.push(`   Description: ${v.description.substring(0, 200)}${v.description.length > 200 ? '...' : ''}`);
      if (v.ai_description) fields.push(`   AI Description: ${v.ai_description.substring(0, 200)}${v.ai_description.length > 200 ? '...' : ''}`);
      
      // Dealer info
      if (v.dealer_name) fields.push(`   Dealer: ${v.dealer_name}`);
      if (v.dealer_id) fields.push(`   Dealer ID: ${v.dealer_id}`);
      
      // Photos & Images
      if (v.photo_count !== null && v.photo_count !== undefined) fields.push(`   Photo Count: ${v.photo_count}`);
      if (v.photos_last_modified_date) fields.push(`   Photos Last Modified: ${v.photos_last_modified_date}`);
      if (v.photos && Array.isArray(v.photos) && v.photos.length > 0) fields.push(`   Photos: ${v.photos.length} photo(s) available`);
      if (v.images_hd && Array.isArray(v.images_hd) && v.images_hd.length > 0) fields.push(`   HD Images: ${v.images_hd.length} image(s) available`);
      if (v.sticker_url) fields.push(`   Sticker URL: ${v.sticker_url}`);
      
      // Features
      if (v.features && Array.isArray(v.features) && v.features.length > 0) fields.push(`   Features: ${v.features.length} feature(s) listed`);
      
      // Other
      if (v.tags) fields.push(`   Tags: ${v.tags}`);
      if (v.inventory_date) fields.push(`   Inventory Date: ${v.inventory_date}`);
      
      // Timestamps
      if (v.created_at) fields.push(`   Created: ${new Date(v.created_at).toLocaleString()}`);
      if (v.updated_at) fields.push(`   Updated: ${new Date(v.updated_at).toLocaleString()}`);
      
      return fields.join('\n');
    }).join('\n\n');

    return `Found ${data.length} vehicle(s):\n\n${vehicleList}\n\n---\n📊 Data Source: vAuto.com | 🔄 Updated every 2 hours | 🏢 SportcarsLux Database`;
    
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}
