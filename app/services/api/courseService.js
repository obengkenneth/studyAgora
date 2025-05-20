import { supabase } from '../supabase';

export const fetchCourses = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('subject_id', subjectId)
      .is('deleted_at', null) // Only fetch courses that haven't been deleted
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
      .is('deleted_at', null) // Only fetch courses that haven't been deleted
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
    // Set the deleted_at field to the current timestamp instead of hard deleting
    const { error } = await supabase
      .from('courses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', courseId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};
