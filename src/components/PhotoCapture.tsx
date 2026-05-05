import { useState, useRef } from "react";

type Props = {
  onChange: (files: File[]) => void;
};

export function PhotoCapture({ onChange }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? []);
    const updated = [...photos, ...newFiles];
    setPhotos(updated);
    onChange(updated);
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onChange(updated);
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:border-secondary hover:text-secondary transition-colors"
      >
        + Add Photos
      </button>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {photos.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div className="relative" key={i}>
                <button onClick={() => setPreviewUrl(url)}>
                  <img
                    src={url}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                </button>
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 px-4"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  );
}
