"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string, fileType: string) => void;
  onError?: (message: string) => void;
  accept?: string;
}

export default function FileUpload({
  onFileContent,
  onError,
  accept = ".pdf,.doc,.docx,.txt",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        onError?.("File size exceeds 5MB limit.");
        return;
      }

      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/parse-file", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to parse file");
        }

        onFileContent(data.text, file.name, file.type);
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : "Failed to parse file. Please paste text manually."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onFileContent, onError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onClick={() => !isLoading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-purple-400 bg-purple-500/10"
          : "border-slate-600 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900"
      } ${isLoading ? "cursor-wait opacity-70" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-2">
        {isLoading ? (
          <>
            <svg
              className="h-8 w-8 animate-spin text-purple-400"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-slate-300">Parsing file...</span>
          </>
        ) : (
          <>
            <svg
              className={`h-8 w-8 transition-colors ${isDragging ? "text-purple-400" : "text-slate-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm text-slate-300">
              <span className="text-purple-400">Click to upload</span> or drag
              and drop
            </span>
            <span className="text-xs text-slate-500">
              PDF, DOC, DOCX, or TXT up to 5MB
            </span>
          </>
        )}
      </div>
    </div>
  );
}
