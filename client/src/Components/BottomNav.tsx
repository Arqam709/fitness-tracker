import { Activity, Home, User, Utensils } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNav = () => {
  const navItems = [
    { path: "/", label: "Home", Icon: Home },
    { path: "/food", label: "Food", Icon: Utensils },
    { path: "/activity", label: "Activity", Icon: Activity },
    { path: "/profile", label: "Profile", Icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pb-safe lg:hidden transition-colors duration-200">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200
              ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-slate-600 dark:text-slate-300"
              }`
            }
          >
            <Icon className="size-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

