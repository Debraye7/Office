'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { LuImageUp } from 'react-icons/lu';

export default function ImageInput({ initialImage, onFileSelect }:{ initialImage:string, onFileSelect: (file: File | null) => void, }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(initialImage);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    onFileSelect(file);
  };

  return (
    <div className="flex">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="relative w-12 xl:w-14 h-12 xl:h-14 flex items-center justify-center rounded-full hover:opacity-50 cursor-pointer duration-300"
      >
        <Image
          src={previewUrl}
          alt="Foto de perfil"
          width={64}
          height={64}
          className="w-12 xl:w-14 h-12 xl:h-14 object-cover rounded-full border border-tertiary-light dark:border-tertiary-dark"
        />
        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 xl:w-6 h-5 xl:h-6 rounded-full text-primary-light dark:text-primary-dark bg-blue-light dark:bg-blue-dark">
          <LuImageUp className="text-xs xl:text-sm" />
        </div>
      </button>
    </div>
  );
};