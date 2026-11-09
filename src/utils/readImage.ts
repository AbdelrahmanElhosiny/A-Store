// longest side of a stored picture; cards show it at most ~720 px wide
const MAX_SIDE = 960;
const QUALITY = 0.82;

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("The file isn't a picture we can read"));
    img.src = src;
  });

// Reads a picked file into a data URL, scaled down so a phone photo of
// several MB becomes ~50-150 KB before it goes into the store.
const readImage = async (file: File): Promise<string> => {
  const original = await readAsDataURL(file);
  const img = await loadImage(original);

  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return original;
  context.drawImage(img, 0, 0, canvas.width, canvas.height);

  // browsers that can't write WebP hand back a PNG instead: use JPEG there
  const webp = canvas.toDataURL("image/webp", QUALITY);
  return webp.startsWith("data:image/webp")
    ? webp
    : canvas.toDataURL("image/jpeg", QUALITY);
};

export default readImage;
