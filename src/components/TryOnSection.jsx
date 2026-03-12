import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import { runVirtualTryOn } from '../services/geminiService';
import ropaPrenda from '../assets/ropa1.jpeg';

const TryOnSection = () => {
  const [status, setStatus] = useState('idle'); 
  const [resultImg, setResultImg] = useState(null);
  const fileInputRef = useRef(null);

  const handleProcess = async (file) => {
    if (!file) return;
    setStatus('processing');
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const result = await runVirtualTryOn(reader.result, ropaPrenda);
        setResultImg(result);
        setStatus('success');
      } catch (err) {
        setStatus('idle');
        alert("Error en la simulación.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative z-20">
      <AnimatePresence mode="wait">
        
        {/* IDLE / PROCESSING */}
        {(status === 'idle' || status === 'processing') && (
          <motion.div 
            key={status}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-[60]"
          >
            {status === 'idle' && (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-white/10 backdrop-blur-3xl border border-white/20 p-16 rounded-full hover:bg-white/20 transition-all shadow-2xl"
                >
                  <Upload className="text-white" size={40} strokeWidth={1} />
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => handleProcess(e.target.files[0])} className="hidden" />
                <p className="text-white mt-8 tracking-[0.8em] text-[10px] uppercase font-light opacity-50">Upload Photo</p>
              </div>
            )}

            {status === 'processing' && (
              <div className="text-center">
                <Loader2 className="text-white animate-spin mx-auto mb-6 opacity-40" size={48} />
                <p className="text-white text-[10px] tracking-[0.6em] uppercase animate-pulse">Generando Fit...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ÉXITO: LIMITADO AL 30% Y CENTRADO */}
        {status === 'success' && (
          <motion.div 
            key="success" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="fixed inset-0 flex items-center justify-center z-[999] pointer-events-none"
          >
            {/* El contenedor principal no tiene h-full para evitar el scroll */}
            <div className="flex flex-col items-center pointer-events-auto">
              
              {/* IMAGEN: Limitada al 30% del alto de la pantalla (30vh) */}
              <div className="relative flex justify-center items-center overflow-hidden">
                <img 
                  src={resultImg} 
                  alt="Try On Result" 
                  className="h-[30vh] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] brightness-110"
                />
              </div>

              {/* BOTONES: Compactos para que todo quepa en el centro */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <button 
                  onClick={() => setStatus('idle')} 
                  className="text-white/50 text-[9px] uppercase tracking-[0.4em] hover:text-white transition-all border-b border-white/10 pb-1"
                >
                  Try another
                </button>
                
                <button className="bg-white text-black px-10 py-3 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-transform">
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default TryOnSection;