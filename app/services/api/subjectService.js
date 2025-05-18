import { supabase } from '../supabase';

export const fetchSubjects = async (curriculumId) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('curriculum_id', curriculumId)
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export const fetchSubjectById = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        curriculums (
          id,
          name
        )
      `)
      .eq('id', subjectId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (subjectId, subjectData) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', subjectId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
