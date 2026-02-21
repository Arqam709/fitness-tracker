import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Pages/layout";
import Dashboard from "./Pages/Dashboard";
import Foodlog from "./Pages/Foodlog";
import Activitylog from "./Pages/Activitylog";
import Profile from "./Pages/Profile";
import Login from "./Pages/login";
import Onboarding from "./Pages/Onboarding";
import { useAppContext } from "./Context/AppContext";
import Loading from "./Components/Loading";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, isUserFetched, onboardingCompleted } = useAppContext();

if (!isUserFetched) return <Loading />;
if (!user) return <Login />;
if (!onboardingCompleted) return <Onboarding />;

return (
  <>
    <Toaster />
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="food" element={<Foodlog />} />
        <Route path="activity" element={<Activitylog />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);
};

export default App;
