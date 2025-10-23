import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { createClient } from '@supabase/supabase-js';

export const schema = {
  // Identification - at least one required
  id: z.number().optional().describe("Update vehicle by specific ID"),
  vin: z.string().optional().describe("Update vehicle by VIN number"),
  stockNumber: z.string().optional().describe("Update vehicle by stock number"),
  
  // Filters to update multiple vehicles
  make: z.string().optional().describe("Update all vehicles of this make/brand"),
  model: z.string().optional().describe("Update all vehicles of this model"),
  
  // Fields to update
  price: z.number().optional().describe("New price value"),
  customPrice: z.number().optional().describe("New custom price (overrides regular price)"),
  colour: z.string().optional().describe("New exterior color"),
  interiorColor: z.string().optional().describe("New interior color"),
  description: z.string().optional().describe("New description"),
  aiDescription: z.string().optional().describe("New AI-generated description"),
  odometer: z.number().optional().describe("New odometer/mileage value"),
  newUsed: z.string().optional().describe("Update condition: 'New' or 'Used'"),
  certified: z.string().optional().describe("Update certified status"),
  dealerName: z.string().optional().describe("Update dealer name"),
  tags: z.string().optional().describe("Update tags"),
  inventoryDate: z.string().optional().describe("Update inventory date"),
};

export const metadata: ToolMetadata = {
  name: "update-vehicles",
  description: "Update one or multiple vehicles in the SportcarsLux database",
  annotations: {
    title: "Update Vehicles",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

export default async function updateVehicles({
  id,
  vin,
  stockNumber,
  make,
  model,
  price,
  customPrice,
  colour,
  interiorColor,
  description,
  aiDescription,
  odometer,
  newUsed,
  certified,
  dealerName,
  tags,
  inventoryDate,
}: InferSchema<typeof schema>) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return `Error: Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file`;
    }

    // Build the update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    if (price !== undefined) updateData.price = price;
    if (customPrice !== undefined) updateData.custom_price = customPrice;
    if (colour !== undefined) updateData.colour = colour;
    if (interiorColor !== undefined) updateData.interior_color = interiorColor;
    if (description !== undefined) updateData.description = description;
    if (aiDescription !== undefined) updateData.ai_description = aiDescription;
    if (odometer !== undefined) updateData.odometer = odometer;
    if (newUsed !== undefined) updateData.new_used = newUsed;
    if (certified !== undefined) updateData.certified = certified;
    if (dealerName !== undefined) updateData.dealer_name = dealerName;
    if (tags !== undefined) updateData.tags = tags;
    if (inventoryDate !== undefined) updateData.inventory_date = inventoryDate;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 1) {
      return `Error: No fields provided to update. Please specify at least one field to update.`;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build the query to find vehicles to update
    let query = supabase.from('vehicles').select('id, year, make, model, vin').is('deleted_at', null);

    // Apply filters to identify which vehicles to update
    if (id) {
      query = query.eq('id', id);
    } else if (vin) {
      query = query.eq('vin', vin);
    } else if (stockNumber) {
      query = query.eq('stock_number', stockNumber);
    } else if (make || model) {
      if (make) query = query.ilike('make', `%${make}%`);
      if (model) query = query.ilike('model', `%${model}%`);
    } else {
      return `Error: Please specify at least one identifier (id, vin, stockNumber) or filter (make, model) to identify which vehicle(s) to update.`;
    }

    // First, get the vehicles that match the criteria
    const { data: vehiclesToUpdate, error: selectError } = await query;

    if (selectError) {
      return `Error finding vehicles: ${selectError.message}`;
    }

    if (!vehiclesToUpdate || vehiclesToUpdate.length === 0) {
      return `No vehicles found matching the specified criteria.`;
    }

    // Extract IDs of vehicles to update
    const vehicleIds = vehiclesToUpdate.map(v => v.id);

    // Perform the update
    const { data: updatedData, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .in('id', vehicleIds)
      .select('id, year, make, model, vin');

    if (updateError) {
      return `Error updating vehicles: ${updateError.message}`;
    }

    // Format the response
    const updatedFields = Object.keys(updateData)
      .filter(key => key !== 'updated_at')
      .map(key => {
        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${displayKey}: ${updateData[key]}`;
      })
      .join(', ');

    const vehicleList = updatedData?.map((v: any, i: number) => 
      `${i + 1}. ${v.year || ''} ${v.make || ''} ${v.model || ''} (ID: ${v.id}, VIN: ${v.vin || 'N/A'})`
    ).join('\n   ') || '';

    return `Successfully updated ${updatedData?.length || 0} vehicle(s).\n\nUpdated fields: ${updatedFields}\n\nVehicles updated:\n   ${vehicleList}`;
    
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}

