import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase/supabaseClient";

type Props = {
  storagePath: string;
};

export function StorageImage({ storagePath }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: url } = useQuery({
    queryKey: ["storage", storagePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("photos")
        .createSignedUrl(storagePath, 3600);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
    staleTime: 55 * 60 * 1000,
  });

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
