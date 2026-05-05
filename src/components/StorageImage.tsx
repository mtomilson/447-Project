import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/supabaseClient";

type Props = {
  storagePath: string;
};

export function StorageImage({ storagePath }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage
      .from("photos")
      .createSignedUrl(storagePath, 3600)
      .then(({ data, error }) => {
        if (!error && data) setUrl(data.signedUrl);
      });
  }, [storagePath]);

  if (!url) return <div className="w-full aspect-square bg-gray-100 rounded-md" />;

  return (
    <>
      <button onClick={() => setPreviewUrl(url)} className="w-full">
        <img src={url} className="w-full aspect-square object-cover rounded-md" />
      </button>

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
