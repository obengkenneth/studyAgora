import { supabase } from '../supabase';

export const fetchCourses = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const fetchCourseById = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        subjects (
          id, 
          name,
          curriculum_id,
          curriculums (
            id,
            name
          )
        )
      `)
      .eq('id', courseId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};
