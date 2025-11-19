import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import { useAuth } from "@shared/context/AuthContext";
import { API_PATHS } from "@shared/utils/apiPaths";
import axiosInstance from "@shared/utils/axiosInstance";
import { TypeCategory, TypeProduct } from "@shared/utils/types";
import { PRODUCT_PICTURE } from "@shared/utils/data";
import Modal from "@shared/components/Modal";
import DeleteAlert from "@shared/components/DeleteAlert";
import TextInput from "@shared/inputs/components/Text";
import CategorySelect from "@shared/inputs/components/CategorySelect";
import NumberInput from "@shared/inputs/components/Number";
import Textarea from "@shared/inputs/components/Textarea";
import ImageInput from "@shared/inputs/components/Image";

export default function ProductForm({ values, refresh, }:{ values?:TypeProduct, refresh:()=>void }) {
  const { user } = useAuth();

  const [file, setFile] = useState<File|null>();
  const [category, setCategory] = useState<TypeCategory|undefined>(values?.category);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const createProduct = async (formData:FormData) => {
    try {
      const res = await axiosInstance.post(API_PATHS.PRODUCTS.CREATE_PRODUCT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        toast.success(res.data.message);
        refresh();
      };
    } catch (error) {
      if (!isAxiosError(error)) return console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    };
  };

  const updateProduct = async (formData: FormData) => {
    if (!values) return;
    try {
      const res = await axiosInstance.put(API_PATHS.PRODUCTS.UPDATE_PRODUCT(values._id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        toast.success(res.data.message);
        refresh();
      }
    } catch (error) {
      if (!isAxiosError(error)) return console.error("Error updating product:", error);
      setError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!values) return;
    setLoading(true);
    try {
      const res = await axiosInstance.delete(API_PATHS.PRODUCTS.DELETE_PRODUCT(values._id));
      if (res.status === 200) {
        toast.success(res.data.message);
        refresh();
      }
    } catch (error) {
      if (!isAxiosError(error)) return console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const title = form.get('title')?.toString().trim() || "";
    const description = form.get('description')?.toString().trim() || "";
    const price = Number(form.get('price')?.toString() || 0);

    //! Validations
    if (!title) return setError("Título obligatorio.");
    if (!category?._id) return setError("Categoría obligatoria.");
    if (isNaN(price) || price < 0) return setError("Introduce un precio válido.");

    //! Construct final FormData with extra fields
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("category", category._id);
    if (file) formData.append("file", file); // only send if selected

    const action = values ? updateProduct : createProduct;
    action(formData);
  };

  return(
    <form onSubmit={(e) => handleSubmit(e)} className="flex-1 flex flex-col gap-4 max-h-full">
      <div className="flex-1 flex flex-col gap-4 pr-4 overflow-y-auto">
        <ImageInput initialImage={values ? values.imageUrl : PRODUCT_PICTURE} onFileSelect={(newFile:File|null)=>setFile(newFile)}/>
        <TextInput
          name="title"
          label="Título"
          placeholder="Nombre del producto"
          defaultValue={values?.title || ""}
        />
        <Textarea
          name="description"
          label="Descripción"
          placeholder="Descripción del producto"
          defaultValue={values?.description || ""}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            name="price"
            label="Precio"
            placeholder="Precio del producto"
            defaultValue={values?.price}
          />
          <CategorySelect 
            disabled={loading}
            label
            type="product"
            currentCategory={category}
            setCategory={(cat:TypeCategory|undefined)=>setCategory(cat)}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <p className="flex-1 flex items-center min-h-2 font-medium text-xs text-red-light dark:text-red-dark overflow-hidden">{error}</p>
        <div className="flex flex-wrap-reverse gap-2">
        {user?.role === "owner" && values &&
          <button type="button" disabled={loading} onClick={()=>setOpenAlert(true)} className="flex-1 sm:flex-auto card-btn-red w-fit sm:min-w-52">
            <LuTrash2 className="text-xl"/>
            Eliminar
          </button>
        }
          <button type="submit" disabled={loading} className="flex-1 sm:flex-auto card-btn-fill w-fit sm:min-w-52">
            <LuCheck className="text-xl"/>
            Confirmar
          </button>
        </div>
      </div>
      <Modal title="Eliminar Producto" isOpen={openAlert} onClose={()=>setOpenAlert(false)}>
        {<DeleteAlert content="¿Estás seguro de que quieres eliminar este producto?" description="Se eliminaran todos sus movimientos" onDelete={deleteProduct}/>}
      </Modal>
    </form>
  );
};