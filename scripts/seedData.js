import { supabase } from '../src/config/supabase';

const seedData = async () => {
  try {
    // First, create a test user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456',
      options: {
        data: {
          name: 'Test User',
          full_name: 'Test User'
        }
      }
    });

    if (signUpError) throw signUpError;
    
    const userId = authData.user.id;

    // Create medications
    const medications = [
      {
        user_id: userId,
        name: 'Aspirin',
        dosage: { amount: 100, unit: 'mg' },
        frequency: { times_per_day: 2, specific_days: ['monday', 'wednesday', 'friday'] },
        scheduled_times: ['09:00', '21:00'],
        instructions: 'Take with food',
        medication_type: 'prescription',
        active: true
      },
      {
        user_id: userId,
        name: 'Vitamin D',
        dosage: { amount: 1000, unit: 'IU' },
        frequency: { times_per_day: 1, specific_days: [] },
        scheduled_times: ['08:00'],
        instructions: 'Take with breakfast',
        medication_type: 'vitamin',
        active: true
      },
      {
        user_id: userId,
        name: 'Ibuprofen',
        dosage: { amount: 400, unit: 'mg' },
        frequency: { times_per_day: 3, specific_days: [] },
        scheduled_times: ['08:00', '14:00', '20:00'],
        instructions: 'Take with food or milk',
        medication_type: 'over-the-counter',
        active: false
      }
    ];

    const { error: medicationsError } = await supabase
      .from('medications')
      .insert(medications);

    if (medicationsError) throw medicationsError;

    // Create adherence records for the past week
    const adherenceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      medications.forEach(med => {
        med.scheduled_times.forEach(time => {
          adherenceRecords.push({
            user_id: userId,
            medication_id: null, // Will be updated after medications are inserted
            scheduled_time: time,
            scheduled_date: dateStr,
            status: Math.random() > 0.2 ? 'taken' : 'missed',
            taken_time: Math.random() > 0.2 ? new Date().toISOString() : null
          });
        });
      });
    }

    const { error: adherenceError } = await supabase
      .from('adherence')
      .insert(adherenceRecords);

    if (adherenceError) throw adherenceError;

    console.log('Test data uploaded successfully!');
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: test123456');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedData();