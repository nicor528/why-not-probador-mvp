import React, { useState, useEffect } from "react";
import ClothingCarousel from "./components/ClothingCarousel";
import UploadPanel from "./components/UploadPanel";
import { runVirtualTryOn } from "./services/geminiService";
import { loadBrand } from "./config/loadBrand";

const brandConfig = loadBrand();

//import fondo from "./assets/fondo-tienda.png";
const fondo = brandConfig.background;
import "./styles/app.css";

const App = () => {

  const [selectedClothing, setSelectedClothing] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [generatedScene, setGeneratedScene] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetTryOn = () => {
    setGeneratedScene(null);
    setSelectedClothing(null);
    setUserImage(null);
  };

  useEffect(() => {

    const generate = async () => {

      if (!selectedClothing || !userImage) return;

      setLoading(true);

      try {

        const result = await runVirtualTryOn(
          userImage,
          selectedClothing,
          brandConfig.background
        );

        setGeneratedScene(result);

      } catch (err) {

        console.error(err);
        alert("Error generando la imagen");

      }

      setLoading(false);
    };

    generate();

  }, [selectedClothing, userImage]);

  /* RESULTADO */

  if (generatedScene) {

    return (

      <div className="result-screen">

        <img src={generatedScene} />

        <div className="result-buttons">

          <button className="try-again" onClick={resetTryOn}>
            Volver a probar
          </button>

          <button className="cart">
            Agregar al carrito
          </button>

        </div>

      </div>

    );

  }

  /* VISTA INICIAL */

  return (

    <div className="app-container">

      <div className="background">
        <img src={fondo} />
      </div>

      <div className="ui-layer">

        <div className="instructions">

          <h3>Probar look</h3>

          <ol>
            <li> Elegir tu prenda</li>
            <li> Tomarte una foto de cuerpo completo desde el frente</li>
            <li> Subir la foto</li>
            <li> Esperar</li>
          </ol>

        </div>

        <div className="bottom-panel">

          <ClothingCarousel
            onSelect={setSelectedClothing}
            selected={selectedClothing}
          />

          <UploadPanel
            onUpload={setUserImage}
          />

        </div>

      </div>

      {loading && (

        <div style={{
          position:"absolute",
          inset:0,
          background:"rgba(0,0,0,0.6)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          color:"white"
        }}>
          Generando look...
        </div>

      )}

    </div>

  );

};

export default App;