import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SubscriptionGuard } from '../../../subscription/http/guards/subscription.guard';
import { GetUserId } from 'src/auth/get-user-id.decorator';
import { CreateReminderUseCase } from 'src/application/reminder/use-cases/create-reminder.usecase';
import { GetUpcomingRemindersUseCase } from 'src/application/reminder/use-cases/get-upcoming-reminders.usecase';
import { GetAllRemindersUseCase } from 'src/application/reminder/use-cases/get-all-reminders.usecase';
import { SendReminderManuallyUseCase } from 'src/application/reminder/use-cases/send-reminder-manually.usecase';
import { DeleteReminderUseCase } from 'src/application/reminder/use-cases/delete-reminder.usecase';
import { UpdateReminderSettingsUseCase } from 'src/application/reminder/use-cases/update-reminder-settings.usecase';
import { GetUserSettingsUseCase } from 'src/application/reminder/use-cases/get-user-settings.usecase';
import { CreateReminderDto } from 'src/infrastructure/reminder/dtos/create-reminder.dto';
import { UpdateReminderSettingsDto } from 'src/infrastructure/reminder/dtos/update-reminder-settings.dto';
import { ReminderPresenter } from 'src/domain/reminder/presenters/reminder.presenter';

@Controller('reminders')
export class ReminderController {
  constructor(
    private readonly createReminderUseCase: CreateReminderUseCase,
    private readonly getUpcomingRemindersUseCase: GetUpcomingRemindersUseCase,
    private readonly getAllRemindersUseCase: GetAllRemindersUseCase,
    private readonly sendReminderManuallyUseCase: SendReminderManuallyUseCase,
    private readonly deleteReminderUseCase: DeleteReminderUseCase,
    private readonly updateReminderSettingsUseCase: UpdateReminderSettingsUseCase,
    private readonly getUserSettingsUseCase: GetUserSettingsUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllReminders(
    @GetUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const reminders = await this.getAllRemindersUseCase.execute(
      userId,
      startDate,
      endDate,
    );
    return ReminderPresenter.toHttpList(reminders);
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getUpcomingReminders(
    @GetUserId() userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const reminders = await this.getUpcomingRemindersUseCase.execute(
      userId,
      limitNumber,
    );
    return ReminderPresenter.toHttpList(reminders);
  }

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async createReminder(
    @Body() reminder: CreateReminderDto,
    @GetUserId() userId: string,
  ) {
    const created = await this.createReminderUseCase.execute({
      ...reminder,
      user_id: userId,
    });
    return ReminderPresenter.toHttp(created);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async sendReminderManually(
    @Param('id') id: string,
    @GetUserId() userId: string,
  ) {
    return this.sendReminderManuallyUseCase.execute(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReminder(@Param('id') id: string, @GetUserId() userId: string) {
    return this.deleteReminderUseCase.execute(id, userId);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getUserSettings(@GetUserId() userId: string) {
    return this.getUserSettingsUseCase.execute(userId);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async updateReminderSettings(
    @Body() settings: UpdateReminderSettingsDto,
    @GetUserId() userId: string,
  ) {
    return this.updateReminderSettingsUseCase.execute(userId, settings);
  }
}
