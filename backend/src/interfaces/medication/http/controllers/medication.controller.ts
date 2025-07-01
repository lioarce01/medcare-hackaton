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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateMedicationWithAdherenceUseCase } from 'src/application/medication/use-cases/create-medication-with-adherence.usecase';
import { DeleteMedicationUseCase } from 'src/application/medication/use-cases/delete-medication.usecase';
import { FindActiveMedicationByUserUseCase } from 'src/application/medication/use-cases/find-active-medication-by-user.usecase';
import { FindMedicationByIdUseCase } from 'src/application/medication/use-cases/find-medication-by-id.usecase';
import { FindMedicationByUserUseCase } from 'src/application/medication/use-cases/find-medication-by-user.usecase';
import { UpdateMedicationUseCase } from 'src/application/medication/use-cases/update-medication.usecase';
import { GetUserId } from 'src/interfaces/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/interfaces/common/guards/jwt-auth.guard';
import { MedicationPresenter } from 'src/domain/medication/presenters/medication.presenter';
import { CreateMedicationDto } from 'src/interfaces/medication/dtos/create-medication.dto';
import { UpdateMedicationDto } from 'src/interfaces/medication/dtos/update-medication.dto';
import { PaginationDto } from 'src/interfaces/common/dto/pagination.dto';

@Controller('medications')
export class MedicationController {
  constructor(
    private readonly createMedicationWithAdherenceUseCase: CreateMedicationWithAdherenceUseCase,
    private readonly updateMedicationUseCase: UpdateMedicationUseCase,
    private readonly deleteMedicationUseCase: DeleteMedicationUseCase,
    private readonly getMedicationByIdUseCase: FindMedicationByIdUseCase,
    private readonly getMedicationsByUserUseCase: FindMedicationByUserUseCase,
    private readonly getActiveMedicationsByUserUseCase: FindActiveMedicationByUserUseCase,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @GetUserId() userId: string,
    @Query() pagination?: PaginationDto,
  ) {
    const { page = 1, limit = 10, searchTerm, filterType } = pagination ?? {}
    const result = await this.getMedicationsByUserUseCase.execute(
      userId,
      page,
      limit,
      searchTerm,
      filterType
    );
    return {
      data: MedicationPresenter.toHttpList(result.data),
      page: result.page,
      limit: result.limit,
      total: result.total
    }
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActive(
    @GetUserId() userId: string,
    @Query() pagination?: PaginationDto
  ) {
    console.log('getActive called with userId:', userId, 'pagination:', pagination);

    const { page = 1, limit = 10 } = pagination ?? {}
    const result =
      await this.getActiveMedicationsByUserUseCase.execute(userId, page, limit);
    return {
      data: MedicationPresenter.toHttpList(result.data),
      page: result.page,
      limit: result.limit,
      total: result.total
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(
    @Param('id') id: string
  ) {
    const medication = await this.getMedicationByIdUseCase.execute(id);
    return MedicationPresenter.toHttp(medication);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @GetUserId() userId: string,
    @Body() medication: CreateMedicationDto,
  ) {
    console.log('=== BACKEND: Received medication creation request ===');
    console.log('userId:', userId);
    console.log('medication data:', JSON.stringify(medication, null, 2));

    const created = await this.createMedicationWithAdherenceUseCase.execute({
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
    const updated = await this.updateMedicationUseCase.execute(userId, id, medication)

    if (!updated) {
      throw new NotFoundException('Medication not found');
    }

    return MedicationPresenter.toHttp(updated);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @GetUserId() userId: string
  ) {
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
