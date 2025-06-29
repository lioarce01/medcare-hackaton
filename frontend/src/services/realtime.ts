import { supabase } from "../config/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface RealtimeSubscriptionConfig {
  table: string;
  event?: RealtimeEvent | "*";
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribe(config: RealtimeSubscriptionConfig): string {
    const channelId = `${config.table}_${Date.now()}_${Math.random()}`;

    // Create channel
    let channel = supabase.channel(channelId);

    // Subscribe to postgres_changes with filter or not
    channel = channel.on(
      // Cast to any to bypass TS error
      "postgres_changes" as any,
      {
        event: config.event || "*",
        schema: "public",
        table: config.table,
        filter: config.filter,
      },
      (payload) => {
        this.handleRealtimeEvent(payload, config);
      }
    );

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // Successfully subscribed
      } else if (status === "CHANNEL_ERROR") {
        // Error subscribing
      } else if (status === "TIMED_OUT") {
        // Subscription timed out
      }
    });

    this.channels.set(channelId, channel);
    return channelId;
  }

  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  private handleRealtimeEvent(
    payload: any,
    config: RealtimeSubscriptionConfig
  ): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case "INSERT":
        config.onInsert?.(newRecord);
        break;
      case "UPDATE":
        config.onUpdate?.({ new: newRecord, old: oldRecord });
        break;
      case "DELETE":
        config.onDelete?.(oldRecord);
        break;
    }

    config.onChange?.(payload);
  }

  async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }
}

export const realtimeService = new RealtimeService();
