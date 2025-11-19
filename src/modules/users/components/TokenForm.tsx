import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { ROLES_DATA } from "@shared/utils/data";
import DropdownSelect from "@shared/inputs/components/Dropdown";
import Textarea from "@shared/inputs/components/Textarea";

export default function FormToken() {
  const [tokenType, setTokenType] = useState("client");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const createToken = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("")
    setToken("");
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.GET_TOKEN(tokenType));
      setToken(res.data);
      toast.success("Token creado");
    } catch (error) {
      console.error("Error generating token", error);
      toast.error("Error, al generar el token.");
    }
  };

  return(
    <form onSubmit={createToken} className="flex-1 flex flex-col gap-2 max-h-full">
      <div className="flex-1 flex flex-col gap-2">
        <DropdownSelect label="Rol" options={ROLES_DATA} placeholder="Elige un tipo de usuario" defaultValue={tokenType} handleValue={(value:string)=>setTokenType(value)}/>
        <Textarea name="new-token" label="Token" placeholder="Crear un token" value={token} disabled/>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-2.5 sm:min-h-5 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
          <button type="submit" className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">Crear Token</button>
        </div>
      </div>
    </form>
  );
};