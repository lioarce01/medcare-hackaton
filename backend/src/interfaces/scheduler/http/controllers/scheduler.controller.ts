import { Controller, Get } from '@nestjs/common';
import { GenerateDailyAdherenceUseCase } from 'src/application/scheduler/generate-daily-adherence.usecase';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly generateDailyAdherenceUseCase: GenerateDailyAdherenceUseCase,
  ) {}

  // @Get('test/generate-adherence') // ← Endpoint temporal
  // async testGenerateAdherence() {
  //   try {
  //     const result = await this.generateDailyAdherenceUseCase.execute();
  //     return {
  //       success: true,
  //       result,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }
}
