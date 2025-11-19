import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { BRAND_NAME } from "@shared/utils/data";
import { TypeProduct } from "@shared/utils/types";
import { isAxiosError } from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { LuCheckCheck, LuPrinter, LuX } from "react-icons/lu";

export default function Receipt({ accountId, name, cart, total, confirm, close }:{ accountId:string|undefined, name:string, cart:{ product:TypeProduct, quantity:number }[], total:number, confirm:()=>void, close:()=>void }) {

  const handlePrint = () => {
    const receipt = document.getElementById("receipt");
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    // Copiar todas las hojas de estilo actuales (Tailwind, fuentes, estilos propios)
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (e) {
          // Para hojas bloqueadas por CORS, mejor insertar como <link>
          if (styleSheet.href) {
            return `<link rel="stylesheet" href="${styleSheet.href}">`;
          }
          return "";
        }
      })
      .join("\n");

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo</title>
          ${styles.startsWith("<link") ? styles : `<style>${styles}</style>`}
        </head>
        <body>
          ${receipt.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 300);
    };
  };

  const handleConfirm = async () => {
    try {
      const res = await axiosInstance.post(API_PATHS.STORE.CONFIRM_SALE, { accountId, name, cart, total });
      if(res.status = 201) {
        toast.success(res.data.message);
        confirm();
      };
    } catch (error) {
      if(!isAxiosError(error)) return console.error("Error fetching products:", error);
      if(error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      };
    };
  };

  return(
    <div className="fixed left-0 top-0 z-50 flex items-center justify-center bg-quaternary/50 w-screen h-screen">
      <div className="max-h-[90vh] p-2 rounded-md bg-primary-light dark:bg-primary-dark overflow-y-auto overflow-x-hidden">
        <section id="receipt" className="flex flex-col gap-10 px-5 sm:px-10 py-2.5 sm:py-5.5 w-[80vw] sm:w-[400px] rounded text-sm bg-primary-light">
          <div className="text-center">
            <h3 className="font-bold text-base sm:text-lg">{BRAND_NAME}</h3>
            <p className="text-muted-foreground">123 Main Street</p>
            <p className="text-muted-foreground">Phone: (+52) 5512345678</p>
            <p className="text-muted-foreground">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          </div>
        {name && (
          <div>
            <p>
              <strong>Customer:</strong> {name}
            </p>
          </div>
        )}
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.product._id} className="flex justify-between">
                <div>
                  <p>{item.product.title}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} x ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <p>${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {/* <div className="flex justify-between">
              <p>Subtotal:</p>
              <p>${getTotal().toFixed(2)}</p>
            </div> */}
            {/* <div className="flex justify-between">
              <p>Tax (8%):</p>
              <p>${tax.toFixed(2)}</p>
            </div> */}
            <div className="flex justify-between font-bold text-lg">
              <p>Total:</p>
              <p>${total.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-center text-muted-foreground">
            <p>Gracias por tu compra</p>
            <p>Que tengas un buen día!</p>
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={close} className="flex-1 card-btn-red">
              <LuX className="text-xl"/>
              Cancelar
            </button>
            <button type="button" onClick={handlePrint} className="flex-1 card-btn-fill">
              <LuPrinter className="text-xl"/>
              Imprimir
            </button>
          </div>
          <button type="button" onClick={handleConfirm} className="flex-1 card-btn-fill">
            <LuCheckCheck className="text-xl"/>
            Confirmar
          </button>
        </section>
      </div>
    </div>
  );
};