"use client";

import { useRef, useState } from "react";
import { removeLeadPhoto, uploadLeadPhoto } from "@/lib/actions/leads";

export function LeadPhoto({
  leadId,
  photoUrl,
}: {
  leadId: string;
  photoUrl: string | null;
}) {
  const [preview, setPreview] = useState(photoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("photo", file);
    const result = await uploadLeadPhoto(leadId, formData);

    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPreview(result.url ?? null);
  }

  async function handleRemove() {
    setUploading(true);
    await removeLeadPhoto(leadId);
    setUploading(false);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        Property Photo
      </label>
      {preview ? (
        <div className="mt-1 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Property"
            className="h-20 w-20 rounded-md object-cover ring-1 ring-slate-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 disabled:opacity-50"
        />
      )}
      {uploading && <p className="mt-1 text-xs text-slate-400">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
