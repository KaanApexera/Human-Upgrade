import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  Plus, 
  Clock, 
  Pill, 
  Trash2, 
  Pencil,
  Smartphone,
  BellRing,
  BellOff,
  Sun,
  Moon,
  Coffee,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { SupplementReminder, UserNotificationSettings } from "@shared/schema";

const reminderFormSchema = z.object({
  supplementName: z.string().min(1, "Supplement name is required"),
  dosage: z.string().optional(),
  timing: z.enum(["morning", "afternoon", "evening", "bedtime", "with_meals"]),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  daysOfWeek: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

const timingOptions = [
  { value: "morning", label: "Morning", icon: Sun },
  { value: "afternoon", label: "Afternoon", icon: Coffee },
  { value: "evening", label: "Evening", icon: Moon },
  { value: "bedtime", label: "Bedtime", icon: Moon },
  { value: "with_meals", label: "With Meals", icon: Utensils },
];

const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const defaultFormValues: ReminderFormValues = {
  supplementName: "",
  dosage: "",
  timing: "morning",
  time: "08:00",
  daysOfWeek: [],
  notes: "",
};

export default function Reminders() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<SupplementReminder | null>(null);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: defaultFormValues,
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery<SupplementReminder[]>({
    queryKey: ["/api/reminders/supplements"],
  });

  const { data: notificationSettings } = useQuery<UserNotificationSettings>({
    queryKey: ["/api/notifications/settings"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      await apiRequest("POST", "/api/reminders/supplements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/supplements"] });
      toast({
        title: "Reminder created",
        description: "Your supplement reminder has been scheduled.",
      });
      form.reset(defaultFormValues);
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to create reminder",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReminderFormValues> }) => {
      await apiRequest("PATCH", `/api/reminders/supplements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/supplements"] });
      toast({
        title: "Reminder updated",
        description: "Your reminder has been updated.",
      });
      form.reset(defaultFormValues);
      setDialogOpen(false);
      setEditingReminder(null);
    },
    onError: () => {
      toast({
        title: "Failed to update reminder",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/reminders/supplements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/supplements"] });
      toast({
        title: "Reminder deleted",
        description: "Your reminder has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete reminder",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/reminders/supplements/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/supplements"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserNotificationSettings>) => {
      await apiRequest("PATCH", "/api/notifications/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const handleEdit = (reminder: SupplementReminder) => {
    setEditingReminder(reminder);
    form.reset({
      supplementName: reminder.supplementName,
      dosage: reminder.dosage || "",
      timing: reminder.timing as ReminderFormValues["timing"],
      time: reminder.time,
      daysOfWeek: reminder.daysOfWeek || [],
      notes: reminder.notes || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: ReminderFormValues) => {
    if (editingReminder) {
      updateReminderMutation.mutate({
        id: editingReminder.id,
        data,
      });
    } else {
      createReminderMutation.mutate(data);
    }
  };

  const toggleDay = (day: string) => {
    const currentDays = form.getValues("daysOfWeek") || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    form.setValue("daysOfWeek", newDays);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimingIcon = (timing: string) => {
    const option = timingOptions.find(o => o.value === timing);
    return option?.icon || Clock;
  };

  useEffect(() => {
    if (!dialogOpen) {
      setEditingReminder(null);
      form.reset(defaultFormValues);
    }
  }, [dialogOpen, form]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Supplement Reminders
          </h1>
          <p className="text-muted-foreground mt-1">
            Set up notifications to never miss your supplements
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-reminder">
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {editingReminder ? "Edit Reminder" : "New Supplement Reminder"}
                  </DialogTitle>
                  <DialogDescription>
                    Schedule a notification to take your supplements
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="supplementName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplement Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Vitamin D3"
                            {...field}
                            data-testid="input-supplement-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2000 IU"
                            {...field}
                            data-testid="input-dosage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timing</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-timing">
                                <SelectValue placeholder="Select timing" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              data-testid="input-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="daysOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat on (leave empty for daily)</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              size="sm"
                              variant={(field.value || []).includes(day.value) ? "default" : "outline"}
                              onClick={() => toggleDay(day.value)}
                              data-testid={`button-day-${day.value}`}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                        <FormDescription>
                          Select specific days or leave empty for daily reminders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Take with food"
                            {...field}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createReminderMutation.isPending || updateReminderMutation.isPending}
                    data-testid="button-save-reminder"
                  >
                    {editingReminder ? "Update" : "Create"} Reminder
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control how you receive supplement reminders on your mobile device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4" />
                  <Label>Push Notifications</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your phone
                </p>
              </div>
              <Switch
                checked={notificationSettings?.pushEnabled ?? true}
                onCheckedChange={(checked) => updateSettingsMutation.mutate({ pushEnabled: checked })}
                data-testid="switch-push-enabled"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  <Label>Supplement Reminders</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when it's time to take supplements
                </p>
              </div>
              <Switch
                checked={notificationSettings?.supplementRemindersEnabled ?? true}
                onCheckedChange={(checked) => updateSettingsMutation.mutate({ supplementRemindersEnabled: checked })}
                data-testid="switch-supplement-reminders"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <Label>Protocol Updates</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified about changes to your health protocols
                </p>
              </div>
              <Switch
                checked={notificationSettings?.protocolUpdatesEnabled ?? true}
                onCheckedChange={(checked) => updateSettingsMutation.mutate({ protocolUpdatesEnabled: checked })}
                data-testid="switch-protocol-updates"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Your Reminders
            </CardTitle>
            <CardDescription>
              {reminders?.length 
                ? `You have ${reminders.length} active reminder${reminders.length > 1 ? 's' : ''}`
                : 'No reminders set up yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading reminders...</div>
            ) : !reminders?.length ? (
              <div className="text-center py-8">
                <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No reminders yet</p>
                <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-reminder">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Reminder
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const TimingIcon = getTimingIcon(reminder.timing);
                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${
                        reminder.isActive ? "bg-card" : "bg-muted/50 opacity-60"
                      }`}
                      data-testid={`reminder-item-${reminder.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <TimingIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{reminder.supplementName}</span>
                            {reminder.dosage && (
                              <Badge variant="secondary" className="text-xs">
                                {reminder.dosage}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(reminder.time)}</span>
                            <span className="capitalize">({reminder.timing.replace("_", " ")})</span>
                            {reminder.daysOfWeek?.length ? (
                              <span>
                                - {reminder.daysOfWeek.map(d => d.slice(0, 3)).join(", ")}
                              </span>
                            ) : (
                              <span>- Daily</span>
                            )}
                          </div>
                          {reminder.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{reminder.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminder.isActive ?? true}
                          onCheckedChange={(checked) => 
                            toggleReminderMutation.mutate({ id: reminder.id, isActive: checked })
                          }
                          data-testid={`switch-reminder-${reminder.id}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(reminder)}
                          data-testid={`button-edit-reminder-${reminder.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteReminderMutation.mutate(reminder.id)}
                          data-testid={`button-delete-reminder-${reminder.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Smartphone className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold mb-1">Mobile App Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Download our iOS or Android app to receive push notifications directly on your phone. 
                  Your reminders will sync automatically across all your devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
