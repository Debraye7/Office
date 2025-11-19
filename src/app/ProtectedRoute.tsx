"use client"

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@shared/context/AuthContext";
import Loader from "@shared/components/Loader";

export default function ProtectedRoute({ children }:Readonly<{ children:ReactNode; }>) {
  const { user, desk, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if(loading) return;
    if (!user) return router.push('/auth/login');
    if(!desk) return router.push("/");
  }, [user, desk, loading]);

  if (loading) return <Loader/>;

  if (!user) return null; // Do not render anything, the useEffect will already redirect

  if(!desk && path !== "/") return null;

  if(user) return children;
};