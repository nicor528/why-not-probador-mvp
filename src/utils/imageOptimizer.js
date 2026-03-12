/**
 * Redimensiona una imagen base64 para reducir el consumo de tokens y evitar el error 429.
 */
export const resizeImage = (base64Str, maxWidth = 512) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 de calidad para ahorrar tokens
    };
  });
};