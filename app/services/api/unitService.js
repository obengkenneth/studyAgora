import { supabase } from '../supabase';

/**
 * Fetch units for a specific course
 * @param {string} courseId - The ID of the course
 * @param {boolean} showDrafts - If true, will fetch all units including unpublished ones (for facilitators)
 * @returns {Promise<Array>} - The units data array
 */
export const fetchUnitsByCourse = async (courseId, showDrafts = false) => {
  try {
    // Create query builder
    let query = supabase
      .from('units')
      .select('*')
      .eq('course_id', courseId)
      // Only fetch units that haven't been deleted (deleted_at is null)
      .is('deleted_at', null);
    
    // Filter for published units only when showDrafts is false
    if (!showDrafts) {
      query = query.eq('is_published', true);
    }
    
    // Order by position
    query = query.order('order_position', { ascending: true });
    
    // Execute query
    const { data, error } = await query;
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

/**
 * Fetch a specific unit by ID
 * @param {string} unitId - The ID of the unit
 * @returns {Promise<Object>} - The unit data
 */
export const fetchUnitById = async (unitId) => {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .is('deleted_at', null) // Only fetch units that haven't been deleted
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching unit details:', error);
    throw error;
  }
};

/**
 * Create a new unit
 * @param {Object} unitData - The unit data
 * @returns {Promise<Object>} - The created unit data
 */
export const createUnit = async (unitData) => {
  try {
    // Get the current count of units to determine the order_index
    const { data: existingUnits, error: countError } = await supabase
      .from('units')
      .select('id')
      .eq('course_id', unitData.course_id);
      
    if (countError) throw countError;
    
    // Set the order index to be the next one in sequence
    const orderIndex = (existingUnits?.length || 0);
    
    // Create the unit with the order index
    const { data, error } = await supabase
      .from('units')
      .insert([{ ...unitData, order_position: orderIndex }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;
  }
};

/**
 * Update an existing unit
 * @param {string} unitId - The ID of the unit to update
 * @param {Object} unitData - The updated unit data
 * @returns {Promise<Object>} - The updated unit data
 */
export const updateUnit = async (unitId, unitData) => {
  try {
    const { data, error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', unitId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

/**
 * Soft delete a unit by setting the deleted_at timestamp
 * @param {string} unitId - The ID of the unit to mark as deleted
 * @returns {Promise<void>}
 */
export const deleteUnit = async (unitId) => {
  try {
    // Set the deleted_at field to the current timestamp instead of hard deleting
    const { error } = await supabase
      .from('units')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', unitId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};

/**
 * Update the order position of a unit
 * @param {string} unitId - The ID of the unit to update
 * @param {number} newPosition - The new position for the unit
 * @returns {Promise<Object>} - The updated unit data
 */
export const updateUnitPosition = async (unitId, newPosition) => {
  try {
    const { data, error } = await supabase
      .from('units')
      .update({ order_position: newPosition })
      .eq('id', unitId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating unit position:', error);
    throw error;
  }
};

/**
 * Reorder units in a course
 * @param {string} courseId - The ID of the course
 * @param {Array} unitIds - Array of unit IDs in the new order
 * @returns {Promise<Array>} - The updated units data
 */
export const reorderCourseUnits = async (courseId, unitIds) => {
  try {
    // First, get all units to ensure we're only updating units from this course
    const { data: existingUnits, error: fetchError } = await supabase
      .from('units')
      .select('id')
      .eq('course_id', courseId)
      .is('deleted_at', null);
      
    if (fetchError) throw fetchError;
    
    // Create a set of valid unit IDs from this course
    const validUnitIds = new Set(existingUnits.map(unit => unit.id));
    
    // Filter out any invalid unit IDs
    const validOrderedIds = unitIds.filter(id => validUnitIds.has(id));
    
    // Update each unit with its new order_position
    const updatePromises = validOrderedIds.map((id, index) => {
      return supabase
        .from('units')
        .update({ order_position: index })
        .eq('id', id);
    });
    
    // Execute all updates in parallel
    await Promise.all(updatePromises);
    
    // Return the updated units
    const { data: updatedUnits, error: updatedError } = await supabase
      .from('units')
      .select('*')
      .eq('course_id', courseId)
      .is('deleted_at', null)
      .order('order_position', { ascending: true });
      
    if (updatedError) throw updatedError;
    return updatedUnits || [];
  } catch (error) {
    console.error('Error reordering units:', error);
    throw error;
  }
};
