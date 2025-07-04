"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { toast } from "sonner"
import { Pill, Plus, Search, Edit, Trash2, Clock, Calendar, AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react"
import type { Medication } from "@/types"
import { useMedicationLimits } from "@/hooks/useSubscription"
import { LimitGuard } from "@/components/premium/premium-guard"
import {
  useMedicationsWithFilters,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
} from "@/hooks/useMedications"
import { DateTime } from "luxon"
import Pagination from "@/components/Pagination"
import { useAuth } from "@/hooks/useAuthContext"

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage_amount: z.number().min(0.1, "Dosage amount must be greater than 0"),
  dosage_unit: z.string().min(1, "Dosage unit is required"),
  times_per_day: z.number().min(1, "Times per day must be at least 1"),
  specific_days: z.array(z.string()).optional(),
  scheduled_times: z.array(z.string()).min(1, "At least one scheduled time is required"),
  instructions: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  medication_type: z.enum(["prescription", "otc", "supplement"]),
  side_effects_to_watch: z.array(z.string()).optional(),
  refill_reminder_enabled: z.boolean(),
  refill_reminder_days: z.number().min(1).max(30).optional(),
  supply_amount: z.number().min(1, "Supply amount must be at least 1").optional(),
})

type MedicationFormData = z.infer<typeof medicationSchema>

export function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10)

  // Use real data hooks
  const { data: medicationsResult, isLoading: medicationsLoading } = useMedicationsWithFilters(searchTerm, filterType, page, limit)
  const createMedicationMutation = useCreateMedication()
  const updateMedicationMutation = useUpdateMedication()
  const deleteMedicationMutation = useDeleteMedication()

  const { canAdd, maxMedications, currentCount } = useMedicationLimits(medicationsResult?.data.length || 0)

  const { user } = useAuth()

  // Filter medications based on search term and status
  const filteredMedications = useMemo(() => {
    if (!medicationsResult?.data || !Array.isArray(medicationsResult.data)) {
      return [];
    }

    return medicationsResult.data.filter((medication: Medication) => {
      const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.medication_type?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterType === 'all' ||
        (filterType === 'active' && medication.active) ||
        (filterType === 'inactive' && !medication.active);

      return matchesSearch && matchesStatus;
    });
  }, [medicationsResult?.data, searchTerm, filterType]);

  useEffect(() => {
    setPage(1) // Reset to first page when search/filter changes
  }, [searchTerm, filterType])

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
      times_per_day: 1,
      medication_type: "prescription",
      refill_reminder_enabled: true,
      refill_reminder_days: 7,
      scheduled_times: ["08:00"],
      side_effects_to_watch: [],
      supply_amount: 1,
    },
  })

  const timesPerDay = watch("times_per_day") || 1
  const refillReminderEnabled = watch("refill_reminder_enabled")

  const onSubmit = async (data: MedicationFormData) => {
    try {
      // Get user timezone
      const userTz = user?.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

      // Keep scheduled_times in user's local timezone - don't convert to UTC
      // The backend will handle timezone conversion when generating adherence records
      const newMedication: Medication = {
        id: editingMedication?.id || `med-${Date.now()}`,
        user_id: "",
        name: data.name,
        dosage: {
          amount: data.dosage_amount,
          unit: data.dosage_unit,
        },
        frequency: {
          times_per_day: data.times_per_day || 1,
          specific_days: data.specific_days || [],
        },
        scheduled_times: data.scheduled_times, // Keep in user's local timezone
        instructions: data.instructions || "",
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        refill_reminder: data.refill_reminder_enabled
          ? {
            enabled: true,
            threshold: data.refill_reminder_days || 7,
            last_refill: null,
            next_refill: null,
            supply_amount: data.supply_amount ?? 1,
            supply_unit: "days",
          }
          : null,
        side_effects_to_watch: data.side_effects_to_watch || [],
        active: true,
        medication_type: data.medication_type,
        user_timezone: userTz, // Add user timezone to help backend with timezone conversion
        created_at: editingMedication?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (editingMedication) {
        await updateMedicationMutation.mutateAsync({
          id: editingMedication.id,
          medicationData: {
            name: newMedication.name,
            dosage: {
              amount: newMedication.dosage.amount,
              unit: newMedication.dosage.unit,
            },
            frequency: {
              times_per_day: newMedication.frequency.times_per_day || 1,
              specific_days: newMedication.frequency.specific_days || [],
            },
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
            user_timezone: newMedication.user_timezone, // Add user timezone
          },
        })
        setEditingMedication(null)
      } else {
        const createData = {
          name: newMedication.name,
          dosage: {
            amount: newMedication.dosage.amount,
            unit: newMedication.dosage.unit,
          },
          frequency: {
            times_per_day: newMedication.frequency.times_per_day || 1,
            specific_days: newMedication.frequency.specific_days || [],
          },
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
          user_timezone: newMedication.user_timezone, // Add user timezone
        };

        await createMedicationMutation.mutateAsync(createData)
      }

      reset()
      setActiveTab("list")
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save medication. Please try again.",
      });
    }
  }

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setValue("name", medication.name)
    setValue("dosage_amount", medication.dosage.amount)
    setValue("dosage_unit", medication.dosage.unit)
    setValue("times_per_day", medication.frequency.times_per_day ?? 1)
    setValue("specific_days", medication.frequency.specific_days ?? [])
    setValue("scheduled_times", medication.scheduled_times)
    setValue("instructions", medication.instructions || "")
    setValue("start_date", medication.start_date.split("T")[0])
    setValue("end_date", medication.end_date ? medication.end_date.split("T")[0] : "")
    setValue("medication_type", medication.medication_type || "prescription")
    setValue("side_effects_to_watch", medication.side_effects_to_watch ?? [])
    setValue("refill_reminder_enabled", medication.refill_reminder?.enabled ?? false)
    setValue("refill_reminder_days", medication.refill_reminder?.threshold ?? 7)
    setValue("supply_amount", medication.refill_reminder?.supply_amount ?? 1)
    setActiveTab("create")
  }

  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (medicationToDelete) {
      try {
        await deleteMedicationMutation.mutateAsync(medicationToDelete.id)
        setIsDeleteDialogOpen(false)
        setMedicationToDelete(null)
        toast.success("Medication Deleted", {
          description: "The medication has been deleted successfully.",
        });
      } catch (error) {
        toast.error("Error", {
          description: "Failed to delete medication. Please try again.",
        });
      }
    }
  }

  const generateTimeSlots = (count: number) => {
    const times = []
    const startHour = 8 // Start at 8 AM
    const interval = Math.floor(12 / count) // Distribute over 12 hours

    for (let i = 0; i < count; i++) {
      const hour = startHour + i * interval
      const timeString = `${hour.toString().padStart(2, "0")}:00`
      times.push(timeString)
    }

    setValue("scheduled_times", times)
  }

  useEffect(() => {
    if (timesPerDay) {
      const currentTimes = watch("scheduled_times") || []
      // Only auto-generate if no times are set or if the number of times doesn't match
      if (currentTimes.length === 0 || currentTimes.length !== timesPerDay) {
        generateTimeSlots(timesPerDay)
      }
    }
  }, [timesPerDay])

  if (medicationsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Medications</h1>
          <p className="text-muted-foreground">Manage your medication schedule and track your prescriptions</p>
        </div>
        {canAdd ? (
          <Button onClick={() => setActiveTab("create")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        ) : (
          <LimitGuard currentCount={currentCount} maxCount={maxMedications} itemName="medication">
            <Button disabled className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </LimitGuard>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Medication List</TabsTrigger>
          <TabsTrigger value="create">{editingMedication ? "Edit Medication" : "Add Medication"}</TabsTrigger>
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
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
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
          <div className="grid gap-3">
            {filteredMedications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No medications found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Get started by adding your first medication"}
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredMedications.map((medication) => (
                  <Card key={medication.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-xl">{medication.name}</CardTitle>
                            <Badge
                              variant={
                                medication.medication_type === "prescription"
                                  ? "default"
                                  : medication.medication_type === "otc"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {medication.medication_type === "prescription"
                                ? "Prescription"
                                : medication.medication_type === "otc"
                                  ? "OTC"
                                  : "Supplement"}
                            </Badge>
                          </div>
                          <CardDescription className="text-base font-medium">
                            {medication.dosage.amount}
                            {medication.dosage.unit}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(medication)} disabled={updateMedicationMutation.isPending}>
                            {updateMedicationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
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
                      {/* Schedule Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          <span className="font-semibold text-sm">Daily Schedule</span>
                          <Separator className="flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {medication.frequency.times_per_day} time(s)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {medication.scheduled_times.map((time, index) => {
                            const userTz = user?.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                            const refDate = medication.start_date
                              ? DateTime.fromISO(medication.start_date, { zone: "utc" })
                              : DateTime.now()
                            const utcDateTime = refDate
                              .set({
                                hour: Number(time.split(":")[0]),
                                minute: Number(time.split(":")[1] || 0),
                                second: 0,
                                millisecond: 0,
                              })
                              .setZone("utc")
                            const localDateTime = utcDateTime.setZone(userTz)
                            return (
                              <Badge key={index} variant="outline" className="px-2 py-0.5 font-mono text-xs">
                                {localDateTime.toFormat("HH:mm")}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      {/* Instructions Section */}
                      {medication.instructions && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            <span className="font-semibold text-sm">Instructions</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6 leading-relaxed">{medication.instructions}</p>
                        </div>
                      )}

                      {/* Side Effects Section */}
                      {medication.side_effects_to_watch.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-sm">Side Effects to Monitor</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-6">
                            {medication.side_effects_to_watch.map((effect, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-amber-50 border-amber-200 text-amber-800 px-2 py-0.5"
                              >
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Section */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Started {new Date(medication.start_date).toLocaleDateString()}</span>
                          </div>
                          {medication.refill_reminder?.enabled && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs">
                                Refill reminder ({medication.refill_reminder.threshold} days)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {medicationsResult && medicationsResult.total > medicationsResult.limit && (
                  <Card className="mt-6">
                    <CardContent className="flex justify-center py-4">
                      <Pagination
                        page={medicationsResult.page}
                        limit={medicationsResult.limit}
                        total={medicationsResult.total}
                        onPageChange={(newPage) => setPage(newPage)}
                        className=""
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          {medicationsResult && medicationsResult.data.length > 0 && (
            <Card>
              <CardContent className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="limit-select" className="text-sm">
                    Items per page:
                  </Label>
                  <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                    <SelectTrigger className="w-20" id="limit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {((medicationsResult.page - 1) * medicationsResult.limit) + 1} to{" "}
                  {Math.min(medicationsResult.page * medicationsResult.limit, medicationsResult.total)} of{" "}
                  {medicationsResult.total} medications
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {editingMedication ? "Edit Medication" : "Add New Medication"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {editingMedication
                      ? "Update your medication details and schedule"
                      : "Enter your medication details and set up your schedule"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <Separator className="flex-1 ml-4" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Medication Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Lisinopril, Aspirin, Vitamin D"
                        {...register("name")}
                        aria-invalid={errors.name ? "true" : "false"}
                        className="h-11"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medication_type" className="text-sm font-medium">
                        Medication Type *
                      </Label>
                      <Select
                        value={watch("medication_type")}
                        onValueChange={(value) => setValue("medication_type", value as any)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select medication type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prescription">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Prescription
                            </div>
                          </SelectItem>
                          <SelectItem value="otc">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Over-the-Counter
                            </div>
                          </SelectItem>
                          <SelectItem value="supplement">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              Supplement
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dosage Information Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <Pill className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Dosage Information</h3>
                    <Separator className="flex-1 ml-4" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="dosage_amount" className="text-sm font-medium">
                        Amount *
                      </Label>
                      <Input
                        id="dosage_amount"
                        type="number"
                        step="0.1"
                        placeholder="10"
                        {...register("dosage_amount", { valueAsNumber: true })}
                        aria-invalid={errors.dosage_amount ? "true" : "false"}
                        className="h-11"
                      />
                      {errors.dosage_amount && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.dosage_amount.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage_unit" className="text-sm font-medium">
                        Unit *
                      </Label>
                      <Select value={watch("dosage_unit")} onValueChange={(value) => setValue("dosage_unit", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg (milligrams)</SelectItem>
                          <SelectItem value="g">g (grams)</SelectItem>
                          <SelectItem value="ml">ml (milliliters)</SelectItem>
                          <SelectItem value="IU">IU (International Units)</SelectItem>
                          <SelectItem value="mcg">mcg (micrograms)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.dosage_unit && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.dosage_unit.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Schedule & Frequency Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Schedule & Frequency</h3>
                    <Separator className="flex-1 ml-4" />
                  </div>
                  <div className="space-y-6 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="times_per_day" className="text-sm font-medium">
                        Times per Day *
                      </Label>
                      <Input
                        id="times_per_day"
                        type="number"
                        min="1"
                        max="6"
                        {...register("times_per_day", { valueAsNumber: true })}
                        className="h-11"
                      />
                    </div>

                    {/* Manual Time Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Scheduled Times *
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => generateTimeSlots(timesPerDay)}
                          >
                            Auto-generate
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentTimes = watch("scheduled_times") || []
                              if (currentTimes.length < 6) {
                                setValue("scheduled_times", [...currentTimes, "08:00"])
                              }
                            }}
                            disabled={(watch("scheduled_times") || []).length >= 6}
                          >
                            Add Time
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {(watch("scheduled_times") || []).map((time, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const currentTimes = [...(watch("scheduled_times") || [])]
                                currentTimes[index] = e.target.value
                                setValue("scheduled_times", currentTimes)
                              }}
                              className="h-10 w-32"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentTimes = [...(watch("scheduled_times") || [])]
                                currentTimes.splice(index, 1)
                                setValue("scheduled_times", currentTimes)
                              }}
                              disabled={(watch("scheduled_times") || []).length <= 1}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>

                      {errors.scheduled_times && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.scheduled_times.message}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Set the specific times when you need to take this medication. You can add up to 6 times per day.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Treatment Period Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold">Treatment Period</h3>
                    <Separator className="flex-1 ml-4" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-sm font-medium">
                        Start Date *
                      </Label>
                      <div className="relative">
                        <Input
                          id="start_date"
                          type="date"
                          {...register("start_date")}
                          aria-invalid={errors.start_date ? "true" : "false"}
                          className="h-11 pl-10"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      </div>
                      {errors.start_date && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.start_date.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-sm font-medium">
                        End Date (Optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="end_date"
                          type="date"
                          {...register("end_date")}
                          className="h-11 pl-10"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Leave empty for ongoing treatment</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Instructions & Notes Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <Info className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold">Instructions & Notes</h3>
                    <Separator className="flex-1 ml-4" />
                  </div>
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="instructions" className="text-sm font-medium">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="instructions"
                        placeholder="e.g., Take with food, avoid alcohol, take on empty stomach..."
                        {...register("instructions")}
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Include any special instructions from your doctor or pharmacist
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Refill Reminder Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold">Refill Reminder</h3>
                    <Separator className="flex-1 ml-4" />
                  </div>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="refill_reminder_enabled" className="text-sm font-medium cursor-pointer">
                          Enable refill reminders
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when it's time to refill your medication
                        </p>
                      </div>
                      <Switch
                        id="refill_reminder_enabled"
                        checked={refillReminderEnabled}
                        onCheckedChange={(checked) => setValue("refill_reminder_enabled", checked)}
                      />
                    </div>

                    {refillReminderEnabled && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="refill_reminder_days" className="text-sm font-medium">
                            Reminder Days
                          </Label>
                          <Input
                            id="refill_reminder_days"
                            type="number"
                            min="1"
                            max="30"
                            {...register("refill_reminder_days", { valueAsNumber: true })}
                            className="h-11"
                          />
                          <p className="text-xs text-muted-foreground">Days before running out</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supply_amount" className="text-sm font-medium">
                            Supply Amount
                          </Label>
                          <Input
                            id="supply_amount"
                            type="number"
                            min="1"
                            placeholder="e.g. 30"
                            {...register("supply_amount", { valueAsNumber: true })}
                            className="h-11"
                          />
                          <p className="text-xs text-muted-foreground">Total pills/doses in your supply</p>
                        </div>
                      </div>
                    )}

                    {watch("supply_amount") && watch("times_per_day") && refillReminderEnabled ? (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Supply Duration:</strong> This supply will last approximately{" "}
                          <span className="font-semibold text-foreground">
                            {Math.floor(watch("supply_amount")! / watch("times_per_day")!)} day(s)
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset()
                      setEditingMedication(null)
                      setActiveTab("list")
                    }}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || createMedicationMutation.isPending} className="sm:w-auto">
                    {(isSubmitting || createMedicationMutation.isPending || updateMedicationMutation.isPending)
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : editingMedication
                        ? (<><Edit className="h-4 w-4 mr-2" />Update Medication</>)
                        : (<><Plus className="h-4 w-4 mr-2" />Add Medication</>)}
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
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMedicationMutation.isPending}>
              {deleteMedicationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
