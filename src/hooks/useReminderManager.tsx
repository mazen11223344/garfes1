
// src/hooks/useReminderManager.tsx
"use client";

import type { Reminder } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseReminderManagerProps {
  onReminderDue: (reminder: Reminder) => void;
}

export function useReminderManager({ onReminderDue }: UseReminderManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { toast } = useToast();

  const addReminder = useCallback((text: string, time: Date) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      text,
      time,
      notified: false,
    };
    setReminders((prevReminders) => [...prevReminders, newReminder].sort((a,b) => a.time.getTime() - b.time.getTime()));
    toast({
      title: "تم ضبط التذكير",
      description: `سأذكرك: "${text}" في ${time.toLocaleTimeString('ar-EG')}`,
    });
  }, [toast]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      for (const reminder of reminders) {
        if (!reminder.notified && reminder.time <= now) {
          setReminders((prev) =>
            prev.map((r) =>
              r.id === reminder.id ? { ...r, notified: true } : r
            )
          );
          
          onReminderDue(reminder);
          
          toast({
            title: "تذكير!",
            description: reminder.text,
            duration: 10000, 
          });
        }
      }
      setReminders(prev => prev.filter(r => !r.notified || (now.getTime() - r.time.getTime()) < 24 * 60 * 60 * 1000));

    }, 1000); 

    return () => clearInterval(interval);
  }, [reminders, toast, onReminderDue]);

  return { reminders, addReminder };
}
