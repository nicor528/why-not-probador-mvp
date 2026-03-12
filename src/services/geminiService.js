import { resizeImage } from "../utils/imageOptimizer";
import { GoogleGenAI } from "@google/genai";
import fondo from "../assets/fondo-tienda.png";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const runVirtualTryOn = async (userImageBase64, clothingAssetPath) => {

  const optimizedUserImg = await resizeImage(userImageBase64);

  const responseClothing = await fetch(clothingAssetPath);
  const blobClothing = await responseClothing.blob();

  const clothingBase64 = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(blobClothing);
  });

  const optimizedClothingImg = await resizeImage(clothingBase64);

  const responseBackground = await fetch(fondo);
  const blobBackground = await responseBackground.blob();

  const backgroundBase64 = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(blobBackground);
  });

  const optimizedBackground = await resizeImage(backgroundBase64);

  // CAMBIO: indicamos tamaño relativo de la persona
  const prompt = `
  Eres un experto en edición fotográfica de moda.

  INSTRUCCIONES:

  1. Toma a la persona de la Imagen 1.
  2. Usa la prenda de la Imagen 2 como referencia de producto de moda y aplícala naturalmente al modelo.
  3. Mantén EXACTAMENTE la misma pose del usuario.
  4. Coloca a la persona en la perte supeior centrao del centro de la pasarela de la Imagen 3.
  5. Ajusta perspectiva, escala e iluminación para que parezca natural.
  6. La persona debe ocupar aproximadamente entre 25% y 35% de la altura de la escena.
  7. La persona debe verse completamente dentro del encuadre.
  8. Mantener realismo fotográfico.
  9. No generes sombras de la persona. 

  IMPORTANTE:
  - La prenda es un producto de moda y debe verse igual al producto de la Imagen 2.
  - Mantener diseño, color, textura y forma original de la prenda.
  - NO recortar la persona
  - NO eliminar el fondo
  - La imagen final debe incluir la tienda/pasarela.
  - La escena debe verse elegante, profesional y apropiada para un catálogo de ropa.
  - No cambiar ningun texto o elemento de la imagen de fondo.
  
  `;
//- No agregar elementos que no estén en las imágenes originales.
//  - No agregar prendas adicionales ni accesorios.
  try {

    const contents = [
      { text: prompt },

      {
        inlineData: {
          data: optimizedUserImg.split(",")[1],
          mimeType: "image/jpeg"
        }
      },

      {
        inlineData: {
          data: optimizedClothingImg.split(",")[1],
          mimeType: "image/jpeg"
        }
      },

      {
        inlineData: {
          data: optimizedBackground.split(",")[1],
          mimeType: "image/jpeg"
        }
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: contents,
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: "16:9",

          // CAMBIO: reducimos tamaño de imagen
          imageSize: "768x768"
        }
      }
    });

    console.log("Respuesta completa de la API:", response);
    const part = response.candidates[0].content.parts[0];

    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }

    throw new Error("La IA no devolvió imagen");

  } catch (error) {

    console.error("Error en runVirtualTryOn:", error);

    if (error.message.includes("429")) {
      throw new Error("LIMITE_EXCEDIDO");
    }

    throw error;
  }

};