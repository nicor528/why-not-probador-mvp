import { GoogleGenerativeAI } from "@google/generative-ai";
import { resizeImage } from "../utils/imageOptimizer";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const runVirtualTryOn = async (userImageBase64, clothingAssetPath) => {
  // 1. Optimizamos las imágenes
  const optimizedUserImg = await resizeImage(userImageBase64);
  
  const responseClothing = await fetch(clothingAssetPath);
  const blobClothing = await responseClothing.blob();
  const clothingBase64 = await new Promise(r => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(blobClothing);
  });
  const optimizedClothingImg = await resizeImage(clothingBase64);

  const prompt = `
    INSTRUCCIÓN TÉCNICA:
    Eres un experto en edición de moda. 
    1. Toma a la persona de la Imagen 1.
    2. Sustituye su prenda superior por la prenda exacta de la Imagen 2.
    3. Asegúrate de que la caída de la tela, sombras y pliegues sigan la forma del cuerpo.
    4. Devuelve el resultado final como una imagen de la persona con la nueva prenda puesta.
    5. IMPORTANTE: El fondo debe ser eliminado, devuelve solo a la persona (transparente/recortada).
  `;

  try {
    const contents = [
      { text: prompt },
      { inlineData: { data: optimizedUserImg.split(',')[1], mimeType: "image/jpeg" } },
      { inlineData: { data: optimizedClothingImg.split(',')[1], mimeType: "image/jpeg" } }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: contents,
      config: {
        respondeModelities: ["IMAGE"], // Forzamos a que intente devolver imagen
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "512x512",
        }
      }
    });

    console.log("Respuesta completa de la API:", response);

    // Acceso a los datos según el JSON que proporcionaste
    const part = response.candidates[0].content.parts[0];

    if (part.inlineData) {
      const { data, mimeType } = part.inlineData;
      console.log("Imagen recibida con éxito. MimeType:", mimeType);
      
      // IMPORTANTE: En el navegador usamos este formato para el <img> src
      return `data:${mimeType};base64,${data}`;
    } 
    
    if (part.text) {
      console.warn("La IA devolvió texto en lugar de imagen:", part.text);
      throw new Error("LA_IA_NO_GENERO_IMAGEN");
    }

    throw new Error("ESTRUCTURA_DESCONOCIDA");

  } catch (error) {
    console.error("Error en runVirtualTryOn:", error);
    if (error.message.includes("429")) throw new Error("LIMITE_EXCEDIDO");
    throw error;
  }
};