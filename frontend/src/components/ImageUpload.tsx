"use client";

import React, { useCallback, useRef, useState } from "react";

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  existingImages?: string[];
  className?: string;
}

export default function ImageUpload({
  onFilesSelected,
  multiple = false,
  maxFiles = 10,
  accept = "image/jpeg,image/png,image/webp",
  existingImages = [],
  className = "",
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxFiles - selectedFiles.length;
      const toProcess = fileArray.slice(0, remaining);
      if (toProcess.length === 0) return;

      const newPreviews: string[] = [];
      const validFiles: File[] = [];

      toProcess.forEach((file) => {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
        if (file.size > 10 * 1024 * 1024) return;
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === validFiles.length) {
            setPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      if (validFiles.length > 0) {
        const updated = [...selectedFiles, ...validFiles];
        setSelectedFiles(updated);
        onFilesSelected(updated);
      }
    },
    [maxFiles, selectedFiles, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const removePreview = useCallback(
    (index: number) => {
      const newPreviews = previews.filter((_, i) => i !== index);
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setPreviews(newPreviews);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [previews, selectedFiles, onFilesSelected]
  );

  return (
    <div className={className}>
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-[rgb(var(--text-muted))] mb-2">Current images:</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((url, i) => (
              <div key={`existing-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden glass-card">
                <img src={url} alt={`Existing ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragging
            ? "border-violet-500 bg-violet-500/10 shadow-glow-violet"
            : "border-[rgba(var(--glass-border))] hover:border-violet-500/50 bg-[rgba(var(--glass-bg))]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-[rgb(var(--text-muted))] mb-3"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="text-sm text-[rgb(var(--text-secondary))]">
          <span className="font-semibold text-violet-500">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
          JPEG, PNG, or WebP. Min 512x512. Max 10MB.
        </p>
        {multiple && (
          <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
            Up to {maxFiles} images. {selectedFiles.length}/{maxFiles} selected.
          </p>
        )}
      </div>

      {/* New previews */}
      {previews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-[rgb(var(--text-muted))] mb-2">New uploads:</p>
          <div className="flex flex-wrap gap-3">
            {previews.map((preview, i) => (
              <div key={`preview-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden glass-card group">
                <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(i);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
