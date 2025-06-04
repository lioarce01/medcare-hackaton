import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Pill,
  Activity,
  Pause,
  ChevronDown,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react"
import { MedicationList } from "../components/MedicationList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { useUser } from "../hooks/useUser"
import { useDeleteMedication, useMedications } from "../hooks/useMedications"

interface Medication {
  id: string
  name: string
  dosage: { amount: number; unit: string }
  frequency: string
  active: boolean
  created_at: string
  updated_at: string
  scheduled_times: string[]
  medication_type: string
}

type FilterType = "all" | "active" | "inactive"

// Utils
const parseDosage = (dosage: any) => {
  if (typeof dosage === "object") return dosage;
  const match = dosage?.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/);
  return match ? { amount: Number(match[1]), unit: match[2] } : { amount: 0, unit: "" };
};

const parseFrequency = (frequency: any) => {
  if (typeof frequency === "object") return frequency;
  const match = frequency?.match(/(\d+)x\/day(?:\s*([\w,]+))?/);
  return {
    times_per_day: match ? Number(match[1]) : 1,
    specific_days: match?.[2]?.split(",") || [],
  };
};

const filterMedications = (
  medications: Medication[],
  filter: FilterType,
  searchTerm: string
): Medication[] => {
  return medications
    .filter((med) => {
      if (filter === "active") return med.active;
      if (filter === "inactive") return !med.active;
      return true;
    })
    .filter((med) => {
      const search = searchTerm.toLowerCase();
      const nameMatch = med.name.toLowerCase().includes(search);
      const dosage = typeof med.dosage === "string"
        ? med.dosage
        : `${med.dosage?.amount} ${med.dosage?.unit}`;
      const dosageMatch = dosage.toLowerCase().includes(search);
      return nameMatch || dosageMatch;
    });
};


export const Medications = () => {
  const { data: user, isLoading: authLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")

  const { data: medications = [], isError, error, refetch, isPending: isRefreshing } = useMedications()
  const {mutate: deleteMedication } = useDeleteMedication()

  const filteredMedications = useMemo(() => {
    if (!medications) return [];
    return filterMedications(medications, filter, searchTerm);
  }, [medications, filter, searchTerm]);

  // Efecto para cargar medicamentos inicialmente
  useEffect(() => {
    if (!authLoading) refetch();
  }, [authLoading, refetch]);

  // Función para manejar eliminación
  const handleDelete = (id: string) => deleteMedication(id);

  // Función para refrescar
  const handleRefresh = async () => {
    await refetch({ throwOnError: true });
};

  // Show loading while auth is loading or data is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <LoadingSpinner />
          </div>
          <p className="text-indigo-600 font-medium">Loading your medications...</p>
        </div>
      </div>
    )
  }

  // Show message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Pill className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Authentication Required</h2>
            <p className="text-gray-600 text-center mb-6">Please sign in to view and manage your medications.</p>
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-scree">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Your Medications
                      </h1>
                      <p className="text-gray-600">Manage your medication schedule and dosages</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 border border-gray-200 hover:border-gray-300 shadow-sm font-medium group"
                  >
                    <RefreshCw
                      className={`mr-2 h-5 w-5 ${
                        isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <Link
                    to="/medications/add"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl font-medium"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Medication
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Error Alert */}
          {isError && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800">Error occurred</h3>
                      <p className="text-red-600">{(error as Error)?.message || "Unexpected error"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="text-red-500 hover:text-red-700 ml-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                    title="Retry refetch data"
                  >
                    ↻
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Search and Filter Controls */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search medications</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or dosage..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="lg:w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by status</label>
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                        className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all duration-200 font-medium"
                      >
                        <option value="all">All Medications</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                {(searchTerm || filter !== "all") && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">{filteredMedications.length}</span> of{" "}
                        <span className="font-semibold text-gray-800">{medications?.length}</span> medications
                        {searchTerm && (
                          <span>
                            {" "}
                            matching <span className="font-medium">"{searchTerm}"</span>
                          </span>
                        )}
                        {filter !== "all" && <span> ({filter})</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Medications List */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-5"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {filteredMedications.length === 0 ? (
                <div className="p-12 text-center">
                  {medications?.length === 0 ? (
                    // No medications at all
                    <>
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
                        <Pill className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Start your medication journey</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                        Begin tracking your medications and never miss a dose again. Add your first medication to get
                        started.
                      </p>
                      <Link
                        to="/medications/add"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl inline-flex items-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-medium text-lg"
                      >
                        <PlusCircle className="mr-3 h-6 w-6" />
                        Add Your First Medication
                      </Link>
                    </>
                  ) : (
                    // No results for current filter/search
                    <>
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <Search className="w-12 h-12 text-gray-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">No medications found</h3>
                      <p className="text-gray-600 mb-6 text-lg">
                        {searchTerm ? `No medications match "${searchTerm}"` : `No ${filter} medications found`}
                      </p>
                      {(searchTerm || filter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("")
                            setFilter("all")
                          }}
                          className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Clear all filters
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <MedicationList
                  medications={filteredMedications.map((med) => ({
                    ...med,
                    dosage: parseDosage(med.dosage),
                    frequency: parseFrequency(med.frequency),
                  }))}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          {/* Enhanced Stats Summary */}
          {medications?.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl opacity-5"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6 justify-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Medication Overview</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Total Medications",
                        value: medications?.length,
                        icon: Pill,
                        color: "from-blue-500 to-indigo-600",
                        bgColor: "from-blue-50 to-indigo-50",
                      },
                      {
                        title: "Active",
                        value: medications?.filter((med) => med.active).length,
                        icon: Activity,
                        color: "from-emerald-500 to-green-600",
                        bgColor: "from-emerald-50 to-green-50",
                      },
                      {
                        title: "Inactive",
                        value: medications?.filter((med) => !med.active).length,
                        icon: Pause,
                        color: "from-gray-500 to-slate-600",
                        bgColor: "from-gray-50 to-slate-50",
                      },
                    ].map((stat, index) => (
                      <div key={stat.title} className="relative group" style={{ animationDelay: `${index * 100}ms` }}>
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity`}
                        ></div>
                        <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 text-center">
                          <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <stat.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                          <div className="text-sm font-medium text-gray-600">{stat.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Schedule Preview */}
          {medications?.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl opacity-5"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Today's Schedule</h3>
                      <p className="text-gray-600">Quick view of your medication schedule</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span className="text-gray-700">
                        You have{" "}
                        <span className="font-bold text-emerald-700">
                          {medications?.filter((med) => med.active).length}
                        </span>{" "}
                        active medications to track
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
