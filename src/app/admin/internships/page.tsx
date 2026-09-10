"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  Building2,
  Calendar,
  Users,
  Plus,
  Edit,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  FileCheck,
  Search,
  Sparkles,
  X,
  Save,
  ShieldCheck,
  Tag
} from "lucide-react";
import { toast } from "sonner";

interface LocationItem {
  id: string;
  city_name: string;
  state: string;
  address: string;
  status: string; // 'active' | 'coming_soon'
  default_fee_amount: number | null;
  facility_partner_name: string;
}

interface CohortItem {
  id: string;
  location_id: string;
  cohort_name: string;
  start_date: string;
  end_date: string;
  late_join_deadline: string;
  max_capacity: number;
  current_enrolled: number;
  fee_amount: number;
  status: string; // 'open' | 'active_late_join' | 'in_progress' | 'completed' | 'full'
  location?: LocationItem;
}

const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: "loc-abuja", city_name: "Abuja", state: "FCT", address: "NIC Clinical Skills Centre, Central Business District, Abuja", status: "active", default_fee_amount: 200000, facility_partner_name: "NIC Clinical Skills Centre" },
  { id: "loc-lagos", city_name: "Lagos", state: "Lagos State", address: "NIC Affiliated Hospital Partner, Ikeja, Lagos", status: "coming_soon", default_fee_amount: 150000, facility_partner_name: "" },
  { id: "loc-uyo", city_name: "Uyo", state: "Akwa Ibom State", address: "NIC Training Facility Network, Uyo", status: "coming_soon", default_fee_amount: 200000, facility_partner_name: "" },
  { id: "loc-osun", city_name: "Osun", state: "Osun State", address: "NIC Partner Network, Osogbo", status: "coming_soon", default_fee_amount: null, facility_partner_name: "" },
  { id: "loc-enugu", city_name: "Enugu", state: "Enugu State", address: "NIC Partner Network, Enugu", status: "coming_soon", default_fee_amount: null, facility_partner_name: "" },
  { id: "loc-kaduna", city_name: "Kaduna", state: "Kaduna State", address: "NIC Partner Network, Kaduna", status: "coming_soon", default_fee_amount: null, facility_partner_name: "" }
];

export default function AdminInternshipsPage() {
  const [activeTab, setActiveTab] = useState<"cohorts" | "locations">("cohorts");
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // New Cohort Form State
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [cohortName, setCohortName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [feeAmount, setFeeAmount] = useState<number | "">("");
  const [maxCapacity, setMaxCapacity] = useState(20);

  // Location Edit Form State
  const [editingLocation, setEditingLocation] = useState<Partial<LocationItem> | null>(null);

  const effectiveLocations = locations.length > 0 ? locations : DEFAULT_LOCATIONS;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: locData, error: locErr } = await supabase
        .from("internship_locations")
        .select("*")
        .order("city_name", { ascending: true });

      if (!locErr && locData) {
        setLocations(locData);
      }

      const { data: cohortData, error: cohortErr } = await supabase
        .from("internship_cohorts")
        .select("*, location:internship_locations(*)")
        .order("start_date", { ascending: true });

      if (cohortErr) console.error("Cohort fetch error:", cohortErr);
      setCohorts(cohortData || []);
    } catch (err: any) {
      toast.error("Failed to load internship data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Auto calculate 3-month end date and 30-day late join deadline when startDate changes
  const handleStartDateChange = (dateVal: string) => {
    setStartDate(dateVal);
    if (!dateVal) return;

    const start = new Date(dateVal);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 3);

    const lateJoin = new Date(start);
    lateJoin.setDate(lateJoin.getDate() + 30);
  };

  const handleOpenNewCohort = () => {
    const list = effectiveLocations;
    const abuja = list.find((l) => l.city_name === "Abuja");
    const locId = abuja ? abuja.id : list[0]?.id || "";
    const locFee = abuja?.default_fee_amount || 200000;

    setSelectedLocationId(locId);
    setFeeAmount(locFee);
    setCohortName("Abuja Q4 2026 Cohort");
    setStartDate("2026-10-01");
    setMaxCapacity(20);
    setIsCohortModalOpen(true);
  };

  const handleLocationSelect = (locId: string) => {
    setSelectedLocationId(locId);
    const loc = effectiveLocations.find((l) => l.id === locId);
    if (loc) {
      setCohortName(`${loc.city_name} Cohort`);
      setFeeAmount(loc.default_fee_amount || 150000);
    }
  };

  const handleCreateCohort = async () => {
    if (!selectedLocationId || !startDate || !cohortName || !feeAmount) {
      toast.error("Please fill in location, cohort name, start date, and fee.");
      return;
    }

    try {
      const supabase = createClient();
      let targetLocId = selectedLocationId;

      // Handle fallback location insertion if selected from default array
      if (selectedLocationId.startsWith("loc-")) {
        const defLoc = DEFAULT_LOCATIONS.find((l) => l.id === selectedLocationId);
        if (defLoc) {
          const { data: newLoc, error: locErr } = await supabase
            .from("internship_locations")
            .upsert(
              {
                city_name: defLoc.city_name,
                state: defLoc.state,
                address: defLoc.address,
                status: defLoc.status,
                default_fee_amount: defLoc.default_fee_amount,
                facility_partner_name: defLoc.facility_partner_name
              },
              { onConflict: "city_name" }
            )
            .select()
            .single();

          if (!locErr && newLoc) {
            targetLocId = newLoc.id;
          }
        }
      }

      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 3);

      const lateJoin = new Date(start);
      lateJoin.setDate(lateJoin.getDate() + 30);

      const endDateStr = end.toISOString().split("T")[0];
      const lateJoinStr = lateJoin.toISOString().split("T")[0];

      const { error } = await supabase.from("internship_cohorts").insert({
        location_id: targetLocId,
        cohort_name: cohortName,
        start_date: startDate,
        end_date: endDateStr,
        late_join_deadline: lateJoinStr,
        max_capacity: maxCapacity,
        current_enrolled: 0,
        fee_amount: feeAmount,
        status: "open"
      });

      if (error) throw error;
      toast.success(`Successfully created 3-Month Cohort (${cohortName})!`);
      setIsCohortModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to create cohort: " + err.message);
    }
  };

  const handleSaveLocation = async () => {
    if (!editingLocation?.city_name || !editingLocation?.state) {
      toast.error("City name and state are required.");
      return;
    }

    try {
      const supabase = createClient();
      const payload = {
        city_name: editingLocation.city_name,
        state: editingLocation.state,
        address: editingLocation.address || "",
        status: editingLocation.status || "coming_soon",
        default_fee_amount: editingLocation.default_fee_amount || null,
        facility_partner_name: editingLocation.facility_partner_name || ""
      };

      if (editingLocation.id && !editingLocation.id.startsWith("loc-")) {
        await supabase.from("internship_locations").update(payload).eq("id", editingLocation.id);
      } else {
        await supabase.from("internship_locations").upsert(payload, { onConflict: "city_name" });
      }

      toast.success("Location saved successfully!");
      setIsLocationModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Error saving location: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-emerald-600" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Clinical Internship Cohorts & Scheduling
            </h1>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Manage quarterly 3-month clinical internship placements (Capped at 20 students per cohort, 30-day late join window).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingLocation({ status: "coming_soon" });
              setIsLocationModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg border bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            + Add Location
          </button>
          <button
            onClick={handleOpenNewCohort}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Schedule 3-Month Cohort
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Locations</span>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            {effectiveLocations.filter((l) => l.status === "active").length} / {effectiveLocations.length}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Cohorts</span>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            {cohorts.length}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Max Cohort Capacity</span>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            20 Students
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Late Join Window</span>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            30 Days
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("cohorts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "cohorts"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Scheduled Cohorts ({cohorts.length})
        </button>
        <button
          onClick={() => setActiveTab("locations")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "locations"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Locations & Fee Matrix ({effectiveLocations.length})
        </button>
      </div>

      {/* TAB 1: COHORTS LIST */}
      {activeTab === "cohorts" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading internship cohorts...</div>
          ) : cohorts.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500 space-y-3">
              <p>No active cohorts scheduled yet in database.</p>
              <button
                onClick={handleOpenNewCohort}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Schedule First 3-Month Cohort
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {cohorts.map((ch) => {
                const isFull = ch.current_enrolled >= ch.max_capacity;
                const startDateObj = new Date(ch.start_date);
                const endDateObj = new Date(ch.end_date);
                const lateDeadlineObj = new Date(ch.late_join_deadline);
                const now = new Date();

                const isOngoingLateJoin = now >= startDateObj && now <= lateDeadlineObj && !isFull;

                return (
                  <div
                    key={ch.id}
                    className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ch.location?.city_name || "Center"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">
                          ₦{Number(ch.fee_amount).toLocaleString()}
                        </span>
                        {isFull ? (
                          <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold">
                            Full (20/20)
                          </span>
                        ) : isOngoingLateJoin ? (
                          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-600" /> Late Join Open until {lateDeadlineObj.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-bold">
                            Open for Enrolment
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{ch.cohort_name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <strong>Duration (3 Mos):</strong> {startDateObj.toLocaleDateString()} – {endDateObj.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <strong>Capacity:</strong> {ch.current_enrolled} / {ch.max_capacity} Enrolled
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Late Join Window</span>
                        <span className="text-xs font-bold text-slate-700">30 Days ({lateDeadlineObj.toLocaleDateString()})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOCATIONS & PRICING MATRIX */}
      {activeTab === "locations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {effectiveLocations.map((loc) => {
              const isActive = loc.status === "active";
              return (
                <div key={loc.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{loc.state}</span>
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        ● Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                        ⏳ Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{loc.city_name}</h3>
                  <p className="text-xs text-slate-600">{loc.address || "Training partner location being finalized."}</p>

                  <div className="border-t pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Location Fee:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {loc.default_fee_amount ? `₦${Number(loc.default_fee_amount).toLocaleString()}` : "TBD (Pending)"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingLocation({ ...loc });
                      setIsLocationModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-50 border hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-2"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Location & Pricing
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE COHORT MODAL */}
      {isCohortModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col my-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                Schedule 3-Month Internship Cohort
              </h3>
              <button onClick={() => setIsCohortModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Internship Location *</label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={selectedLocationId}
                    onChange={(e) => handleLocationSelect(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                  >
                    <option value="" disabled>Select Internship Location...</option>
                    {effectiveLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.city_name} ({loc.state}) - {loc.default_fee_amount ? `₦${Number(loc.default_fee_amount).toLocaleString()}` : "Fee TBD"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLocation({ status: "coming_soon" });
                      setIsLocationModalOpen(true);
                    }}
                    className="px-3 py-2 bg-slate-100 border hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 whitespace-nowrap"
                    title="Add a new location"
                  >
                    + New Location
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Cohort Name *</label>
                <input
                  type="text"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  placeholder="e.g. Abuja Oct-Dec 2026 Cohort"
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Max Capacity</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    disabled
                    className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-slate-50 font-bold text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400">Strict 20-student limit</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Cohort Fee (₦) *</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  placeholder="200000"
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Automated 3-Month Cohort Schedule Rules:</p>
                <p>• <strong>Duration:</strong> 3 Months (Auto-calculated end date)</p>
                <p>• <strong>Late-Join Window:</strong> 30 Days after start date if capacity &lt; 20</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setIsCohortModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCohort}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
              >
                <Save className="h-4 w-4" /> Create Cohort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT LOCATION & PRICING MODAL */}
      {isLocationModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col my-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                {editingLocation.id ? `Edit Location (${editingLocation.city_name})` : "Add New Location"}
              </h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">City Name *</label>
                  <input
                    type="text"
                    value={editingLocation.city_name || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, city_name: e.target.value })}
                    placeholder="e.g. Lagos"
                    className="w-full mt-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">State *</label>
                  <input
                    type="text"
                    value={editingLocation.state || ""}
                    onChange={(e) => setEditingLocation({ ...editingLocation, state: e.target.value })}
                    placeholder="e.g. Lagos State"
                    className="w-full mt-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Location Status</label>
                <select
                  value={editingLocation.status || "coming_soon"}
                  onChange={(e) => setEditingLocation({ ...editingLocation, status: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-slate-900"
                >
                  <option value="active">Active & Open for Booking</option>
                  <option value="coming_soon">Under Preparation / Coming Soon</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Default Location Fee (₦)</label>
                <input
                  type="number"
                  value={editingLocation.default_fee_amount ?? ""}
                  onChange={(e) =>
                    setEditingLocation({
                      ...editingLocation,
                      default_fee_amount: e.target.value ? Number(e.target.value) : null
                    })
                  }
                  placeholder="e.g. 150000 (Leave blank if TBD)"
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">Abuja: ₦200k, Lagos: ₦150k, Uyo: ₦200k, Others TBD</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Address / Partner Facility</label>
                <textarea
                  rows={2}
                  value={editingLocation.address || ""}
                  onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                  placeholder="Facility address details..."
                  className="w-full mt-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
              >
                <Save className="h-4 w-4" /> Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

