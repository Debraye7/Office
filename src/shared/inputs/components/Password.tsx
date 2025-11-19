import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function PasswordInput({ autoComplete, name, label, placeholder }:{ autoComplete:string, name:string, label:string, placeholder:string }) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return(
    <div className="input-label-container">
      <label htmlFor={name} className="input-label">{label}</label>
      <div className="input-container">
        <input name={name} type={showPassword ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className="input"/>
        <button type="button" onClick={toggleShowPassword}>
        {showPassword ?
          <LuEye className="text-2xl text-blue-light dark:text-blue-dark"/>
        :
          <LuEyeOff className="text-2xl text-quaternary"/>
        }
        </button>
      </div>
    </div>
  );
};