import { useMemo } from "react";
import { useAppContext } from "../Context/AppContext";
import { getMotivationalMessage } from "../assets/assets";
import type { ActivityEntry, FoodEntry } from "../types";
import Card from "../Components/ui/Card";
import ProgressBar from "../Components/ui/ProgressBar";
import {
  ActivityIcon,
  FlameIcon,
  HamburgerIcon,
  ZapIcon,
  ScaleIcon,
} from "lucide-react";
import CaloriesChart from "../Components/CaloriesChart";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/** ✅ Normalize Strapi food */
const normalizeFood = (item: any): FoodEntry => {
  const attrs = item?.attributes ?? item ?? {};
  const createdAt = attrs?.createdAt ?? item?.createdAt;

  return {
    id: item?.id ?? attrs?.id,
    documentId: attrs?.documentId ?? item?.documentId,
    name: attrs?.name ?? "",
    calories: Number(attrs?.calories ?? 0),
    mealType: (attrs?.mealType ?? attrs?.mealtype ?? "breakfast") as MealType,
    date:
      attrs?.date ??
      (createdAt ? new Date(createdAt).toISOString().split("T")[0] : ""),
    createdAt,
    updatedAt: attrs?.updatedAt ?? item?.updatedAt,
  } as any;
};

/** ✅ Normalize Strapi activity */
const normalizeActivity = (item: any): ActivityEntry => {
  const attrs = item?.attributes ?? item ?? {};
  const createdAt = attrs?.createdAt ?? item?.createdAt;

  return {
    id: item?.id ?? attrs?.id,
    documentId: attrs?.documentId ?? item?.documentId,
    name: attrs?.name ?? "",
    duration: Number(attrs?.duration ?? 0),
    calories: Number(attrs?.calories ?? 0),
    // ✅ if you don't store date in DB, derive it from createdAt
    date:
      attrs?.date ??
      (createdAt ? new Date(createdAt).toISOString().split("T")[0] : ""),
    createdAt,
    updatedAt: attrs?.updatedAt ?? item?.updatedAt,
  } as any;
};

const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext();

  const age = (user as any)?.age ?? (user as any)?.Age ?? null;
  const weight = (user as any)?.weight ?? (user as any)?.Weight ?? null;
  const height = (user as any)?.height ?? (user as any)?.Height ?? null;

  const DAILY_CALORIE_LIMIT =
    (user as any)?.dailyCalorieIntake ??
    (user as any)?.dailyCaloriesIntake ??
    2000;

  const DAILY_BURN_GOAL =
    (user as any)?.dailyCalorieBurn ??
    (user as any)?.dailyCaloriesBurn ??
    400;

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // ✅ Normalize everything first
  const normalizedFood = useMemo(() => {
    if (!Array.isArray(allFoodLogs)) return [];
    return allFoodLogs.map(normalizeFood);
  }, [allFoodLogs]);

  const normalizedActivity = useMemo(() => {
    if (!Array.isArray(allActivityLogs)) return [];
    return allActivityLogs.map(normalizeActivity);
  }, [allActivityLogs]);

  // ✅ Now filter correctly
  const todayFood = useMemo(
    () => normalizedFood.filter((f) => f.date === today),
    [normalizedFood, today]
  );

  const todayActivity = useMemo(
    () => normalizedActivity.filter((a) => a.date === today),
    [normalizedActivity, today]
  );

  const caloriesConsumed = useMemo(() => {
    return todayFood.reduce((sum, item) => sum + Number(item.calories || 0), 0);
  }, [todayFood]);

  const remainingCalories = Number(DAILY_CALORIE_LIMIT) - caloriesConsumed;

  const activeMinutes = useMemo(() => {
    return todayActivity.reduce(
      (sum, item) => sum + Number(item.duration || 0),
      0
    );
  }, [todayActivity]);

  const totalBurned = useMemo(() => {
    return todayActivity.reduce(
      (sum, item) => sum + Number(item.calories || 0),
      0
    );
  }, [todayActivity]);

  const motivation = getMotivationalMessage(
    caloriesConsumed,
    activeMinutes,
    Number(DAILY_CALORIE_LIMIT)
  );

  const consumedPercent = Math.round(
    (caloriesConsumed / Number(DAILY_CALORIE_LIMIT)) * 100
  );
  const burnedPercent = Math.round(
    (totalBurned / Number(DAILY_BURN_GOAL)) * 100
  );

  const bmi = useMemo(() => {
    if (!weight || !height) return null;
    const h = Number(height) / 100;
    if (!h) return null;
    return (Number(weight) / (h * h)).toFixed(1);
  }, [weight, height]);

  return (
    <div className="page-container">
      {/* ===================== HEADER ===================== */}
      <div className="dashboard-header">
        <p className="text-emerald-100 text-sm font-medium">Welcome back</p>

        <h1 className="text-2xl font-bold mt-1">
          {`Hi there! 👋 ${user?.username ?? ""}`}
        </h1>

        {/* Motivation card */}
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{motivation.emoji}</span>
            <p className="text-white font-medium">{motivation.text}</p>
          </div>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="dashboard-grid">
        {/* ===================== CALORIES + BURN CARD ===================== */}
        <Card className="shadow-lg col-span-2">
          {/* ---------- Calories Consumed Header ---------- */}
          <div className="flex items-center justify-between mb-4">
            {/* Left: icon + label + value */}
            <div className="flex items-center gap-3">
              <HamburgerIcon className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-sm text-slate-500">Calories Consumed</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {caloriesConsumed}
                </p>
              </div>
            </div>

            {/* Right: limit */}
            <div className="text-right">
              <p className="text-sm text-slate-500">Limit</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {DAILY_CALORIE_LIMIT}
              </p>
            </div>
          </div>

          {/* ---------- Calories Progress Bar ---------- */}
          <ProgressBar value={caloriesConsumed} max={Number(DAILY_CALORIE_LIMIT)} />

          {/* ---------- Remaining + Percent ---------- */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              {remainingCalories >= 0
                ? `${remainingCalories} kcal remaining`
                : `${Math.abs(remainingCalories)} kcal over`}
            </span>

            <span className="text-sm text-slate-400">{consumedPercent}%</span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-5" />

          {/* ---------- Calories Burned Header ---------- */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FlameIcon className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm text-slate-500">Calories Burned</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {totalBurned}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Goal</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {DAILY_BURN_GOAL}
              </p>
            </div>
          </div>

          <ProgressBar value={totalBurned} max={Number(DAILY_BURN_GOAL)} />

          <div className="mt-4 flex justify-end">
            <span className="text-sm text-slate-400">{burnedPercent}%</span>
          </div>
        </Card>

        {/* stats row */}
        <div className="dashboard-card-grid">
          {/* Active minutes */}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-slate-500">Active</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {activeMinutes}
            </p>
            <p className="text-sm text-slate-400">minutes today</p>
          </Card>

          {/* Workouts count */}
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ZapIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-slate-500">WorkOuts</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {todayActivity.length}
            </p>
            <p className="text-sm text-slate-400">activities logged</p>
          </Card>

          {/* Goal card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your Goal
                </p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">
                  {user?.goal
                    ? user.goal === "lose"
                      ? "🔥 Lose Weight"
                      : user.goal === "maintain"
                      ? "⚖️ Maintain Weight"
                      : user.goal === "gain"
                      ? "💪 Gain Muscle"
                      : "Not set"
                    : "Not set"}
                </p>
              </div>
            </div>
          </Card>

          {/* Body Metrics card */}
         <Card>
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
      <ScaleIcon className="w-5 h-5 text-purple-500" />
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Body Metrics
    </p>
  </div>

  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <p className="text-slate-600 dark:text-slate-300">Age</p>
      <p className="font-semibold text-slate-800 dark:text-white">
        {age ?? "--"} yrs
      </p>
    </div>

    <div className="flex justify-between items-center">
      <p className="text-slate-600 dark:text-slate-300">Weight</p>
      <p className="font-semibold text-slate-800 dark:text-white">
        {weight ?? "--"} kg
      </p>
    </div>

    <div className="flex justify-between items-center">
      <p className="text-slate-600 dark:text-slate-300">Height</p>
      <p className="font-semibold text-slate-800 dark:text-white">
        {height ?? "--"} cm
      </p>
    </div>

    <div className="flex justify-between items-center">
      <p className="text-slate-600 dark:text-slate-300">BMI</p>
      <p className="font-semibold text-emerald-500">{bmi ?? "--"}</p>
    </div>

    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 relative">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-400"
        style={{ width: "60%" }}
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
      </div>
    </div>
  </div>
</Card>

          {/* Today's Summary */}
          <Card className="shadow-lg">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">
              Today&apos;s Summary
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Meals logged
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {todayFood.length}
                </p>
              </div>

              <div className="py-3 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total calories
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {caloriesConsumed} kcal
                </p>
              </div>

              <div className="py-3 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Active time
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {activeMinutes} min
                </p>
              </div>
            </div>
          </Card>

          {/* Chart */}
          <Card className="col-span-2">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
              This weeks progress
            </h3>
            <CaloriesChart />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


 

