import { Controller, Get, Post, Body } from '@nestjs/common';
import { GenerateDailyAdherenceUseCase } from 'src/application/scheduler/generate-daily-adherence.usecase';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly generateDailyAdherenceUseCase: GenerateDailyAdherenceUseCase,
  ) { }

  @Get('test/generate-adherence') // Endpoint for manual adherence generation
  async testGenerateAdherence() {
    try {
      const result = await this.generateDailyAdherenceUseCase.execute();
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('test/generate-adherence-for-medication')
  async generateAdherenceForMedication(@Body() body: { medicationId: string }) {
    try {
      // This would need a new use case, but for now let's just call the general one
      const result = await this.generateDailyAdherenceUseCase.execute();
      return {
        success: true,
        result,
        message: 'Adherence generation completed for all medications',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
