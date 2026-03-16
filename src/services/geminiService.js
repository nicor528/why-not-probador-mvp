import { resizeImage } from "../utils/imageOptimizer";
import { GoogleGenAI } from "@google/genai";
import fondo from "../assets/fondo-tienda.png";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

const getMime = (base64) => {
  if (base64.includes("image/png")) return "image/png";
  if (base64.includes("image/webp")) return "image/webp";
  return "image/jpeg";
};

export const runVirtualTryOn = async (userImageBase64, clothingAssetPath, backgroundPath) => {

  const optimizedUserImg = await resizeImage(userImageBase64);

  const responseClothing = await fetch(clothingAssetPath);
  const blobClothing = await responseClothing.blob();

  const clothingBase64 = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(blobClothing);
  });

  const optimizedClothingImg = await resizeImage(clothingBase64);

  const responseBackground = await fetch(backgroundPath);
  const blobBackground = await responseBackground.blob();

  const backgroundBase64 = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(blobBackground);
  });

  const optimizedBackground = await resizeImage(backgroundBase64);

  // CAMBIO: indicamos tamaño relativo de la persona
  /*const prompt = `
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
  
  `;*/
  const promptBase = `
  Eres un editor profesional de fotografía de moda para catálogo de e-commerce.

  La Imagen 2 es una fotografía de producto de una prenda de moda utilizada en un catálogo comercial.

  TAREA
  Generar una escena editorial de moda combinando tres imágenes.

  Imagen 1: modelo en pose neutra.
  Imagen 2: prenda de moda (producto).
  Imagen 3: escenario de tienda con pasarela.

  Instrucciones:

  - Mantener la pose exacta del modelo de la Imagen 1.
  - Generar una fotografía donde el modelo lleva una prenda idéntica al producto mostrado en la Imagen 2.
  - Colocar al modelo en el centro de la pasarela de la Imagen 3.
  - Ajustar iluminación, perspectiva y escala para que parezca una fotografía real tomada en ese lugar.

  Reglas:

  - Mantener diseño, textura y color de la prenda.
  - No modificar el escenario.
  - No agregar otros elementos.
  - Estilo: fotografía editorial de catálogo profesional.
  `;

  const prompt = `
    La Imagen 2 es una fotografía de producto de una prenda de moda para catálogo comercial.

    ${promptBase}
  `;
//- No agregar elementos que no estén en las imágenes originales.
//  - No agregar prendas adicionales ni accesorios.

  if (!optimizedUserImg || !optimizedClothingImg || !optimizedBackground) {
    throw new Error("Alguna imagen llegó vacía");
  }

  try {

   const contents = [
    { text: prompt },

    // PRODUCTO PRIMERO
    {
      inlineData: {
        data: optimizedClothingImg.split(",")[1],
        mimeType: "image/jpeg"
      }
    },

    // MODELO
    {
      inlineData: {
        data: optimizedUserImg.split(",")[1],
        mimeType: "image/jpeg"
      }
    },

    // FONDO
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
          //imageSize: "768x768"
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