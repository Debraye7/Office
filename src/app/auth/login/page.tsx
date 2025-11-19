"use client"

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@shared/context/AuthContext";
import { validateEmail } from "@shared/utils/helper";
import InputEmail from "@shared/inputs/components/Email";
import InputPassword from "@shared/inputs/components/Password";
import AuthLayout from "@shared/layouts/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();

  const [error, setError] = useState<string|undefined>();

  const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("user-email")?.toString() || "";
    const password = formData.get("user-password")?.toString() || "";

//! Validate form data
    if(!validateEmail(email)) return setError("Por favor introduzca una dirección de correo electrónico válida.");
    if(password.trim().length < 8) return setError("La contraseña debe tener mínimo 8 caracteres.");

    login(email, password);
  };

  return(
    <AuthLayout>
      <div className="flex flex-col justify-center lg:w-[70%] md:h-full">
        <h3 className="text-xl font-semibold text-basic">Bienvenido</h3>
        <p className="text-xs font-medium text-quaternary mt-[5px] mb-6">Por favor introduzca sus datos para iniciar sesión</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <InputEmail name="user-email" label="Correo Electrónico" placeholder="Nombre@Ejemplo.com"/>
          <InputPassword name="user-password" label="Contraseña" placeholder="Mínimo 8 caracteres" autoComplete="current-password" />
        {error && 
          <p className="text-red-500 text-xs pb-2.5">{error}</p>
        }
          <button type="submit" className="w-full p-[10px] my-1 rounded-md font-medium text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-tertiary-light dark:hover:bg-tertiary-dark shadow-lg shadow-quaternary/5 dark:shadow-quaternary/10 cursor-pointer duration-300">Iniciar sesión</button>
          <div className="flex flex-wrap items-center gap-1 mt-3 text-[13px]">
            <p className="text-nowrap font-medium text-quaternary">¿No tienes una cuenta?</p>
            <Link href="/auth/signup" className="text-nowrap font-medium text-blue-light dark:text-blue-dark hover:text-primary-dark dark:hover:text-primary-light underline duration-300">Crear cuenta</Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};