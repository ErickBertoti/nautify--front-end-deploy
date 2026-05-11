'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { notificationService } from '@/services';
import { useToast } from '@/components/ui/Toast';

interface UseRealtimeNotificationsOptions {
  userId: string | undefined;
}

export function useRealtimeNotifications({ userId }: UseRealtimeNotificationsOptions) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { info } = useToast();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? 0);
    } catch {
      // silently fail
    }
  }, []);

  // Supabase Realtime subscription + initial fetch
  useEffect(() => {
    // Fetch initial count
    notificationService.getUnreadCount().then((res) => {
      setUnreadCount(res.data?.count ?? 0);
    }).catch(() => {});

    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as { title?: string; message?: string };
          setUnreadCount((prev) => prev + 1);
          info(newNotif.title || newNotif.message || 'Nova notificação');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, info]);

  return { unreadCount, refetchCount: fetchUnreadCount };
}
