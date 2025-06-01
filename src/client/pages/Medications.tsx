"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { PlusCircle, Search, Filter, RefreshCw, AlertCircle, Pill, Activity, Pause } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { MedicationList } from "../components/MedicationList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { medicationApi } from "../utils/api"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  active: boolean
  created_at: string
  updated_at: string
}

type FilterType = "all" | "active" | "inactive"

export const Medications = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [refreshing, setRefreshing] = useState(false)

  // Función para obtener medicamentos
  const fetchMedications = useCallback(
    async (showRefreshing = false) => {
      // Wait for auth to be ready and user to be authenticated
      if (authLoading || !isAuthenticated || !user?.id) {
        setLoading(false)
        return
      }

      try {
        if (showRefreshing) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError("")

        // Add a small delay to ensure auth token is ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        const response = await medicationApi.getAll()
        const medicationsList = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : []

        setMedications(medicationsList)
      } catch (err: any) {
        console.error("Error fetching medications:", err)

        // Only show error if it's not an auth issue
        if (err.response?.status !== 401) {
          const errorMessage = err.response?.data?.message || err.message || "Failed to fetch medications"
          setError(errorMessage)
        } else {
          console.log("Authentication error detected, user may need to re-login")
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [user?.id, isAuthenticated, authLoading],
  )

  // Efecto para cargar medicamentos inicialmente
  useEffect(() => {
    if (!authLoading) {
      fetchMedications()
    }
  }, [fetchMedications, authLoading])

  // Efecto para filtrar medicamentos
  useEffect(() => {
    let filtered = medications

    // Filtrar por estado
    if (filter === "active") {
      filtered = filtered.filter((med) => med.active)
    } else if (filter === "inactive") {
      filtered = filtered.filter((med) => !med.active)
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (med) => med.name.toLowerCase().includes(searchLower) || med.dosage.toLowerCase().includes(searchLower),
      )
    }

    setFilteredMedications(filtered)
  }, [medications, filter, searchTerm])

  // Función para manejar eliminación
  const handleDelete = async (id: string) => {
    const medication = medications.find((med) => med.id === id)
    if (!medication) return

    if (!window.confirm(`Are you sure you want to delete "${medication.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await medicationApi.delete(id)
      setMedications((prev) => prev.filter((med) => med.id !== id))
      console.log("Medication deleted successfully")
    } catch (err: any) {
      console.error("Error deleting medication:", err)
      if (err.response?.status !== 401) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to delete medication"
        setError(errorMessage)
      }
    }
  }

  // Función para limpiar errores
  const clearError = () => setError("")

  // Función para refrescar
  const handleRefresh = () => {
    fetchMedications(true)
  }

  // Show loading while auth is loading or data is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600 font-medium">Loading your medications...</p>
        </div>
      </div>
    )
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl border border-slate-200 max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <Pill className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Authentication Required</h2>
          <p className="text-slate-600">Please sign in to view and manage your medications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                  Your Medications
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Manage your medication schedule, track dosages, and stay on top of your health routine
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 border border-slate-200 hover:border-slate-300 shadow-sm font-medium"
                  title="Refresh medications"
                >
                  <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                <Link
                  to="/medications/add"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Medication
                </Link>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start justify-between shadow-sm">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Error occurred</h4>
                  <span className="text-red-600">{error}</span>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 ml-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors"
                title="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Search medications</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or dosage..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Filter */}
                <div className="lg:w-64">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Filter by status</label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 focus:bg-white transition-all duration-200 font-medium"
                    >
                      <option value="all">All Medications</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {(searchTerm || filter !== "all") && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{filteredMedications.length}</span> of{" "}
                    <span className="font-semibold text-slate-800">{medications.length}</span> medications
                    {searchTerm && (
                      <span>
                        {" "}
                        matching <span className="font-medium">"{searchTerm}"</span>
                      </span>
                    )}
                    {filter !== "all" && <span> ({filter})</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Medications List */}
          <div>
            {filteredMedications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                {medications.length === 0 ? (
                  // No medications at all
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Pill className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">Start your medication journey</h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                      Begin tracking your medications and never miss a dose again. Add your first medication to get
                      started.
                    </p>
                    <Link
                      to="/medications/add"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl inline-flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium text-lg"
                    >
                      <PlusCircle className="mr-3 h-6 w-6" />
                      Add Your First Medication
                    </Link>
                  </>
                ) : (
                  // No results for current filter/search
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">No medications found</h3>
                    <p className="text-slate-600 mb-6 text-lg">
                      {searchTerm ? `No medications match "${searchTerm}"` : `No ${filter} medications found`}
                    </p>
                    {(searchTerm || filter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setFilter("all")
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <MedicationList medications={filteredMedications} onDelete={handleDelete} loading={refreshing} />
            )}
          </div>

          {/* Stats Summary */}
          {medications.length > 0 && (
            <div className="bg-gradient-to-r from-white to-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Medication Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{medications.length}</div>
                    <div className="text-sm font-medium text-slate-600">Total Medications</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-700 mb-1">
                      {medications.filter((med) => med.active).length}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Active</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center">
                      <Pause className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-600 mb-1">
                      {medications.filter((med) => !med.active).length}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Inactive</div>
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
