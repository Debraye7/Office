"use client"

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { API_PATHS } from '@shared/utils/apiPaths';
import axiosInstance from '@shared/utils/axiosInstance';
import { TypeDesk, TypeUser } from '@shared/utils/types';

interface AuthContextType {
  user:TypeUser|undefined;
  login:(email:string, password:string) => void;
  logout:() => void;
  updateUser:(data:TypeUser) => void;
  desk:TypeDesk|undefined;
  changeDesk:(deskId:string) => void;
  removeDesk:() => void;
  loading:boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }:{ children:ReactNode }) {
  const router = useRouter();
  const path = usePathname();

  const [user, setUser] = useState<TypeUser|undefined>();
  const [desk, setDesk] = useState<TypeDesk|undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When loading the application, it checks if there is an active session.
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        if (res.status === 200) {
          setUser(res.data.user);
          setDesk(res.data.desk); // Can be undefined
          toast.success(res.data.message);
        };
      } catch (error) {
        setUser(undefined);
        if(!isAxiosError(error)) return console.error(error);
        if(error.response && error.response.data.message) {
          if(path !== "/auth/login" && path !== "/auth/signup") toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        };
      } finally {
        setLoading(false);
      };
    };
    checkAuth();
  }, []);

  const login = async (email:string, password:string) => {
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      if (res.status === 200) {
        toast.success(res.data.message);
        setUser(res.data.user);
        // router.push('/');
//^ Iniciar escritorio
        changeDesk(res.data.desk._id);
      } else {
        setUser(undefined);
      };
    } catch (error) {
      setUser(undefined);
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const updateUser = async (data:TypeUser) => {
    setUser(data);
  };

  const logout = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.LOGOUT); // Endpoint to delete the cookie on the server
      if(res.status === 200) {
        toast.success(res.data.message);
        setUser(undefined);
        setDesk(undefined);
        router.push('/auth/login');
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const changeDesk = async (deskId:string) => {
    try {
      const res = await axiosInstance.get(API_PATHS.DESKS.GET_DESK(deskId));
      if(res.status === 200) {
        setDesk(res.data.desk);
        toast.success(res.data.message);
        router.push("/dashboard");
      } else {
        setDesk(undefined);
      };
    } catch (error) {
      setDesk(undefined);
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const removeDesk = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DESKS.EXIT_DESK); // Endpoint to delete the cookie on the server
      if(res.status === 200) {
        toast.success(res.data.message);
        setDesk(undefined);
        router.push('/');
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error(error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  const auth: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    desk,
    changeDesk,
    removeDesk,
    loading,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};