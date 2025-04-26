import { writable, derived } from 'svelte/store';
import { uploadData, fetchData, deleteData } from '$lib/services/supabaseClient';
import { browser } from '$app/environment';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  school: 'Hamilton Primary School' | 'Van Holten Primary School';
  busId: string | null;
  address: string;
  guardian: {
    name: string;
    phone: string;
    email: string;
  };
}

const initialStudents: Student[] = [];

const createStudentStore = () => {
  const { subscribe, set, update } = writable<Student[]>(initialStudents);
  let initialized = false;

  if (browser) {
    fetchData('students', initialStudents).then(data => {
      set(data);
      initialized = true;
    }).catch(error => {
      console.error('Error initializing student store:', error);
      initialized = true;
    });
  }

  const unsubscribe = subscribe(students => {
    if (!initialized) return;
    
    if (browser) {
      uploadData('students', students).catch(error => {
        console.error('Error saving student data to Supabase:', error);
      });
    }
  });

  return {
    subscribe,
    add: (student: Omit<Student, 'id'>) => {
      update((students) => {
        const newId = `S${1000 + students.length + 1}`;
        return [...students, { ...student, id: newId }];
      });
    },
    update: (id: string, updatedStudent: Partial<Student>) => {
      update((students) => 
        students.map((student) => 
          student.id === id ? { ...student, ...updatedStudent } : student
        )
      );
    },
    remove: (id: string) => {
      update((students) => students.filter((student) => student.id !== id));
    },
    getByBus: (busId: string) => {
      return derived(
        studentStore, 
        ($students) => $students.filter((student) => student.busId === busId)
      );
    },
    getBySchool: (school: Student['school']) => {
      return derived(
        studentStore, 
        ($students) => $students.filter((student) => student.school === school)
      );
    },
    reset: async () => {
      set(initialStudents);
      
      if (browser) {
        try {
          await deleteData('students');
          await uploadData('students', initialStudents);
        } catch (error) {
          console.error('Error resetting student data:', error);
        }
      }
    }
  };
};

export const studentStore = createStudentStore();