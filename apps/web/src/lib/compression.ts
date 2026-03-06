import imageCompression from 'browser-image-compression';

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 0.5,          // Max size 500KB (Great for proof of work)
    maxWidthOrHeight: 1280, // Resizes large 4K photos down to HD
    useWebWorker: true,     // Offloads work from UI thread to prevent lag
    initialQuality: 0.8,    // 80% quality is indistinguishable on mobile
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Compression failed:", error);
    return file; // Fallback to original if compression fails
  }
}