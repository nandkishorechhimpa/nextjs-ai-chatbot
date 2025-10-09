"use client";

import React, { useState, DragEvent, ChangeEvent } from "react";
import { FileIcon } from "lucide-react";
import { toast } from "../toast";
import { Toaster } from "sonner";

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect?: (file: File | null) => void;
}

export const Fileupload: React.FC<FileUploadProps> = ({
  label = "Upload file",
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

   const isValidFile = validateFile(e.dataTransfer.files[0]);
   
   
   if(!isValidFile){
        toast({
        type: "error",
        description: `Invalid file type. Only ${accept}  are allowed.`,
      });
    return ;
   }

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File must be smaller than ${maxSizeMB} MB`);
      return;
    }

    setFileName(file.name);
    onFileSelect?.(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File must be smaller than ${maxSizeMB} MB`);
      return;
    }

    setFileName(file.name);
    onFileSelect?.(file);
  };

   //Validate the file extension and size
    function validateFile(file: File): boolean {
      const validExtensions = accept.split(",").map((ext) => ext.trim().toLowerCase());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!validExtensions.includes(fileExtension)) {
        alert(`Invalid file type. Only ${accept} are allowed.`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File must be smaller than ${maxSizeMB} MB`);
        return false;
      }
      return true;
    }
  return (
    <div className="col-span-full">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>

      <div
        className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-900/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <FileIcon className="mx-auto size-12 text-gray-300" />
          <div className="mt-4 flex text-sm text-gray-600 justify-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none hover:text-blue-800"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                type="file"
                accept={accept}
                className="sr-only"
                onChange={handleChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>

          {fileName ? (
            <p className="mt-2 text-sm text-gray-700 font-medium">{fileName}</p>
          ) : (
            <p className="text-xs text-gray-600">
              Only PDF, Word up to {maxSizeMB}MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
