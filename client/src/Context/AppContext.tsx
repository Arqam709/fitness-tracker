import React, { createContext, useContext, useEffect, useState } from "react";
import {
  initialState,
  type ActivityEntry,
  type FoodEntry,
  type User,
  type Credentials,
} from "../types";
import { useNavigate } from "react-router-dom";
//import mockApi from "../assets/mockApi";
import api from "../configs/api";
import toast from "react-hot-toast";

const AppContext = createContext(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(null);
  const [isUserFetched, setIsUserFetched] = useState(localStorage.getItem('token') ? false : true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
  const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

  const hasCompletedOnboarding = (u: any) => {
  const age = u?.age ?? u?.Age;
  const weight = u?.weight ?? u?.Weight;
  const goal = u?.goal ?? u?.Goal;
  return !!(age && weight && goal);
};



  const signup = async (credentials: Credentials) => {
  try {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];

    setAllFoodLogs([]);
    setAllActivityLogs([]);
    setUser(null);

    const { data } = await api.post("/api/auth/local/register", {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    });

    const token = data.jwt;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser({ ...data.user, token });
    setOnboardingCompleted(hasCompletedOnboarding(data?.user));
    setIsUserFetched(true);

    await fetchFoodLogs(token);
    await fetchActivityLogs(token);
  } catch (error: any) {
    console.log(error?.response?.data || error);
    toast.error(error?.response?.data?.error?.message || error?.message);
    setIsUserFetched(true);
  }
};


  const login = async (credentials: Credentials) => {
  try {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];

    setAllFoodLogs([]);
    setAllActivityLogs([]);
    setUser(null);

    const { data } = await api.post("/api/auth/local", {
      identifier: credentials.email,
      password: credentials.password,
    });

    const token = data.jwt;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser({ ...data.user, token });
    setOnboardingCompleted(hasCompletedOnboarding(data?.user));
    setIsUserFetched(true);

    await fetchFoodLogs(token);
    await fetchActivityLogs(token);
  } catch (error: any) {
    console.log(error?.response?.data || error);
    toast.error(error?.response?.data?.error?.message || error?.message);
    setIsUserFetched(true);
  }
};


 const fetchUser = async (token: string) => {

    try {
      const { data } = await api.get('/api/users/me',{headers:
      {Authorization: `Bearer ${token}`}})

    setUser({ ...data, token });

    setOnboardingCompleted(hasCompletedOnboarding(data));


    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   
    } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message )
    }

     setIsUserFetched(true);

  };

const fetchFoodLogs = async (token: string) => {
  try {
    const res = await api.get("/api/foodlogs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = res.data;

    // ✅ works for BOTH:
    // 1) payload = []  (your custom controller returning array)
    // 2) payload = { data: [] } (default Strapi REST shape)
    const items = Array.isArray(payload) ? payload : (payload?.data ?? []);

    setAllFoodLogs(items);
  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.error?.message || error?.message);
  }
};

const fetchActivityLogs = async (token: string) => {
  try {
    const res = await api.get("/api/activitylogs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = res.data;
    const items = Array.isArray(payload) ? payload : (payload?.data ?? []);

    setAllActivityLogs(items);
  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.error?.message || error?.message);
  }
};





useEffect(()=> {
  const token = localStorage.getItem('token')
  if(token ) {
    (async ()=> {
      await fetchUser(token)
      await fetchFoodLogs(token)
      await fetchActivityLogs(token)
    })();
  }
},[])




  const logout = () => {
  localStorage.removeItem("token");

  // ✅ clear all user-related state
  setUser(null);
  setOnboardingCompleted(false);
  setAllFoodLogs([]);
  setAllActivityLogs([]);
  setIsUserFetched(true);

  // ✅ remove header properly
  delete api.defaults.headers.common["Authorization"];

  navigate("/");
};


  //passing the value so we can use them in any other component
  const value = {
    ...initialState,
    navigate,
    user,
    setUser,
    login,
    signup,
    fetchUser,
    isUserFetched,
    logout,
    onboardingCompleted,
    setOnboardingCompleted,
    allFoodLogs,
    setAllFoodLogs,
    allActivityLogs,
    setAllActivityLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
