import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PiDesktopDuotone } from "react-icons/pi";
import { useAuth } from "@shared/context/AuthContext";
import { BRAND_NAME } from "@shared/utils/data";
import Loader from "@shared/components/Loader";
import Wallpaper from "@public/wallpaper.png";

export default function AuthLayout({ children }:{ children:ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!loading && user) router.push('/');
  },[loading]);

  if(loading) return <Loader/>;

  return(
    <main className="flex">
      <section className="flex flex-col gap-2 w-screen lg:w-[60vw] h-fit lg:h-screen px-12 pt-4 pb-12">
        <Link href="/" className="flex items-center gap-1 w-fit text-basic">
          <PiDesktopDuotone className="text-xl"/>
          <h2 className="text-lg font-medium">{BRAND_NAME}</h2>
        </Link>
        {children}
      </section>
      <section className="hidden lg:flex items-center justify-center w-[40vw] h-screen bg-stone-950 dark:bg-stone-100 bg-cover bg-no-repeat bg-center overflow-hidden"> {/* bg-[url('/bg-img.png')] */}
        {/* <p className="text-stone-100 dark:text-stone-950 text-6xl">Imagen</p> */}
        <Image src={Wallpaper} alt="Wallpaper para formulario" className="w-full" priority/>
      </section>
    </main>
  );
};