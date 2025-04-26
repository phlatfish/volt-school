import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const DISTRICT_CODE = '572394';

export function GET({ url }: RequestEvent) {
  const districtCode = url.searchParams.get('code');
  
  if (!districtCode || districtCode !== DISTRICT_CODE) {
    return json({ 
      error: 'Unauthorized access. Please provide a valid district code using the "code" parameter.' 
    }, { status: 401 });
  }
  
  const baseUrl = url.origin;
  const authParam = `?code=${DISTRICT_CODE}`;
  
  return json({
    message: 'Voltschool API',
    version: '1.0.0',
    endpoints: {
      students: `${baseUrl}/api/students${authParam}`,
      buses: `${baseUrl}/api/buses${authParam}`,
      incidents: `${baseUrl}/api/incidents${authParam}`
    },
    note: 'All API requests require the district code parameter, e.g., "?code=572394"'
  });
} 