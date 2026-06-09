"use client";

import { useCallback } from "react";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string, fileType: string) => void;
  accept?: string;
}

export default function FileUpload({
  onFileContent,
  accept = ".pdf,.doc,.docx,.txt",
}: FileUploadProps) {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/parse-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse file");
        }

        const data = await response.json();
        onFileContent(data.text, file.name, file.type);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Failed to parse file. Please try again or paste text manually.");
      }
    },
    [onFileContent]
  );

  return (
    <div className="rounded-lg border border-dashed border-slate-600 bg-slate-900/50 p-6 text-center">
      <input
        type="file"
        id="resume-file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <label
        htmlFor="resume-file"
        className="flex cursor-pointer flex-col items-center gap-2"
      >
        <svg
          className="h-8 w-8 text-slate-400"
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
          <span className="text-purple-400">Click to upload</span> or drag and
          drop
        </span>
        <span className="text-xs text-slate-500">
          PDF, DOC, DOCX, or TXT up to 5MB
        </span>
      </label>
    </div>
  );
}
