import axiosInstance from "@shared/utils/axiosInstance";

export const uploadImage = async ({ file, folder, id }:{ file:File, folder:"users"|"products", id:string }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('public_id', id);

  const res = await axiosInstance.post('/api/images', formData, {
    headers:{ 'Content-Type':'multipart/form-data', },
  });

  if(res.status !== 201) return null;
  return res.data.secure_url;
};