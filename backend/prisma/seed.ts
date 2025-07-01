import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const userId = '2482b26b-bdae-43ae-b7af-09a732eb6bd7';

async function main() {
  // 1. Create Medications
  const med1 = await prisma.medications.upsert({
    where: { id: '825c1f66-537b-4dfd-8860-29e88e238f06' },
    update: {},
    create: {
      id: '825c1f66-537b-4dfd-8860-29e88e238f06',
      user_id: userId,
      name: 'Lisinopril 10mg',
      dosage: { amount: 10, unit: 'mg' },
      frequency: { times_per_day: 2, specific_days: [] },
      scheduled_times: ['08:00', '20:00'],
      instructions: 'Take with or without food.',
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      active: true,
      medication_type: 'prescription',
    },
  });

  const med2 = await prisma.medications.upsert({
    where: { id: 'b0c0c02d-6709-4786-8d9e-c9c7db53d162' },
    update: {},
    create: {
      id: 'b0c0c02d-6709-4786-8d9e-c9c7db53d162',
      user_id: userId,
      name: 'Metformin 500mg',
      dosage: { amount: 500, unit: 'mg' },
      frequency: { times_per_day: 2, specific_days: [] },
      scheduled_times: ['08:00', '20:00'],
      instructions: 'Take with breakfast.',
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      active: true,
      medication_type: 'prescription',
    },
  });

  // 2. Create Adherence and Reminders for the last 7 days, some in the future
  const meds = [med1, med2];
  const times = ['08:00', '20:00'];
  for (let day = -2; day <= 5; day++) { // 2 days in the past, 5 in the future
    for (const med of meds) {
      for (const time of times) {
        const dt = new Date();
        dt.setDate(dt.getDate() + day);
        const [h, m] = time.split(':');
        dt.setHours(Number(h), Number(m), 0, 0);

        const adherence = await prisma.adherence.create({
          data: {
            user_id: userId,
            medication_id: med.id,
            scheduled_datetime: dt,
            status: day < 0 ? 'taken' : (day === 0 ? 'pending' : 'pending'),
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
            scheduled_datetime: dt,
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
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });