import { Activity, HomeIcon, PersonStandingIcon, UtensilsIcon, UserIcon, MoonIcon, SunIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";

const Sidebar = () => {
  // Sidebar navigation items (path + label + icon component)
  const navItems = [
    { path: "/", label: "Home", Icon: HomeIcon },
    { path: "/food", label: "Food", Icon: UtensilsIcon },
    { path: "/activity", label: "Activity", Icon: Activity },
    { path: "/profile", label: "Profile", Icon: UserIcon },
  ];

  // Theme state from ThemeContext (dark/light)
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <PersonStandingIcon className="size-7 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          FitTrack
        </h1>
      </div>

      {/* Nav links */}
      <div className="mt-10 flex flex-col gap-2">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200
               ${isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"}`
            }
          >
            {/* Icon */}
            <Icon className="size-5" />
            {/* Label */}
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Theme toggle (optional) */}
      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          
          {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
          <span className="text-base">{theme === 'light' ? 'Dark Mode' : 'light Mode'}</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;

