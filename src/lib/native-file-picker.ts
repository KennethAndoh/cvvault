import { Capacitor } from "@capacitor/core";

export interface PickedFileResult {
  file: File;
  name: string;
  size: number;
  type: string;
}

/**
 * Native Android file picker helper for Capacitor apps.
 * Triggers native Android file chooser intent via Capacitor FilePicker plugin / bridge
 * and converts the returned native file data into a standard JS File object ready for Supabase Storage uploads.
 */
export async function pickNativeDocument(): Promise<PickedFileResult | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    // Access Capacitor registered plugin dynamically via global / Capacitor API
    const Plugins = (Capacitor as any).Plugins || (typeof window !== "undefined" && (window as any).Capacitor?.Plugins);
    const FilePickerPlugin = Plugins?.FilePicker || Plugins?.FilePickerPlugin;

    if (FilePickerPlugin && typeof FilePickerPlugin.pickFiles === "function") {
      const result = await FilePickerPlugin.pickFiles({
        types: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "*/*"
        ],
        multiple: false,
        readData: true,
      });

      if (result && result.files && result.files.length > 0) {
        const picked = result.files[0];
        const fileName = picked.name || `document_${Date.now()}.pdf`;
        const mimeType = picked.mimeType || picked.type || "application/pdf";
        let blob: Blob;

        if (picked.blob) {
          blob = picked.blob;
        } else if (picked.data) {
          const base64Data = picked.data.includes(",") ? picked.data.split(",")[1] : picked.data;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        } else if (picked.path) {
          try {
            const response = await fetch(Capacitor.convertFileSrc(picked.path));
            blob = await response.blob();
          } catch (pathErr) {
            console.warn("Fetch Capacitor convertFileSrc failed, checking Filesystem plugin:", pathErr);
            const FilesystemPlugin = Plugins?.Filesystem || Plugins?.FilesystemPlugin;
            if (FilesystemPlugin && typeof FilesystemPlugin.readFile === "function") {
              const fileData = await FilesystemPlugin.readFile({ path: picked.path });
              const base64Data = typeof fileData.data === "string" ? (fileData.data.includes(",") ? fileData.data.split(",")[1] : fileData.data) : fileData.data;
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              blob = new Blob([byteArray], { type: mimeType });
            } else {
              throw pathErr;
            }
          }
        } else {
          throw new Error("Could not read native file data");
        }

        const file = new File([blob], fileName, { type: mimeType });
        return {
          file,
          name: fileName,
          size: file.size || picked.size || 0,
          type: mimeType,
        };
      }
    }
  } catch (err) {
    console.warn("Native FilePicker plugin error, falling back to native WebChromeClient input chooser:", err);
  }

  return null;
}
