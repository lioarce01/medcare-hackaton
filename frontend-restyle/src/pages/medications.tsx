import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { toast } from 'sonner';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import { Medication } from '@/types';
import { useMedicationLimits } from '@/hooks/useSubscription';
import { LimitGuard } from '@/components/premium/premium-guard';
import { useMedicationsWithFilters, useCreateMedication, useUpdateMedication, useDeleteMedication } from '@/hooks/useMedications';
import { useAuth } from '@/hooks/useAuth';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage_amount: z.number().min(0.1, 'Dosage amount must be greater than 0'),
  dosage_unit: z.string().min(1, 'Dosage unit is required'),
  dosage_form: z.string().min(1, 'Dosage form is required'),
  frequency_type: z.enum(['daily', 'weekly', 'as_needed']),
  frequency_interval: z.number().min(1, 'Frequency interval must be at least 1'),
  times_per_day: z.number().min(1, 'Times per day must be at least 1').optional(),
  specific_days: z.array(z.string()).optional(), // ✅ AÑADIR ESTO
  scheduled_times: z.array(z.string()).min(1, 'At least one scheduled time is required'),
  instructions: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  medication_type: z.enum(['prescription', 'otc', 'supplement']),
  side_effects_to_watch: z.array(z.string()).optional(),
  refill_reminder_enabled: z.boolean(),
  refill_reminder_days: z.number().min(1).max(30).optional(),
  supply_amount: z.number().min(1, 'Supply amount must be at least 1').optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

export function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Use real data hooks
  const { data: filteredMedications = [], isLoading, originalData } = useMedicationsWithFilters(searchTerm, filterType);
  const createMedicationMutation = useCreateMedication();
  const updateMedicationMutation = useUpdateMedication();
  const deleteMedicationMutation = useDeleteMedication();

  const { canAdd, isAtLimit, maxMedications, currentCount } = useMedicationLimits(originalData?.length || 0);

  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      frequency_type: 'daily',
      frequency_interval: 1,
      times_per_day: 1,
      medication_type: 'prescription',
      refill_reminder_enabled: true,
      refill_reminder_days: 7,
      scheduled_times: ['08:00'],
      side_effects_to_watch: [],
      supply_amount: 1
    },
  });

  const frequencyType = watch('frequency_type');
  const timesPerDay = watch('times_per_day') || 1;
  const refillReminderEnabled = watch('refill_reminder_enabled');

  console.log("filteredMedications:", filteredMedications, Array.isArray(filteredMedications));


  const onSubmit = async (data: MedicationFormData) => {
    try {
      const newMedication: Medication = {
        id: editingMedication?.id || `med-${Date.now()}`,
        user_id: '',
        name: data.name,
        dosage: {
          amount: data.dosage_amount,
          unit: data.dosage_unit,
          form: data.dosage_form,
        },
        frequency: {
          type: data.frequency_type,
          interval: data.frequency_interval,
          times_per_day: data.times_per_day,
          specific_days: data.specific_days || [],
        },
        scheduled_times: data.scheduled_times,
        instructions: data.instructions || '',
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
        refill_reminder: data.refill_reminder_enabled
          ? {
              enabled: true,
              threshold: data.refill_reminder_days || 7,
              last_refill: new Date(data.start_date).toISOString(),
              next_refill: null,
              supply_amount: data.supply_amount ?? 1,
              supply_unit: 'days',
            }
          : null,
        side_effects_to_watch: data.side_effects_to_watch || [],
        active: true,
        medication_type: data.medication_type,
        created_at: editingMedication?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (newMedication.refill_reminder && !Array.isArray(newMedication.refill_reminder)) {
          // OK, dejamos el objeto tal cual
        } else {
          newMedication.refill_reminder = null;
      }

      console.log("🚀 newMedication:", newMedication);


      if (!newMedication.refill_reminder) {
          throw new Error("Refill reminder is missing");
        }

      if (editingMedication) {
        await updateMedicationMutation.mutateAsync({
          id: editingMedication.id,
          medication: {
            name: newMedication.name,
            dosage: newMedication.dosage,
            frequency: newMedication.frequency,
            scheduled_times: newMedication.scheduled_times,
            instructions: newMedication.instructions,
            start_date: newMedication.start_date,
            end_date: newMedication.end_date,
            refill_reminder: {
              enabled: newMedication.refill_reminder?.enabled || false,
              days_before: newMedication.refill_reminder?.threshold || 7, 
              threshold: newMedication.refill_reminder?.threshold || 7,
              last_refill: newMedication.refill_reminder?.last_refill || null,
              next_refill: newMedication.refill_reminder?.next_refill || null,
              supply_amount: newMedication.refill_reminder?.supply_amount || 0,
              supply_unit: newMedication.refill_reminder?.supply_unit || 'days',
            },
            side_effects_to_watch: newMedication.side_effects_to_watch,
            medication_type: newMedication.medication_type,
          },
        });
        setEditingMedication(null);
      } else {
        await createMedicationMutation.mutateAsync({
          user_id: user?.id ?? '',
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          scheduled_times: newMedication.scheduled_times,
          instructions: newMedication.instructions,
          start_date: newMedication.start_date,
          end_date: newMedication.end_date,
          refill_reminder: newMedication.refill_reminder?.enabled
            ? {
                enabled: newMedication.refill_reminder.enabled,
                threshold: newMedication.refill_reminder.threshold,
                days_before: newMedication.refill_reminder.threshold,
                last_refill: newMedication.refill_reminder.last_refill,
                next_refill: newMedication.refill_reminder.next_refill,
                supply_amount: newMedication.refill_reminder.supply_amount,
                supply_unit: newMedication.refill_reminder.supply_unit,
              }
            : null,
          side_effects_to_watch: newMedication.side_effects_to_watch,
          medication_type: newMedication.medication_type,
        });
      }

      reset();
      setActiveTab('list');
    } catch (error) {
      toast.error('Failed to save medication');
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue('name', medication.name);
    setValue('dosage_amount', medication.dosage.amount);
    setValue('dosage_unit', medication.dosage.unit);
    setValue('dosage_form', medication.dosage.form);
    setValue('frequency_type', medication.frequency.type);
    setValue('frequency_interval', medication.frequency.interval);
    setValue('times_per_day', medication.frequency.times_per_day ?? 1);
    setValue('specific_days', medication.frequency.specific_days ?? []); // aquí el cambio
    setValue('scheduled_times', medication.scheduled_times);
    setValue('instructions', medication.instructions || '');
    setValue('start_date', medication.start_date.split('T')[0]);
    setValue('end_date', medication.end_date ? medication.end_date.split('T')[0] : '');
    setValue('medication_type', medication.medication_type || 'prescription');
    setValue('side_effects_to_watch', medication.side_effects_to_watch ?? []);
    setValue('refill_reminder_enabled', medication.refill_reminder?.enabled ?? false);
    setValue('refill_reminder_days', medication.refill_reminder?.threshold ?? 7); // asumiendo que usas 'days_before'
    setValue('supply_amount', medication.refill_reminder?.supply_amount ?? 1);
    setActiveTab('create');
  };


  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (medicationToDelete) {
      try {
        await deleteMedicationMutation.mutateAsync(medicationToDelete.id);
        setIsDeleteDialogOpen(false);
        setMedicationToDelete(null);
      } catch (error) {
        console.error('Failed to delete medication:', error);
      }
    }
  };

  const generateTimeSlots = (count: number) => {
    const times = [];
    const startHour = 8; // Start at 8 AM
    const interval = Math.floor(12 / count); // Distribute over 12 hours

    for (let i = 0; i < count; i++) {
      const hour = startHour + (i * interval);
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      times.push(timeString);
    }

    setValue('scheduled_times', times);
  };

  useEffect(() => {
    if (frequencyType === 'daily' && timesPerDay) {
      generateTimeSlots(timesPerDay);
    }
  }, [timesPerDay, frequencyType]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medications</h1>
          <p className="text-muted-foreground">
            Manage your medication schedule and track your prescriptions
          </p>
        </div>
        {canAdd ? (
          <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        ) : (
          <LimitGuard
            currentCount={currentCount}
            maxCount={maxMedications}
            itemName="medication"
          >
            <Button disabled className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </LimitGuard>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Medication List</TabsTrigger>
          <TabsTrigger value="create">
            {editingMedication ? 'Edit Medication' : 'Add Medication'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search medications</Label>
                  <Input
                    id="search"
                    placeholder="Search by medication name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="sm:w-48">
                  <Label htmlFor="filter">Filter by type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="otc">Over-the-Counter</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications List */}
          <div className="grid gap-4">
            {filteredMedications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No medications found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by adding your first medication'
                    }
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredMedications?.map((medication) => (
                <Card key={medication.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{medication.name}</CardTitle>
                          <Badge variant={
                            medication.medication_type === 'prescription' ? 'default' :
                            medication.medication_type === 'otc' ? 'secondary' : 'outline'
                          }>
                            {medication.medication_type === 'prescription' ? 'Prescription' :
                             medication.medication_type === 'otc' ? 'OTC' : 'Supplement'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {medication.dosage.amount}{medication.dosage.unit} {medication.dosage.form}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medication)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(medication)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Schedule:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {medication.scheduled_times.map((time, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Frequency:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {medication.frequency.times_per_day} time(s) {medication.frequency.type}
                        </p>
                      </div>
                    </div>

                    {medication.instructions && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Instructions:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{medication.instructions}</p>
                      </div>
                    )}

                    {medication.side_effects_to_watch.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">Side Effects to Watch:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {medication.side_effects_to_watch.map((effect, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-warning-light border">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {medication.refill_reminder?.enabled && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Refill reminder enabled ({medication.refill_reminder.threshold} days before)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </CardTitle>
              <CardDescription>
                {editingMedication 
                  ? 'Update your medication details and schedule'
                  : 'Enter your medication details and set up your schedule'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Medication Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Lisinopril"
                        {...register('name')}
                        aria-invalid={errors.name ? 'true' : 'false'}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medication_type">Type *</Label>
                      <Select
                        value={watch('medication_type')}
                        onValueChange={(value) => setValue('medication_type', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="otc">Over-the-Counter</SelectItem>
                          <SelectItem value="supplement">Supplement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dosage Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dosage Information</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="dosage_amount">Amount *</Label>
                      <Input
                        id="dosage_amount"
                        type="number"
                        step="0.1"
                        placeholder="10"
                        {...register('dosage_amount', { valueAsNumber: true })}
                        aria-invalid={errors.dosage_amount ? 'true' : 'false'}
                      />
                      {errors.dosage_amount && (
                        <p className="text-sm text-destructive">{errors.dosage_amount.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage_unit">Unit *</Label>
                      <Select
                        value={watch('dosage_unit')}
                        onValueChange={(value) => setValue('dosage_unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="IU">IU</SelectItem>
                          <SelectItem value="mcg">mcg</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.dosage_unit && (
                        <p className="text-sm text-destructive">{errors.dosage_unit.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage_form">Form *</Label>
                      <Select
                        value={watch('dosage_form')}
                        onValueChange={(value) => setValue('dosage_form', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="liquid">Liquid</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="cream">Cream</SelectItem>
                          <SelectItem value="drops">Drops</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.dosage_form && (
                        <p className="text-sm text-destructive">{errors.dosage_form.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Frequency & Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Frequency & Schedule</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="frequency_type">Frequency Type *</Label>
                      <Select
                        value={watch('frequency_type')}
                        onValueChange={(value) => setValue('frequency_type', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="as_needed">As Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(frequencyType === 'daily' || frequencyType === 'weekly') && (
                      <div className="space-y-2">
                        <Label htmlFor="times_per_day">Times per Day *</Label>
                        <Input
                          id="times_per_day"
                          type="number"
                          min="1"
                          max="6"
                          {...register('times_per_day', { valueAsNumber: true })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="frequency_interval">Interval *</Label>
                      <Input
                        id="frequency_interval"
                        type="number"
                        min="1"
                        placeholder="1"
                        {...register('frequency_interval', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  {/* ✅ Weekly: Select specific days */}
                  {frequencyType === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Specific Days</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                          <label key={day} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={day}
                              checked={watch('specific_days')?.includes(day)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const prev = watch('specific_days') || [];
                                const updated = checked
                                  ? [...prev, day]
                                  : prev.filter((d) => d !== day);
                                setValue('specific_days', updated);
                              }}
                            />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ✅ Daily or Weekly: Scheduled Times */}
                  {(frequencyType === 'daily' || frequencyType === 'weekly') && (
                    <div className="space-y-2">
                      <Label>Scheduled Times</Label>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {watch('scheduled_times')?.map((time, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const times = [...(watch('scheduled_times') || [])];
                                times[index] = e.target.value;
                                setValue('scheduled_times', times);
                              }}
                            />
                            {watch('scheduled_times')?.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const times = watch('scheduled_times')?.filter((_, i) => i !== index) || [];
                                  setValue('scheduled_times', times);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const current = watch('scheduled_times') || [];
                          setValue('scheduled_times', [...current, '']);
                        }}
                      >
                        + Add Time
                      </Button>
                    </div>
                  )}

                  {/* ✅ Refill Reminder: Supply Amount */}
                  {watch('refill_reminder_enabled') && (
                    <div className="space-y-2">
                      <Label htmlFor="supply_amount">Supply Amount</Label>
                      <Input
                        id="supply_amount"
                        type="number"
                        min="1"
                        placeholder="e.g. 30"
                        {...register('supply_amount', { valueAsNumber: true })}
                      />
                    {watch("supply_amount") && watch("times_per_day") ? (
                  <p className="text-sm text-muted-foreground">
                    This supply lasts approximately{" "}
                    {Math.floor(watch("supply_amount")! / watch("times_per_day")!)} day(s)
                  </p>
                ) : null}
                    </div>
                  )}
                </div>


                <Separator />

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        {...register('start_date')}
                        aria-invalid={errors.start_date ? 'true' : 'false'}
                      />
                      {errors.start_date && (
                        <p className="text-sm text-destructive">{errors.start_date.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date (Optional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        {...register('end_date')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="e.g., Take with food, avoid alcohol..."
                      {...register('instructions')}
                    />
                  </div>
                </div>

                <Separator />

                {/* Refill Reminder */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Refill Reminder</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="refill_reminder_enabled"
                      checked={refillReminderEnabled}
                      onCheckedChange={(checked) => setValue('refill_reminder_enabled', checked)}
                    />
                    <Label htmlFor="refill_reminder_enabled">Enable refill reminders</Label>
                  </div>
                  {refillReminderEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="refill_reminder_days">Remind me (days before running out)</Label>
                      <Input
                        id="refill_reminder_days"
                        type="number"
                        min="1"
                        max="30"
                        {...register('refill_reminder_days', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setEditingMedication(null);
                      setActiveTab('list');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingMedication ? 'Update Medication' : 'Add Medication'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medication</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{medicationToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}