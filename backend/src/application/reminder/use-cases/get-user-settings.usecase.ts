import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class GetUserSettingsUseCase {
  constructor(private readonly prisma: PrismaService) { }

  async execute(userId: string): Promise<{
    emailEnabled: boolean;
    preferredTimes: string[];
    timezone: string;
    notificationPreferences: any;
  }> {
    const settings = await this.prisma.user_settings.findUnique({
      where: { user_id: userId },
      select: {
        email_enabled: true,
        preferred_times: true,
        timezone: true,
        notification_preferences: true,
      },
    });

    if (!settings) {
      // Return default settings if none exist
      return {
        emailEnabled: true,
        preferredTimes: ['08:00', '14:00', '20:00'],
        timezone: 'UTC',
        notificationPreferences: {
          email: true,
          sms: false,
          push: false,
          reminder_before: 15,
        },
      };
    }

    // Ensure notification preferences have all required properties
    const notificationPreferences = settings.notification_preferences as any || {};
    const defaultPreferences = {
      email: true,
      sms: false,
      push: false,
      reminder_before: 15,
    };

    return {
      emailEnabled: settings.email_enabled,
      preferredTimes: settings.preferred_times as string[],
      timezone: settings.timezone,
      notificationPreferences: {
        ...defaultPreferences,
        ...notificationPreferences,
      },
    };
  }
}
