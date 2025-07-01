import { UpdateMedicationDto } from 'src/interfaces/medication/dtos/update-medication.dto';
import { Medication } from '../entities/medication.entity';
import { CreateMedicationDto } from 'src/interfaces/medication/dtos/create-medication.dto';

export interface MedicationRepository {
  update(userId: string, id: string, medication: UpdateMedicationDto): Promise<Medication>;
  delete(id: string): Promise<{ message: string }>;
  findById(id: string): Promise<Medication | null>;
  findByUser(userId: string, page?: number, limit?: number, searchTerm?: string, filterType?: string): Promise<{
    data: Medication[],
    page: number,
    limit: number,
    total: number
  }>;
  findActiveByUser(userId: string, page?: number, limit?: number): Promise<{
    data: Medication[],
    page: number,
    limit: number,
    total: number
  }>;
  findActiveDailyMedications(): Promise<Medication[]>;
  findByUserNameAndStartDate(userId: string, name: string, startDate: Date): Promise<Medication | null>;
  create(medication: CreateMedicationDto): Promise<Medication>;
}
