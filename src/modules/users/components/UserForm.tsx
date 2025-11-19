import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { LuCheck } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { PROFILE_PICTURE } from "@shared/utils/data";
import axiosInstance from "@shared/utils/axiosInstance";
import { API_PATHS } from "@shared/utils/apiPaths";
import { validateEmail } from "@shared/utils/helper";
import EmailInput from "@shared/inputs/components/Email";
import PasswordInput from "@shared/inputs/components/Password";
import TextInput from "@shared/inputs/components/Text";
import ImageInput from "@shared/inputs/components/Image";

export default function FormProfile({ refresh }:{ refresh:()=>void }) {
  const { user, updateUser } = useAuth();

  const [file, setFile] = useState<File | null>();
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("user-name")?.toString() || "";
    const email = formData.get("user-email")?.toString() || "";
    const newPassword = formData.get("new-password")?.toString() || "";
    const password = formData.get("user-password")?.toString() || "";

    //! Validate form data
    if (!name.trim()) return setError("Nombre obligatorio.");
    if (!validateEmail(email)) return setError("Correo electrónico no válido.");
    if (newPassword.trim().length > 0 && newPassword.trim().length < 8) return setError("La contraseña nueva debe tener mínimo 8 caracteres.");
    if (password.trim().length < 8) return setError("La contraseña actual debe tener mínimo 8 caracteres.");

    const data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("password", password);
    data.append("newPassword", newPassword);
    if (file) data.append("file", file);

    try {
      const res = await axiosInstance.put(
        API_PATHS.USERS.UPDATE_USER(user._id),
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 201) {
        toast.success(res.data.message);
        updateUser(res.data.user);
        refresh();
      }
    } catch (error) {
      if (!isAxiosError(error)) return console.error("Error updating user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error inesperado. Intenta nuevamente.");
      };
    };
  };

  return(
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-full">
      <div className="flex flex-col gap-6 overflow-y-auto">
        <ImageInput initialImage={user?.profileImageUrl || PROFILE_PICTURE} onFileSelect={(newFile:File|null)=>setFile(newFile)} />
        <TextInput name="user-name" label="*Nombre" placeholder="Nombre Completo" autoComplete="name" defaultValue={user?.name}/>
        <EmailInput name="user-email" label="*Correo" placeholder="Correo@Ejemplo.com" defaultValue={user?.email}/>
        <PasswordInput name="new-password" label="Contraseña nueva" autoComplete="new-password" placeholder="Mínimo 8 caracteres"/>
        <PasswordInput name="user-password" label="*Contraseña actual" autoComplete="current-password" placeholder="Mínimo 8 caracteres"/>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-5 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
          <button type="submit" className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </div>
    </form>
  );
};