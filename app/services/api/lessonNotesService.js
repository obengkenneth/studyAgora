import { supabase } from '../supabase';

/**
 * Fetch all notes for a specific lesson and user
 * @param {string} lessonId - The lesson ID to fetch notes for
 * @param {string} userId - The user ID who owns the notes
 * @returns {Promise<Array>} - List of notes for the lesson
 */
export const fetchLessonNotes = async (lessonId, userId) => {
  try {
    const { data, error } = await supabase
      .from('lesson_notes')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching lesson notes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchLessonNotes:', error);
    throw error;
  }
};

/**
 * Create a new note for a lesson
 * @param {Object} noteData - Note data including content, lesson_id, and user_id
 * @returns {Promise<Object>} - The created note
 */
export const createLessonNote = async (noteData) => {
  try {
    const { data, error } = await supabase
      .from('lesson_notes')
      .insert([noteData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lesson note:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createLessonNote:', error);
    throw error;
  }
};

/**
 * Update an existing lesson note
 * @param {string} noteId - The ID of the note to update
 * @param {Object} updateData - Data to update (e.g., content)
 * @returns {Promise<Object>} - The updated note
 */
export const updateLessonNote = async (noteId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('lesson_notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating lesson note:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateLessonNote:', error);
    throw error;
  }
};

/**
 * Delete a lesson note (soft delete)
 * @param {string} noteId - The ID of the note to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteLessonNote = async (noteId) => {
  try {
    const { error } = await supabase
      .from('lesson_notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', noteId);
    
    if (error) {
      console.error('Error deleting lesson note:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteLessonNote:', error);
    throw error;
  }
};
