import { useEffect, useState } from "react"; 
// Import React hooks: useEffect (for side effects) and useState (for state management)

import { useAppContext } from "../Context/AppContext";
// Import your global context to access activity logs

import type { ActivityEntry } from "../types";
// Import ActivityEntry type for TypeScript safety

import Card from "../Components/ui/Card";
// UI wrapper component for consistent styling

import { quickActivities } from "../assets/assets";
// Predefined list of quick activities with name, emoji, and calorie rate

import { ActivityIcon, DumbbellIcon, PlusIcon, TimerIcon, Trash2Icon } from "lucide-react";
// Import icons used in the UI

import Input from "../Components/ui/Input";
// Custom input component

import Button from "../Components/ui/Button";
// Custom button component

import toast from "react-hot-toast";
// For showing success/error messages

import api from "../configs/api";
// Fake API used to simulate backend requests

const Activitylog = () => {
// Functional React component for Activity Log page

  const { allActivityLogs, setAllActivityLogs } = useAppContext();
  // Get global activity logs and setter function from context

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  // Local state: stores only today's activities

  const [showForm, setShowForm] = useState(false);
  // Controls whether the add-activity form is visible

  const [formData, setFormData] = useState({ name: "", duration: 0, calories: 0 });
  // Stores input values for the activity form

  const [error, setError] = useState("");
  // Stores validation error messages

  const today = new Date().toISOString().split("T")[0];
  // Get today's date in YYYY-MM-DD format

  const loadActivities = () => {
  // Function to filter today's activities from global logs

    const todayActivities = allActivityLogs.filter(
      (a: ActivityEntry) => a.createdAt?.split("T")[0] === today
    );
    // Keep only activities created today

    setActivities(todayActivities);
    // Store filtered activities in local state
  };

  useEffect(() => {
    loadActivities();
  }, [allActivityLogs]);
  // Whenever global logs change, reload today's activities

  const totalMinutes: number = activities.reduce(
    (sum, a) => sum + Number(a.duration || 0),
    0
  );
  // Calculate total minutes exercised today

  const handleQUickAdd = (activity: { name: string; rate: number }) => {
  // Called when user clicks a quick-add activity button

    setFormData({
      name: activity.name,
      duration: 30,
      calories: 30 * activity.rate,
    });
    // Pre-fill form with default 30 minutes and auto-calculated calories

    setShowForm(true);
    // Open the form
  };

  const handleDurationChange = (val: string | number) => {
  // Called when user changes duration input

    const duration = Number(val);
    // Convert input to number

    const activity = quickActivities.find(a => a.name === formData.name);
    // Find matching activity to get calorie burn rate

    let calories = formData.calories;
    // Start with existing calories

    if (activity) {
      calories = duration * activity.rate;
    }
    // If activity exists, recalculate calories based on duration

    setFormData({ ...formData, duration, calories });
    // Update form state
  };

  const handleSubmit = async (e: React.FormEvent) => {
  // Runs when form is submitted

    e.preventDefault();
    // Prevent page reload

    if (!formData.name.trim() || formData.duration <= 0) {
      return toast("please enter valid data");
    }
    // Basic validation: name must exist and duration must be > 0

    try {
      const {data} =  await api.post('/api/activitylogs',{data:formData})   // Send activity to mock API

      setAllActivityLogs(prev => [...prev, data]);
      // Add new activity to global context

      setFormData({ name: "", duration: 0, calories: 0 });
      // Reset form

      setShowForm(false);
      // Close form
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message);
      // Show error message if API fails
    }
  };

  const handleDelete = async(documentId: string) => {
    try {
      const confirm = window.confirm('R us sure you want to delete this entry?')

      if(!confirm) return;
      await api.delete(`/api/activitylogs/${documentId}`)
      setAllActivityLogs(prev => prev.filter((a) =>a.documentId !== documentId))
    } catch (error:any) {
      console.log(error);
      toast.error(error?.respone?.data?.error?.message || error?.message);
    }
  }

  return (
    <div className="page-container">
      {/* Main page wrapper */}

      <div className="page-header">
        {/* Top header section */}

        <div className="flex items-center justify-between">
          {/* Flex container for left & right sections */}

          <div>
            {/* Left side: title and subtitle */}
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Activity Log
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track your daily workouts
            </p>
          </div>

          <div className="text-right">
            {/* Right side: today's totals */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Active Today
            </p>

            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {totalMinutes} min
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {totalMinutes} min
            </p>
          </div>
        </div>
      </div>

      <div className="page-content-grid">
        {/* Main content area */}

        {!showForm && (
          <div className="space-y-4">
            {/* Quick Add section (only visible when form is closed) */}

            <Card>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Quic Add
              </h3>

              <div className="flex flex-wrap gap-2">
                {quickActivities.map((activity) => (
                  <button
                    onClick={() => handleQUickAdd(activity)}
                    key={activity.name}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {activity.emoji} {activity.name}
                  </button>
                ))}
              </div>
            </Card>

            <Button className="w-full" onClick={() => setShowForm(true)}>
              <PlusIcon className="size-5" />
              Add custome Activity
            </Button>
          </div>
        )}

        {showForm && (
          <Card className="border-2 border-blue-200 dark:border-blue-200">
            {/* Add Activity Form */}

            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              New Activity
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Activity name"
                value={formData.name}
                onChange={(v) =>
                  setFormData({ ...formData, name: v.toString() })
                }
                placeholder="e.g., Morning run"
                required
              />

              <div className="flex gap-4">
                <Input
                  label="Duration (min)"
                  type="number"
                  className="flex-1"
                  min={1}
                  max={300}
                  value={formData.duration}
                  onChange={handleDurationChange}
                  placeholder="e.g., 30"
                  required
                />

                <Input
                  label=" Calories Burned(min)"
                  type="number"
                  className="flex-1"
                  min={1}
                  max={2000}
                  value={formData.calories}
                  onChange={(v) =>
                    setFormData({ ...formData, calories: Number(v) })
                  }
                  placeholder="e.g., 200"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setFormData({ name: "", duration: 0, calories: 0 });
                  }}
                >
                  cancel
                </Button>

                <Button type="submit" className="flex-1">
                  Add Activity
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activities.length === 0 ? (
          <Card className="text-center py-12">
            {/* Empty state when no activities logged */}

            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <DumbbellIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>

            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
              NO Activity logged today
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Start moving and track your progress
            </p>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify bg-center">
                <ActivityIcon className="size-5 text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Today's Activities
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activities.length} logged
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-entry-item">
                  <div className="flex item-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <TimerIcon className="size-5 text-blue-500 dark:text-blue-400" />
                    </div>

                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {activity.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(activity?.createdAt || "").toLocaleTimeString(
                          "en-Us",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{activity.duration}min</p>
                      <p className="text-xs text-slate-400">{activity.calories}kcal</p>

                    </div>
                    <button onClick={()=>handleDelete(activity.documentId)}  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2Icon className="w-4 h-4"/>
                    </button>

                  </div>
                </div>
              ))}
            </div>

            {/*Total summary*/}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Total Active Time</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalMinutes} minutes</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Activitylog;


