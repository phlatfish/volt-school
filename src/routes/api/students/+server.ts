import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';

const DISTRICT_CODE = '572394';

export async function GET({ url }: RequestEvent) {
  const districtCode = url.searchParams.get('code');
  
  if (!districtCode || districtCode !== DISTRICT_CODE) {
    return json({ 
      error: 'Unauthorized access. Please provide a valid district code using the "code" parameter.' 
    }, { status: 401 });
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return json({ error: 'Supabase credentials not available' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('students')
      .select('data')
      .eq('id', 'latest')
      .single();
    
    if (error) {
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data.data);
  } catch (err) {
    console.error('Error fetching students:', err);
    return json({ error: 'Failed to fetch students data' }, { status: 500 });
  }
} 