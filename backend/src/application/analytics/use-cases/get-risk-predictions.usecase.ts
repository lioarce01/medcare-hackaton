import { Injectable, Inject } from '@nestjs/common';

export interface RiskPrediction {
  medication_id: string;
  medication_name: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_factors: string[];
  recommendations: string[];
  confidence: number;
}

@Injectable()
export class GetRiskPredictionsUseCase {
  // Inject repositories/services as needed
  constructor(
    // @Inject('AdherenceRepository') private readonly adherenceRepository: AdherenceRepository,
    // @Inject('MedicationRepository') private readonly medicationRepository: MedicationRepository,
  ) { }

  async execute(userId: string): Promise<RiskPrediction[]> {
    // TODO: Replace with real logic. For now, return mock data.
    return [
      {
        medication_id: 'med1',
        medication_name: 'Aspirin',
        risk_level: 'medium',
        risk_factors: ['Missed doses', 'Irregular intake'],
        recommendations: ['Take medication on time', 'Set reminders'],
        confidence: 0.85,
      },
    ];
  }
}
