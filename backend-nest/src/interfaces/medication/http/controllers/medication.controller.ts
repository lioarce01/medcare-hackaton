import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateMedicationUseCase } from 'src/application/medication/use-cases/create-medication.usecase';
import { CreateMedicationWithAdherenceUseCase } from 'src/application/medication/use-cases/create-medication-with-adherence.usecase';
import { DeleteMedicationUseCase } from 'src/application/medication/use-cases/delete-medication.usecase';
import { FindActiveMedicationByUserUseCase } from 'src/application/medication/use-cases/find-active-medication-by-user.usecase';
import { FindMedicationByIdUseCase } from 'src/application/medication/use-cases/find-medication-by-id.usecase';
import { FindMedicationByUserUseCase } from 'src/application/medication/use-cases/find-medication-by-user.usecase';
import { UpdateMedicationUseCase } from 'src/application/medication/use-cases/update-medication.usecase';
import { GetUserId } from 'src/auth/get-user-id.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MedicationPresenter } from 'src/domain/medication/presenters/medication.presenter';
import { CreateMedicationDto } from 'src/infrastructure/medication/dtos/create-medication.dto';
import { UpdateMedicationDto } from 'src/infrastructure/medication/dtos/update-medication.dto';

@Controller('medications')
export class MedicationController {
  constructor(
    private readonly createMedicationUseCase: CreateMedicationUseCase,
    private readonly createMedicationWithAdherenceUseCase: CreateMedicationWithAdherenceUseCase,
    private readonly updateMedicationUseCase: UpdateMedicationUseCase,
    private readonly deleteMedicationUseCase: DeleteMedicationUseCase,
    private readonly getMedicationByIdUseCase: FindMedicationByIdUseCase,
    private readonly getMedicationsByUserUseCase: FindMedicationByUserUseCase,
    private readonly getActiveMedicationsByUserUseCase: FindActiveMedicationByUserUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@GetUserId() userId: string) {
    const medications = await this.getMedicationsByUserUseCase.execute(userId);
    return MedicationPresenter.toHttpList(medications);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActive(@GetUserId() userId: string) {
    const medications =
      await this.getActiveMedicationsByUserUseCase.execute(userId);
    return MedicationPresenter.toHttpList(medications);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: string) {
    const medication = await this.getMedicationByIdUseCase.execute(id);
    return MedicationPresenter.toHttp(medication);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() medication: CreateMedicationDto,
    @GetUserId() userId: string,
  ) {
    const created = await this.createMedicationWithAdherenceUseCase.execute({
      ...medication,
      user_id: userId,
    });
    return MedicationPresenter.toHttp(created);
  }

  @Post('simple')
  @UseGuards(JwtAuthGuard)
  async createSimple(
    @Body() medication: CreateMedicationDto,
    @GetUserId() userId: string,
  ) {
    const created = await this.createMedicationUseCase.execute({
      ...medication,
      user_id: userId,
    });
    return MedicationPresenter.toHttp(created);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @GetUserId() userId: string,
    @Body() medication: UpdateMedicationDto,
  ) {
    const updated = await this.updateMedicationUseCase.execute({
      ...medication,
      id,
    });

    if (!updated) {
      throw new NotFoundException('Medication not found');
    }

    if (medication.user_id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this medication',
      );
    }

    return MedicationPresenter.toHttp(updated);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @GetUserId() userId: string) {
    const medication = await this.getMedicationByIdUseCase.execute(id);

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    if (medication.user_id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this medication',
      );
    }

    await this.deleteMedicationUseCase.execute(id);

    return { message: 'Medication deleted successfully' };
  }
}
