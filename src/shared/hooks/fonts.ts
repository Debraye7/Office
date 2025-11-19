import { Urbanist, Sarina, Poppins } from "next/font/google";

export const fontUrbanist = Urbanist({ subsets: ["latin"], weight:["100", "200", "300", "400", "500", "600", "700", "800", "900"] });
export const fontSarina = Sarina({ subsets: ["latin"], weight:"400" });

export const fontPoppins = Poppins({ subsets: ["latin"], weight:["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: '--font-display' });