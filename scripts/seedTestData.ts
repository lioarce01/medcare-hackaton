import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedTestData() {
  try {
    console.log('Starting data seeding...');

    // Create test user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456',
      options: {
        data: {
          name: 'Test User',
          full_name: 'Test User'
        }
      }
    });

    if (signUpError || !user) {
      throw signUpError || new Error('Failed to create user');
    }

    console.log('Created test user:', user.id);

    // Create medications
    const medications = [
      {
        user_id: user.id,
        name: 'Aspirin',
        dosage: { amount: 100, unit: 'mg' },
        frequency: { times_per_day: 2, specific_days: ['monday', 'wednesday', 'friday'] },
        scheduled_times: ['09:00', '21:00'],
        instructions: 'Take with food',
        medication_type: 'prescription',
        active: true
      },
      {
        user_id: user.id,
        name: 'Vitamin D',
        dosage: { amount: 1000, unit: 'IU' },
        frequency: { times_per_day: 1, specific_days: [] },
        scheduled_times: ['08:00'],
        instructions: 'Take with breakfast',
        medication_type: 'vitamin',
        active: true
      },
      {
        user_id: user.id,
        name: 'Ibuprofen',
        dosage: { amount: 400, unit: 'mg' },
        frequency: { times_per_day: 3, specific_days: [] },
        scheduled_times: ['08:00', '14:00', '20:00'],
        instructions: 'Take with food or milk',
        medication_type: 'over-the-counter',
        active: false
      }
    ];

    const { data: medsData, error: medsError } = await supabase
      .from('medications')
      .insert(medications)
      .select();

    if (medsError) {
      throw medsError;
    }

    console.log('Created medications:', medsData.length);

    // Create adherence records for the past week
    const adherenceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      medsData.forEach(med => {
        med.scheduled_times.forEach(time => {
          // Create a mix of taken, missed, and pending records
          const status = i === 0 ? 'pending' : 
                        Math.random() > 0.2 ? 'taken' : 'missed';

          adherenceRecords.push({
            user_id: user.id,
            medication_id: med.id,
            scheduled_time: time,
            scheduled_date: dateStr,
            status,
            taken_time: status === 'taken' ? new Date().toISOString() : null
          });
        });
      });
    }

    const { error: adherenceError } = await supabase
      .from('adherence')
      .insert(adherenceRecords);

    if (adherenceError) {
      throw adherenceError;
    }

    console.log('Created adherence records:', adherenceRecords.length);
    console.log('\nTest data created successfully!');
    console.log('\nYou can now log in with:');
    console.log('Email: test@example.com');
    console.log('Password: test123456');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedTestData();