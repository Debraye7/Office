"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";;
import { validateEmail } from "@shared/utils/helper";
import { PROFILE_PICTURE } from "@shared/utils/data"
import axiosInstance from "@shared/utils/axiosInstance";
import AuthLayout from "@shared/layouts/AuthLayout";
import EmailInput from "@shared/inputs/components/Email";
import PasswordInput from "@shared/inputs/components/Password";
import TextInput from "@shared/inputs/components/Text";
import ImageInput from "@shared/inputs/components/Image";

export default function SignUpPage() {
const router = useRouter();
const { updateUser, changeDesk } = useAuth();

const [file, setFile] = useState<File | null>();

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const name = formData.get('user-name')?.toString() || "";
  const email = formData.get('user-email')?.toString() || "";
  const password = formData.get('user-password')?.toString() || "";
  // const token = formData.get('user-token')?.toString() || "";

  //! Validaciones antes de enviar
  if (!name.trim()) return toast.error("Introduce tu nombre");
  if (!validateEmail(email)) return toast.error("Introduce un correo electrónico válido");
  if (password.trim().length < 8) return toast.error("La contraseña debe tener mínimo 8 caracteres");
  // if (!token.trim()) return toast.error("Introduce un token de registro");

  const data = new FormData();
  data.append('name', name);
  data.append('email', email);
  data.append('password', password);
  // data.append('token', token);
  if(file) data.append('file', file);

  try {
    const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.status === 201) {
      toast.success(res.data.message);
      updateUser(res.data.user);
      // router.push('/');
      changeDesk(res.data.desk._id);
    }
  } catch (error) {
    if (!isAxiosError(error)) {
      console.error("Error al registrar usuario:", error);
      return toast.error("Error inesperado");
    };
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("No se pudo registrar. Intenta nuevamente.");
    };
  };
};

  return(
    <AuthLayout>
      <div className="flex flex-col justify-center md:h-full">
        <h3 className="text-xl font-semibold text-basic">Crear Cuenta</h3>
        <p className="text-xs font-medium text-quaternary mt-[5px] mb-6">Introduce tus datos a continuación para registrarte</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ImageInput initialImage={PROFILE_PICTURE} onFileSelect={(newFile:File|null)=>setFile(newFile)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput name="user-name" label="Nombre completo" placeholder="Nombre Apellido" autoComplete="nickname"/>
            <EmailInput name="user-email" label="Correo Electrónico" placeholder="Nombre@Ejemplo.com"/>
            <PasswordInput name="user-password" label="Contraseña" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            {/* <TextInput name="user-token" label="Token" placeholder="Token de registro" autoComplete="none"/> */}
          </div>
          <button className="w-full p-[10px] my-1 rounded-md font-medium text-primary-light dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-light bg-primary-dark dark:bg-primary-light hover:bg-tertiary-light dark:hover:bg-tertiary-dark shadow-lg shadow-quaternary/5 dark:shadow-quaternary/10 cursor-pointer duration-300">Crear cuenta</button>
          <div className="flex flex-wrap items-center gap-1 mt-3 text-[13px]">
            <p className="text-nowrap font-medium text-quaternary">¿Ya tienes una cuenta?</p>
            <Link href="/auth/login" className="text-nowrap font-medium text-blue-light dark:text-blue-dark hover:text-primary-dark dark:hover:text-primary-light underline duration-300">Iniciar sesión</Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};