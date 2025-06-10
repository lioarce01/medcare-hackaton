import { UpdateMedicationDto } from 'src/interfaces/medication/dtos/update-medication.dto';
import { Medication } from '../entities/medication.entity';
import { CreateMedicationDto } from 'src/interfaces/medication/dtos/create-medication.dto';

export interface MedicationRepository {
  create(medication: CreateMedicationDto): Promise<Medication>;
  update(medication: UpdateMedicationDto): Promise<Medication>;
  delete(id: string): Promise<{ message: string }>;
  findById(id: string): Promise<Medication | null>;
  findByUser(userId: string): Promise<Medication[]>;
  findActiveByUser(userId: string): Promise<Medication[]>;
  findActiveDailyMedications(): Promise<Medication[]>;
}
