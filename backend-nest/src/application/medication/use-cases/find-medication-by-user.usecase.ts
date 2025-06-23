import { Inject, Injectable } from '@nestjs/common';
import { Medication } from 'src/domain/medication/entities/medication.entity';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class FindMedicationByUserUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
  ) { }

  async execute(
    userId: string,
    page?: number,
    limit?: number,
    searchTerm?: string,
    filterType?: string
  ): Promise<{
    data: Medication[],
    page: number,
    limit: number,
    total: number
  }> {
    const medications = await this.medicationRepository.findByUser(
      userId,
      page,
      limit,
      searchTerm,
      filterType
    );
    return medications;
  }
}