import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

export type StoreType = 'students' | 'buses' | 'incidents';

const supabaseUrl = browser && (import.meta.env.VITE_SUPABASE_URL || '');
const supabaseKey = browser && (import.meta.env.VITE_SUPABASE_ANON_KEY || '');

const supabase = browser ? createClient(supabaseUrl, supabaseKey) : null;

export async function uploadData<T>(type: StoreType, data: T): Promise<void> {
  if (!browser || !supabase) {
    console.error('Supabase client not available');
    return;
  }

  try {

    const { error } = await supabase
      .from(type)
      .upsert({ id: 'latest', data }, { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    console.error(`Error uploading ${type} data to Supabase:`, error);
    throw error;
  }
}

export async function fetchData<T>(type: StoreType, defaultValue: T): Promise<T> {
  if (!browser || !supabase) {
    console.error('Supabase client not available');
    return defaultValue;
  }

  try {
    const { data, error } = await supabase
      .from(type)
      .select('data')
      .eq('id', 'latest')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        console.log(`No ${type} data found in Supabase, using default data`);
        return defaultValue;
      }
      throw error;
    }

    return data.data;
  } catch (error) {
    console.error(`Error fetching ${type} data from Supabase:`, error);
    return defaultValue;
  }
}

export async function deleteData(type: StoreType): Promise<void> {
  if (!browser || !supabase) {
    console.error('Supabase client not available');
    return;
  }

  try {
    const { error } = await supabase
      .from(type)
      .delete()
      .eq('id', 'latest');

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting ${type} data from Supabase:`, error);
    throw error;
  }
} 