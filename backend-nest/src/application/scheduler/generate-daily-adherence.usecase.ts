import { Inject, Injectable } from '@nestjs/common';
import { AdherenceRepository } from 'src/domain/adherence/repositories/adherence.repository';
import { AdherenceGenerationService } from 'src/domain/adherence/services/adherence-generation.service';
import { MedicationRepository } from 'src/domain/medication/repositories/medication.repository';

@Injectable()
export class GenerateDailyAdherenceUseCase {
  constructor(
    @Inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @Inject('AdherenceRepository')
    private readonly adherenceRepository: AdherenceRepository,
    @Inject('AdherenceGenerationService')
    private readonly adherenceGenerationService: AdherenceGenerationService,
  ) {}

  async execute(): Promise<{ created: number }> {
    // 1. Obtener todas las medicaciones activas con frequency.daily (sin specific_days)
    const medications =
      await this.medicationRepository.findActiveDailyMedications();

    let createdCount = 0;

    // 2. Por cada medicación generar adherencias
    for (const medication of medications) {
      // Aquí asumimos que podes pasar el timezone o tomar UTC
      const userTimezone = medication.user?.settings?.timezone || 'UTC';

      // Generar adherencias con tu service
      const adherenceRecords =
        this.adherenceGenerationService.generateAdherenceRecords(
          medication,
          userTimezone,
        );

      // 3. Filtrar adherencias que ya existen para evitar duplicados
      for (const adherence of adherenceRecords) {
        const exists = await this.adherenceRepository.exists(
          adherence.user_id,
          adherence.medication_id,
          adherence.scheduled_date,
          adherence.scheduled_time,
        );

        if (!exists) {
          await this.adherenceRepository.create(adherence);
          createdCount++;
        }
      }
    }

    return { created: createdCount };
  }
}
