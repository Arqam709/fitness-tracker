import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import type { FoodEntry, FormData } from "../types";
import Card from "../Components/ui/Card";
import {
  mealColors,
  mealIcons,
  mealTypeOptions,
  quickActivitiesFoodLog,
} from "../assets/assets";
import Button from "../Components/ui/Button";
import {
  Loader2Icon,
  PlusIcon,
  SparkleIcon,
  Trash2Icon,
  UtensilsCrossedIcon,
} from "lucide-react";
import Input from "../Components/ui/Input";
import Select from "../Components/ui/Select";
import toast from "react-hot-toast";
import api from "../configs/api";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/** ✅ Normalize any Strapi shape to your frontend FoodEntry shape */
const normalizeFood = (item: any): FoodEntry => {
  // Strapi v4: { id, attributes: {...} }
  const attrs = item?.attributes ?? item ?? {};

  return {
    // keep id consistent
    id: item?.id ?? attrs?.id ?? attrs?.documentId ?? undefined,

    // common fields
    name: attrs?.name ?? "",
    calories: Number(attrs?.calories ?? 0),

    // mealType might be stored as mealType OR mealtype
    mealType: (attrs?.mealType ?? attrs?.mealtype ?? "breakfast") as MealType,

    // date might be missing, so fallback to createdAt day
    date:
      attrs?.date ??
      (attrs?.createdAt
        ? new Date(attrs.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]),

    // keep extra fields if you have them
    createdAt: attrs?.createdAt,
    updatedAt: attrs?.updatedAt,

    // some people stored documentId - keep it if exists
    documentId: attrs?.documentId,
  } as any;
};

const Foodlog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext();

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    calories: 0,
    mealType: "breakfast",
  });

  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  /** ✅ Always normalize logs before using them */
  const normalizedAllFood: FoodEntry[] = useMemo(() => {
    if (!Array.isArray(allFoodLogs)) return [];
    return allFoodLogs.map(normalizeFood);
  }, [allFoodLogs]);

  /** ✅ show only today's items */
  useEffect(() => {
    const todayEntries = normalizedAllFood.filter((e: any) => e.date === today);
    setEntries(todayEntries);
  }, [normalizedAllFood, today]);

  const totalCalories = useMemo(() => {
    return entries.reduce((sum, e: any) => sum + Number(e.calories || 0), 0);
  }, [entries]);

  const groupedEntries: Record<MealType, FoodEntry[]> = useMemo(() => {
    return entries.reduce((acc, entry: any) => {
      const meal = (entry.mealType ?? "breakfast") as MealType;
      if (!acc[meal]) acc[meal] = [];
      acc[meal].push(entry);
      return acc;
    }, {} as Record<MealType, FoodEntry[]>);
  }, [entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || Number(formData.calories) <= 0 || !formData.mealType) {
      return toast.error("please enter valid data");
    }

    try {
      const payload = {
        name: formData.name,
        calories: Number(formData.calories),
        mealType: formData.mealType,
        date: today,
      };

      const res = await api.post("/api/foodlogs", { data: payload });

      // Strapi v4 returns { data: { id, attributes } }
      const saved = res?.data?.data
        ? normalizeFood(res.data.data)
        : normalizeFood(res.data);

      // ✅ update global store
      setAllFoodLogs((prev: any) => (Array.isArray(prev) ? [...prev, saved] : [saved]));

      // reset
      setFormData({ name: "", calories: 0, mealType: "breakfast" });
      setShowForm(false);
      toast.success("Food entry added");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message);
    }
  };

  const handleDelete = async (documentId: string) => {
  try {
    const ok = window.confirm("Are you sure you want to delete this entry?");
    if (!ok) return;

    await api.delete(`/api/foodlogs/${documentId}`);

    setAllFoodLogs((prev: any) =>
      Array.isArray(prev) ? prev.filter((e: any) => e.documentId !== documentId) : []
    );

    toast.success("Deleted");
  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.error?.message || error?.message);
  }
};


  const handleQuickAdd = (mealType: string) => {
    setFormData((p) => ({ ...p, mealType: mealType as any }));
    setShowForm(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setLoading(true);

  try {
    const fd = new FormData();

    // ✅ MUST match backend: files?.image
    fd.append("image", file);

    // ✅ don't set Content-Type manually
    const { data } = await api.post("/api/image-analysis", fd);

    const result = data?.result;

    // decide meal type by time
    let mealType: MealType = "breakfast";
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 16) mealType = "lunch";
    else if (hour >= 16 && hour < 18) mealType = "snack";
    else if (hour >= 18) mealType = "dinner";

    if (!result?.name || result?.calories == null) {
      toast.error("AI returned missing data");
      return;
    }

    const caloriesNum = Number(result.calories);
    if (!Number.isFinite(caloriesNum)) {
      toast.error("AI returned invalid calories");
      return;
    }

    const payload = {
      name: String(result.name),
      calories: caloriesNum,
      mealType,
      date: today,
    };

    const res = await api.post("/api/foodlogs", { data: payload });
    const saved = res?.data?.data ? normalizeFood(res.data.data) : normalizeFood(res.data);

    setAllFoodLogs((prev: any) => (Array.isArray(prev) ? [...prev, saved] : [saved]));

    if (inputRef.current) inputRef.current.value = "";
    toast.success("Added from AI snap");
  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.error?.message || error?.message || "Analysis failed");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="page-container">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Food Log
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track your daily intake
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Today's Totals
            </p>

            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalCalories} kcal
            </p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {/* ================= QUICK ADD ================= */}
        {!showForm && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
                QUICK ADD
              </h3>

              <div className="flex flex-wrap gap-2">
                {quickActivitiesFoodLog.map((activity) => (
                  <button
                    key={activity.name}
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-colors
                      bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700
                      text-slate-700 dark:text-slate-200"
                    onClick={() => handleQuickAdd(activity.name)}
                    type="button"
                  >
                    {activity.emoji} {activity.name}
                  </button>
                ))}
              </div>
            </Card>

            <Button className="w-full" onClick={() => setShowForm(true)}>
              <PlusIcon className="size-5" />
              Add food entry
            </Button>

            <Button className="w-full" onClick={() => inputRef.current?.click()}>
              <SparkleIcon className="size-5" />
              AI Food Snap
            </Button>

            <input
              onChange={handleImageChange}
              type="file"
              accept="image/*"
              hidden
              ref={inputRef}
            />

            {loading && (
              <div className="fixed inset-0 z-100 flex items-center justify-center
                  bg-slate-100/50 backdrop-blur dark:bg-slate-900/50">
                <Loader2Icon className="size-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* ================= ADD FORM ================= */}
        {showForm && (
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              New food entry
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Food Name"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v.toString() })}
                placeholder="e.g., Grilled chicken salad"
                required
              />

              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(v) => setFormData({ ...formData, calories: Number(v) })}
                placeholder="e.g., 350"
                required
                min={1}
              />

              <Select
                label="meal type"
                value={formData.mealType}
                onChange={(v) => setFormData({ ...formData, mealType: v.toString() as any })}
                options={mealTypeOptions}
                placeholder="Select meal type"
                required
              />

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", calories: 0, mealType: "breakfast" });
                  }}
                >
                  Cancel
                </Button>

                <Button type="submit" className="flex-1">
                  ADD ENTRY
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ================= ENTRIES LIST ================= */}
        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossedIcon className="size-8 text-slate-400 dark:text-slate-500" />
            </div>

            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
              No food logged today
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Start tracking your meals to stay on target
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mealType) => {
              if (!groupedEntries[mealType] || groupedEntries[mealType].length === 0) return null;

              const MealIcon = (mealIcons as any)[mealType];

              const mealCalories = groupedEntries[mealType].reduce(
                (sum, e: any) => sum + Number(e.calories || 0),
                0
              );

              return (
                <Card key={mealType}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          (mealColors as any)[mealType]
                        }`}
                      >
                        <MealIcon className="size-5" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white capitalize">
                          {mealType}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {groupedEntries[mealType].length} items
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {mealCalories} kcal
                    </p>
                  </div>

                  <div className="space-y-2">
                    {groupedEntries[mealType].map((entry: any) => (
                      <div key={entry.id} className="food-entry-item">
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 dark:text-slate-200">
                            {entry.name}
                          </p>
                          <p className="text-sm text-slate-400">{entry.date}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {entry.calories} kcal
                          </span>

                          <button
                            onClick={() => handleDelete(entry.documentId)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            type="button"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Foodlog;




