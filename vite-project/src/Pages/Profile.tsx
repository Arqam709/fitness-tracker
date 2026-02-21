import { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { useTheme } from "../Context/ThemeContext";
import {
  Calendar,
  LogOutIcon,
  MoonIcon,
  Scale,
  SunIcon,
  Target,
  User,
} from "lucide-react";
import type { ProfileFormData, UserData } from "../types";
import Card from "../Components/ui/Card";
import Button from "../Components/ui/Button";
import { goalLabels, goalOptions } from "../assets/assets";
import Input from "../Components/ui/Input";
import Select from "../Components/ui/Select";
import toast from "react-hot-toast";
import api from "../configs/api"; // ✅ real api

const Profile = () => {
  const { user, logout, fetchUser, allFoodLogs, allActivityLogs } =
    useAppContext();
  const { theme, toggleTheme } = useTheme();

  const [isEditing, setISEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  });

  // ✅ Support Strapi capitalized fields + old lowercase fields
  const age = (user as any)?.age ?? (user as any)?.Age ?? 0;
  const weight = (user as any)?.weight ?? (user as any)?.Weight ?? 0;
  const height = (user as any)?.height ?? (user as any)?.Height ?? 0;

  const dailyIntake =
    (user as any)?.dailyCalorieIntake ??
    (user as any)?.dailyCaloriesIntake ??
    2000;

  const dailyBurn =
    (user as any)?.dailyCalorieBurn ??
    (user as any)?.dailyCaloriesBurn ??
    400;

  const fetchUserData = () => {
    if (user) {
      setFormData({
        age: Number(age) || 0,
        weight: Number(weight) || 0,
        height: Number(height) || 0,
        goal: (user as any)?.goal || "maintain",
        dailyCalorieIntake: Number(dailyIntake) || 2000,
        dailyCalorieBurn: Number(dailyBurn) || 400,
      });
    }
  };

  useEffect(() => {
  console.log("allFoodLogs example:", allFoodLogs[0]);
}, [allFoodLogs]);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSave = async () => {
    try {
      // ✅ Build payload that matches your Strapi user fields
      // (Age/Weight/Height are capital in your API)
      const updates: Partial<UserData> & any = {
        Age: Number(formData.age),
        Weight: Number(formData.weight),
        Height: formData.height ? Number(formData.height) : null,
        goal: formData.goal as "lose" | "maintain" | "gain",
        dailyCaloriesIntake: Number(formData.dailyCalorieIntake),
        dailyCaloriesBurn: Number(formData.dailyCalorieBurn),
      };

      // ✅ Update user in Strapi (same style as your onboarding flow)
      await api.put(`/api/users/${user?.id}`, updates);

      // ✅ refetch user so UI updates
      await fetchUser(user?.token || "");
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message || "failed to update profile");
    }
    setISEditing(false);
  };

  const getStats = () => {
    const totalFoodEnteries = allFoodLogs?.length || 0;
    const totalActivities = allActivityLogs?.length || 0;
    return { totalFoodEnteries, totalActivities };
  };

  const stats = getStats();

  if (!user) return null;

  return (
    <div className="page-container">
      {/* header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your settings
        </p>
      </div>

      <div className="profile-content">
        {/* left col */}
        <Card>
          {/* card title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <User className="size-6 text-white" />
            </div>
            <div>
              <h2 className="txt-lg font-semibol text-slate-800 dark:text-white">
                Your Profile
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Member since{" "}
                {new Date(user?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(v) => setFormData({ ...formData, age: Number(v) })}
                min={13}
                max={120}
              />

              <Input
                label="Weight"
                type="number"
                value={formData.weight}
                onChange={(v) =>
                  setFormData({ ...formData, weight: Number(v) })
                }
                min={20}
                max={300}
              />

              <Input
                label="Height"
                type="number"
                value={formData.height}
                onChange={(v) =>
                  setFormData({ ...formData, height: Number(v) })
                }
                min={100}
                max={250}
              />

              <Select
                label="Fitness Goal"
                value={formData.goal as string}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    goal: v as "lose" | "maintain" | "gain",
                  })
                }
                options={goalOptions}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setISEditing(false);
                    setFormData({
                      age: Number(age) || 0,
                      weight: Number(weight) || 0,
                      height: Number(height) || 0,
                      goal: (user as any)?.goal || "maintain",
                      dailyCalorieIntake: Number(dailyIntake) || 2000,
                      dailyCalorieBurn: Number(dailyBurn) || 400,
                    });
                  }}
                >
                  Cancel
                </Button>

                <Button className="flex-1" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* age */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                  <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 fkex items-center justify-center">
                    <Calendar className="size-4.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="">
                    <p className="text-sm test-slate-500 dark:text-slate-400">
                      Age
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white ">
                      {age || "--"} years
                    </p>
                  </div>
                </div>

                {/* weight */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                  <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 fkex items-center justify-center">
                    <Scale className="size-4.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="">
                    <p className="text-sm test-slate-500 dark:text-slate-400">
                      Weight
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white ">
                      {weight || "--"} kg
                    </p>
                  </div>
                </div>

                {/* height */}
                {Number(height) !== 0 && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                    <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/20 fkex items-center justify-center">
                      <User className="size-4.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="">
                      <p className="text-sm test-slate-500 dark:text-slate-400">
                        Height
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white ">
                        {height || "--"} cms
                      </p>
                    </div>
                  </div>
                )}

                {/* Goal */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                  <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 fkex items-center justify-center">
                    <Target className="size-4.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="">
                    <p className="text-sm test-slate-500 dark:text-slate-400">
                      Goal
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white ">
                      {goalLabels[((user as any)?.goal || "gain") as "lose" | "maintain" | "gain"]}

                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => setISEditing(true)}
                className="w-full mt-4"
              >
                Edit Profile
              </Button>
            </>
          )}
        </Card>

        {/* Right col */}
        <div className="space-y-4">
          {/* stats card */}
          <Card>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              Your Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalFoodEnteries}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Food enteries
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalActivities}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Activities
                </p>
              </div>
            </div>
          </Card>

          {/* toggle theme button for phone */}
          <div className="lg:hidden">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              {theme === "light" ? (
                <MoonIcon className="size-5" />
              ) : (
                <SunIcon className="size-5" />
              )}
              <span className="text-base">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>
          </div>

          {/* logout button */}
          <Button
            variant="danger"
            onClick={logout}
            className="w-full ring ring-red-300 hover:ring-2"
          >
            <LogOutIcon className="size-4 " />
            logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

