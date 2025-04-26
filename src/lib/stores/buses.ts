import { writable, derived } from 'svelte/store';
import { uploadData, fetchData, deleteData } from '$lib/services/supabaseClient';
import { browser } from '$app/environment';

export interface Bus {
  id: string;
  number: string;
  capacity: number;
  driver: {
    name: string;
    phone: string;
  };
  route: {
    name: string;
    description: string;
    schools: Array<'Hamilton Primary School' | 'Van Holten Primary School'>;
  };
  status: 'active' | 'inactive' | 'delayed' | 'out-of-service';
}

const initialBuses: Bus[] = [];

const createBusStore = () => {
  const { subscribe, set, update } = writable<Bus[]>(initialBuses);
  let initialized = false;

  if (browser) {
    fetchData('buses', initialBuses).then(data => {
      set(data);
      initialized = true;
    }).catch(error => {
      console.error('Error initializing bus store:', error);
      initialized = true;
    });
  }

  const unsubscribe = subscribe(buses => {
    if (!initialized) return;
    
    if (browser) {
      uploadData('buses', buses).catch(error => {
        console.error('Error saving bus data to Supabase:', error);
      });
    }
  });

  return {
    subscribe,
    add: (bus: Omit<Bus, 'id'>) => {
      update((buses) => {
        const nextBusNumber = buses.length > 0 
          ? Math.max(...buses.map(b => parseInt(b.number))) + 1
          : 101;
        const newId = `B-${nextBusNumber}`;
        return [...buses, { ...bus, id: newId, number: nextBusNumber.toString() }];
      });
    },
    update: (id: string, updatedBus: Partial<Bus>) => {
      update((buses) => 
        buses.map((bus) => 
          bus.id === id ? { ...bus, ...updatedBus } : bus
        )
      );
    },
    updateStatus: (id: string, status: Bus['status']) => {
      update((buses) => 
        buses.map((bus) => 
          bus.id === id ? { ...bus, status } : bus
        )
      );
    },
    remove: (id: string) => {
      update((buses) => buses.filter((bus) => bus.id !== id));
    },
    getBySchool: (school: string) => {
      return derived(
        busStore, 
        ($buses) => $buses.filter((bus) => bus.route.schools.includes(school as any))
      );
    },
    getByStatus: (status: Bus['status']) => {
      return derived(
        busStore, 
        ($buses) => $buses.filter((bus) => bus.status === status)
      );
    },
    reset: async () => {
      set(initialBuses);
      
      if (browser) {
        try {
          await deleteData('buses');
          await uploadData('buses', initialBuses);
        } catch (error) {
          console.error('Error resetting bus data:', error);
        }
      }
    }
  };
};

export const busStore = createBusStore(); 