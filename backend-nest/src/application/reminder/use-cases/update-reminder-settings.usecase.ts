import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UpdateReminderSettingsDto } from 'src/infrastructure/reminder/dtos/update-reminder-settings.dto';

@Injectable()
export class UpdateReminderSettingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, settings: UpdateReminderSettingsDto): Promise<{
    success: boolean;
    message: string;
    data: {
      emailEnabled: boolean;
      preferredTimes: string[];
      timezone: string;
      notificationPreferences: any;
    };
  }> {
    // Update the configuration in the user_settings table
    const data = await this.prisma.user_settings.upsert({
      where: { user_id: userId },
      update: {
        email_enabled: settings.emailEnabled,
        preferred_times: settings.preferredTimes,
        timezone: settings.timezone || 'UTC',
        notification_preferences: settings.notificationPreferences,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        email_enabled: settings.emailEnabled ?? true,
        preferred_times: settings.preferredTimes || ['08:00', '14:00', '20:00'],
        timezone: settings.timezone || 'UTC',
        notification_preferences: settings.notificationPreferences || {
          email: true,
          push: false,
          sms: false,
        },
      },
      select: {
        email_enabled: true,
        preferred_times: true,
        timezone: true,
        notification_preferences: true,
      },
    });

    return {
      success: true,
      message: 'Settings updated successfully',
      data: {
        emailEnabled: data.email_enabled,
        preferredTimes: data.preferred_times as string[],
        timezone: data.timezone,
        notificationPreferences: data.notification_preferences,
      },
    };
  }
}
