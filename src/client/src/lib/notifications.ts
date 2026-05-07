import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { apiRequest } from "./queryClient";
import type { SupplementReminder } from "@shared/schema";

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

export async function initializePushNotifications(): Promise<boolean> {
  if (!isNativePlatform()) {
    console.log("Push notifications only available on native platforms");
    return false;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.log("Push notification permission not granted");
      return false;
    }

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      console.log("Push registration success, token: " + token.value);
      
      try {
        await apiRequest("POST", "/api/notifications/register-token", {
          pushToken: token.value,
          deviceType: getPlatform(),
        });
      } catch (error) {
        console.error("Failed to register push token:", error);
      }
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error.error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push notification received:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.log("Push notification action performed:", notification);
    });

    return true;
  } catch (error) {
    console.error("Error initializing push notifications:", error);
    return false;
  }
}

export async function initializeLocalNotifications(): Promise<boolean> {
  if (!isNativePlatform()) {
    console.log("Local notifications only available on native platforms");
    return false;
  }

  try {
    let permStatus = await LocalNotifications.checkPermissions();

    if (permStatus.display === "prompt") {
      permStatus = await LocalNotifications.requestPermissions();
    }

    if (permStatus.display !== "granted") {
      console.log("Local notification permission not granted");
      return false;
    }

    LocalNotifications.addListener("localNotificationActionPerformed", (notification) => {
      console.log("Local notification action:", notification);
    });

    return true;
  } catch (error) {
    console.error("Error initializing local notifications:", error);
    return false;
  }
}

function generateStableId(reminderId: string, dayIndex?: number): number {
  let hash = 0;
  const str = dayIndex !== undefined ? `${reminderId}-${dayIndex}` : reminderId;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 2147483647;
}

const dayToWeekday: Record<string, number> = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

export async function scheduleSupplementReminders(reminders: SupplementReminder[]): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id })),
      });
    }

    const activeReminders = reminders.filter(r => r.isActive);
    const notifications: any[] = [];
    
    for (const reminder of activeReminders) {
      const [hours, minutes] = reminder.time.split(":").map(Number);
      const notificationBody = reminder.dosage 
        ? `Time to take ${reminder.supplementName} (${reminder.dosage})`
        : `Time to take ${reminder.supplementName}`;

      if (reminder.daysOfWeek && reminder.daysOfWeek.length > 0) {
        for (const day of reminder.daysOfWeek) {
          const weekday = dayToWeekday[day.toLowerCase()];
          if (weekday) {
            notifications.push({
              id: generateStableId(reminder.id, weekday),
              title: "Supplement Reminder",
              body: notificationBody,
              schedule: {
                on: {
                  weekday,
                  hour: hours,
                  minute: minutes,
                },
                repeats: true,
              },
              extra: {
                reminderId: reminder.id,
                supplementName: reminder.supplementName,
                day,
              },
            });
          }
        }
      } else {
        notifications.push({
          id: generateStableId(reminder.id),
          title: "Supplement Reminder",
          body: notificationBody,
          schedule: {
            on: {
              hour: hours,
              minute: minutes,
            },
            repeats: true,
            every: "day" as const,
          },
          extra: {
            reminderId: reminder.id,
            supplementName: reminder.supplementName,
          },
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} supplement notifications`);
    }
  } catch (error) {
    console.error("Error scheduling supplement reminders:", error);
  }
}

export async function cancelAllLocalNotifications(): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id })),
      });
    }
  } catch (error) {
    console.error("Error canceling local notifications:", error);
  }
}

export async function sendTestNotification(): Promise<void> {
  if (!isNativePlatform()) {
    console.log("Test notification: Would fire on native platform");
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 99999,
          title: "Test Notification",
          body: "Your supplement reminders are working correctly!",
          schedule: {
            at: new Date(Date.now() + 3000),
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
  }
}
