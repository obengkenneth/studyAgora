import { supabase } from '../supabase';

export const fetchCurriculums = async () => {
  try {
    const { data, error } = await supabase
      .from('curriculums')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching curriculums:', error);
    throw error;
  }
};

export const fetchCurriculumById = async (curriculumId) => {
  try {
    const { data, error } = await supabase
      .from('curriculums')
      .select('*')
      .eq('id', curriculumId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching curriculum details:', error);
    throw error;
  }
};

export const createCurriculum = async (curriculumData) => {
  try {
    const { data, error } = await supabase
      .from('curriculums')
      .insert([curriculumData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating curriculum:', error);
    throw error;
  }
};

export const updateCurriculum = async (curriculumId, curriculumData) => {
  try {
    const { data, error } = await supabase
      .from('curriculums')
      .update(curriculumData)
      .eq('id', curriculumId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating curriculum:', error);
    throw error;
  }
};

export const deleteCurriculum = async (curriculumId) => {
  try {
    const { error } = await supabase
      .from('curriculums')
      .delete()
      .eq('id', curriculumId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    throw error;
  }
};
