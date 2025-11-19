export default function EmailInput({ name, label, placeholder, defaultValue }:{ name:string, label:string, placeholder:string, defaultValue?:string }) {
  return(
    <div className="input-label-container">
      <label htmlFor={name} className="input-label">{label}</label>
      <div className="input-container">
        <input name={name} type="email" autoComplete="email" placeholder={placeholder} defaultValue={defaultValue} className="input"/>
      </div>
    </div>
  );
};