import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const userId = '2482b26b-bdae-43ae-b7af-09a732eb6bd7';

async function main() {
  // 1. Create Medications
  const medicationsData = [
    {
      id: '825c1f66-537b-4dfd-8860-29e88e238f06',
      name: 'Lisinopril 10mg',
      dosage: { amount: 10, unit: 'mg' },
      instructions: 'Take with or without food.',
    },
    {
      id: 'b0c0c02d-6709-4786-8d9e-c9c7db53d162',
      name: 'Metformin 500mg',
      dosage: { amount: 500, unit: 'mg' },
      instructions: 'Take with breakfast.',
    },
    {
      id: 'c1e2d3f4-5678-4abc-9def-123456789abc',
      name: 'Atorvastatin 20mg',
      dosage: { amount: 20, unit: 'mg' },
      instructions: 'Take in the evening.',
    },
  ];

  const meds: any[] = [];
  for (const med of medicationsData) {
    const created = await prisma.medications.upsert({
      where: { id: med.id },
      update: {},
      create: {
        id: med.id,
        user_id: userId,
        name: med.name,
        dosage: med.dosage,
        frequency: { times_per_day: 2, specific_days: [] },
        scheduled_times: ['08:00', '20:00'],
        instructions: med.instructions,
        start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        active: true,
        medication_type: 'prescription',
      },
    });
    meds.push(created);
  }

  // 2. Create Adherence and Reminders for the past 15 days and next 30 days
  const times = ['08:00', '20:00'];
  const statusOptions = ['taken', 'missed', 'skipped'];
  for (const med of meds) {
    // Past 15 days
    for (let day = -15; day < 0; day++) {
      for (const time of times) {
        const dt = new Date();
        dt.setDate(dt.getDate() + day);
        const [h, m] = time.split(':');
        dt.setHours(Number(h), Number(m), 0, 0);
        // Cycle through statuses for variety
        const status = statusOptions[(day + 15) % statusOptions.length];
        const adherence = await prisma.adherence.create({
          data: {
            user_id: userId,
            medication_id: med.id,
            scheduled_datetime: new Date(dt),
            status,
            created_at: new Date(),
            updated_at: new Date(),
            reminder_sent: false,
          },
        });
        await prisma.reminders.create({
          data: {
            user_id: userId,
            medication_id: med.id,
            adherence_id: adherence.id,
            scheduled_datetime: new Date(dt),
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    }
    // Next 30 days
    for (let day = 0; day < 30; day++) {
      for (const time of times) {
        const dt = new Date();
        dt.setDate(dt.getDate() + day);
        const [h, m] = time.split(':');
        dt.setHours(Number(h), Number(m), 0, 0);
        const adherence = await prisma.adherence.create({
          data: {
            user_id: userId,
            medication_id: med.id,
            scheduled_datetime: new Date(dt),
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
            reminder_sent: false,
          },
        });
        await prisma.reminders.create({
          data: {
            user_id: userId,
            medication_id: med.id,
            adherence_id: adherence.id,
            scheduled_datetime: new Date(dt),
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect();
  });