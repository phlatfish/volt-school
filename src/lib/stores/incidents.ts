import { writable, derived } from 'svelte/store';
import { busStore } from './buses';
import { uploadData, fetchData, deleteData } from '$lib/services/supabaseClient';
import { browser } from '$app/environment';

export type IncidentType = 
  | 'road-crash' 
  | 'road-closure' 
  | 'bus-breakdown' 
  | 'traffic' 
  | 'weather';

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  reportedAt: string;
  estimatedDelay: number;
  affectedBuses: string[];
  status: 'active' | 'resolved';
  resolvedAt?: string;
  location?: string;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

const initialIncidents: Incident[] = [];

const createIncidentStore = () => {
  const { subscribe, set, update } = writable<Incident[]>(initialIncidents);
  let initialized = false;

  if (browser) {
    fetchData('incidents', initialIncidents).then(data => {
      set(data);
      initialized = true;
    }).catch(error => {
      console.error('Error initializing incident store:', error);
      initialized = true;
    });
  }

  const unsubscribe = subscribe(incidents => {
    if (!initialized) return;
    
    if (browser) {
      uploadData('incidents', incidents).catch(error => {
        console.error('Error saving incident data to Supabase:', error);
      });
    }
  });

  return {
    subscribe,
    add: (incident: Omit<Incident, 'id'>) => {
      update((incidents) => {
        const newId = `I-${1000 + incidents.length + 1}`;
        const newIncident = { ...incident, id: newId };
        
        incident.affectedBuses.forEach(busId => {
          busStore.updateStatus(busId, 'delayed');
        });
        
        return [...incidents, newIncident];
      });
    },
    update: (id: string, updatedIncident: Partial<Incident>) => {
      update((incidents) => 
        incidents.map((incident) => 
          incident.id === id ? { ...incident, ...updatedIncident } : incident
        )
      );
    },
    resolve: (id: string) => {
      update((incidents) => {
        const incident = incidents.find(i => i.id === id);
        if (incident) {
          incident.affectedBuses.forEach(busId => {
            busStore.updateStatus(busId, 'active');
          });
        }
        
        return incidents.map((incident) => 
          incident.id === id 
            ? { ...incident, status: 'resolved', resolvedAt: new Date().toISOString() } 
            : incident
        );
      });
    },
    remove: (id: string) => {
      update((incidents) => incidents.filter((incident) => incident.id !== id));
    },
    getActive: () => {
      return derived(
        incidentStore, 
        ($incidents) => $incidents.filter((incident) => incident.status === 'active')
      );
    },
    getByBus: (busId: string) => {
      return derived(
        incidentStore, 
        ($incidents) => $incidents.filter((incident) => 
          incident.affectedBuses.includes(busId) && incident.status === 'active'
        )
      );
    },
    getByType: (type: IncidentType) => {
      return derived(
        incidentStore, 
        ($incidents) => $incidents.filter((incident) => incident.type === type)
      );
    },
    formatReportedAt: (isoString: string) => {
      return formatDateTime(new Date(isoString));
    },
    reset: async () => {
      set(initialIncidents);
      
      if (browser) {
        try {
          await deleteData('incidents');
          await uploadData('incidents', initialIncidents);
        } catch (error) {
          console.error('Error resetting incident data:', error);
        }
      }
    }
  };
};

export const incidentStore = createIncidentStore();