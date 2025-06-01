import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
}

// Create a Supabase client with the service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_ID = '75def9ba-a40e-4dec-92f1-6d90d7260841';

async function seedUserData() {
  try {
    console.log('Starting data seeding for user:', USER_ID);

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', USER_ID)
      .single();

    if (userError || !user) {
      throw new Error(`User ${USER_ID} not found`);
    }

    // Create medications
    const medications = [
      {
        user_id: USER_ID,
        name: 'Lisinopril',
        dosage: { amount: 10, unit: 'mg' },
        frequency: { times_per_day: 1, specific_days: [] },
        scheduled_times: ['08:00'],
        instructions: 'Take in the morning with water',
        medication_type: 'prescription',
        active: true,
        side_effects_to_watch: ['dizziness', 'cough', 'headache']
      },
      {
        user_id: USER_ID,
        name: 'Metformin',
        dosage: { amount: 500, unit: 'mg' },
        frequency: { times_per_day: 2, specific_days: [] },
        scheduled_times: ['09:00', '21:00'],
        instructions: 'Take with meals',
        medication_type: 'prescription',
        active: true,
        side_effects_to_watch: ['nausea', 'diarrhea']
      },
      {
        user_id: USER_ID,
        name: 'Vitamin D3',
        dosage: { amount: 2000, unit: 'IU' },
        frequency: { times_per_day: 1, specific_days: [] },
        scheduled_times: ['12:00'],
        instructions: 'Take with lunch',
        medication_type: 'vitamin',
        active: true
      },
      {
        user_id: USER_ID,
        name: 'Omega-3',
        dosage: { amount: 1000, unit: 'mg' },
        frequency: { times_per_day: 1, specific_days: ['monday', 'wednesday', 'friday'] },
        scheduled_times: ['13:00'],
        instructions: 'Take with food',
        medication_type: 'supplement',
        active: true
      },
      {
        user_id: USER_ID,
        name: 'Ibuprofen',
        dosage: { amount: 400, unit: 'mg' },
        frequency: { times_per_day: 3, specific_days: [] },
        scheduled_times: ['08:00', '14:00', '20:00'],
        instructions: 'Take with food as needed for pain',
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
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      medsData.forEach(med => {
        // Skip inactive medications
        if (!med.active) return;

        // Skip if it's a specific day medication and today is not one of those days
        if (med.frequency.specific_days?.length > 0) {
          if (!med.frequency.specific_days.includes(dayName)) {
            return;
          }
        }

        med.scheduled_times.forEach(time => {
          // Create a realistic mix of adherence patterns
          let status;
          let takenTime = null;

          if (i === 0) {
            // Today's doses are pending
            status = 'pending';
          } else {
            // Past doses have varying adherence
            const adherenceRate = Math.random();
            if (adherenceRate > 0.85) {
              status = 'taken';
              // Create a realistic taken time within 30 minutes of scheduled time
              const [hours, minutes] = time.split(':').map(Number);
              const scheduledDate = new Date(date);
              scheduledDate.setHours(hours, minutes);
              const delay = Math.floor(Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1);
              scheduledDate.setMinutes(scheduledDate.getMinutes() + delay);
              takenTime = scheduledDate.toISOString();
            } else if (adherenceRate > 0.70) {
              status = 'missed';
            } else {
              status = 'skipped';
            }
          }

          adherenceRecords.push({
            user_id: USER_ID,
            medication_id: med.id,
            scheduled_time: time,
            scheduled_date: dateStr,
            status,
            taken_time: takenTime,
            side_effects_reported: status === 'taken' && Math.random() > 0.9 ? 
              med.side_effects_to_watch?.slice(0, 1) : 
              null
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
    console.log('\nTest data created successfully for user:', USER_ID);

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedUserData();