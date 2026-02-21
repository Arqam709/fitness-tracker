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
    // ✅ clear old state BEFORE switching user
    setAllFoodLogs([]);
    setAllActivityLogs([]);
    setUser(null);

    const { data } = await api.post("/api/auth/local/register", credentials);

    const token = data.jwt;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser({ ...data.user, token });
    setOnboardingCompleted(hasCompletedOnboarding(data?.user));
    setIsUserFetched(true);

    // ✅ fetch new user's logs immediately
    await fetchFoodLogs(token);
    await fetchActivityLogs(token);

  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.error?.message || error?.message);
    setIsUserFetched(true);
  }
};


  const login = async (credentials: Credentials) => {
  try {
    // ✅ clear old user's logs first
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

    // ✅ fetch logs for THIS user
    await fetchFoodLogs(token);
    await fetchActivityLogs(token);

  } catch (error: any) {
    console.log(error);
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

const fetchFoodLogs = async (token : string) => {
  try {
    const {data} = await api.get('/api/foodlogs',{headers: {Authorization : `Bearer ${token}`}})

    setAllFoodLogs(data)
    
  } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message )
  }
};


const fetchActivityLogs = async (token : string) => {
  try {
    const {data} = await api.get('/api/activitylogs',{headers: {Authorization : `Bearer ${token}`}})

    setAllActivityLogs(data)
    
  } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message )
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
