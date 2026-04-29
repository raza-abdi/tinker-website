import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// --- SHADER MATERIAL FOR ADVANCED LIQUID GLASS ---
// We use MeshTransmissionMaterial, which is a pre-built advanced 
// glass/refraction shader in @react-three/drei, perfect for this.
// Note: In a real production environment, you might build a completely custom 
// ShaderMaterial using glsl for the exact sine-wave surface deformation, 
// magnetic cursor attraction, and time-based ripple propagation.
// Here we use the physical transmission to achieve the "real optical behavior".

const LiquidGlassBody = ({ width, height, radius, isOrb }) => {
  const meshRef = useRef();
  
  // Subtle idle breathing & surface motion
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        // Very subtle surface motion (breathing)
        meshRef.current.position.y = Math.sin(t * 2) * 0.05;
        // If it's an orb, maybe give it a microscopic rotation
        if (isOrb) {
             meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        } else {
             meshRef.current.rotation.y = 0;
        }
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* We use a rounded box geometry that interpolates based on states */}
      <roundedBoxGeometry args={[width, height, 0.4, 16, radius]} />
      <MeshTransmissionMaterial 
        backside
        backsideThickness={0.1}
        thickness={0.5}
        chromaticAberration={0.04}
        anisotropy={0.2}
        distortion={0.3}     // Dynamic refraction
        distortionScale={0.5}
        temporalDistortion={0.1} // Continuous flowing highlight bands
        ior={1.5}            // High transmission / Index of Refraction
        color="#ffffff"
        clearcoat={1}
        clearcoatRoughness={0.1}
        roughness={0.05}
        envMapIntensity={1.5} // Realistic edge reflections from environment
      />
    </mesh>
  );
};


// --- OVERLAY UI ORCHESTRATION (FRAMER MOTION) ---
export default function NextLevelLiquidNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection to trigger Morphing: Expanded -> Orb
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 50 && open) {
          setOpen(false)
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  const navItems = ["Home", "Products", "Uses", "Pricing", "Company"];

  // Premium Custom Easing Curve
  const ease = [0.22, 1, 0.36, 1];

  return (
    <>
      <style>{`
        /* Global Ambient Light / Physics backdrop */
        body {
            background-color: #f8f9fa;
            background-image: 
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
            min-height: 200vh;
        }
        
        /* The container for the 3D Canvas -> Absolute background behind HTML Nav */
        .webgl-glass-container {
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none; /* Let HTML layers catch hovers */
        }
      `}</style>
      
      {/* 
         Unified Interaction Field: 
         Right-anchored control node container 
      */}
      <div id="liquid-nav" className="fixed top-6 right-6 md:left-1/2 md:-translate-x-1/2 md:right-auto z-50 flex justify-end md:justify-center w-full md:w-auto pr-6 md:pr-0 pointer-events-none perspective-1000">

        {/* Morphing Nav Wrapper */}
        <motion.div
          initial={false}
          animate={{
            width: scrolled ? "64px" : "100%",
            maxWidth: scrolled ? "64px" : "800px",
            height: scrolled ? "64px" : "60px",
            borderRadius: scrolled ? "999px" : "50px",
          }}
          transition={{ duration: 0.8, ease }}
          className="relative pointer-events-auto flex items-center justify-between"
          style={{ transformOrigin: "right center" }}
        >
            
          {/* --- WEBGL LAYER: Optical Simulation --- */}
          <div className="webgl-glass-container">
              <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 100 }}>
                 <ambientLight intensity={0.5} />
                 <directionalLight position={[10, 10, 10]} intensity={1} />
                 <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#0099FD" />
                 
                 {/* 
                    Pass state into the 3D glass body to morph its geometry natively.
                    We map the pixel dimensions roughly into ThreeJS units given orthographic camera. 
                 */}
                 <LiquidGlassBody 
                    width={scrolled ? 0.64 : 8.0} 
                    height={scrolled ? 0.64 : 0.60} 
                    radius={scrolled ? 0.32 : 0.30}
                    isOrb={scrolled}
                 />
              </Canvas>
          </div>

          {/* --- HTML/UI FOREGROUND LAYER --- */}
          {/* Inner Light Redistribution & Specular Highlights */}
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(255,255,255,0.1)] pointer-events-none" />
          
          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, ease, delay: 0.1 }}
                className="hidden md:flex items-center gap-6 w-full px-6 relative z-10 w-[800px]"
              >
                {navItems.map((item) => (
                  <motion.div 
                    key={item} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/90 font-medium text-sm cursor-pointer hover:text-white transition-colors relative group px-3 py-2"
                  >
                     {item}
                  </motion.div>
                ))}
                
                <div className="ml-auto">
                    <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/10 border border-white/20 text-white px-6 py-1.5 rounded-full font-semibold text-sm backdrop-blur-md"
                    >
                        Start Learning
                    </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- ORB INTERACTION TRIGGER (Right Anchored) --- */}
          <motion.button
            onClick={() => setOpen(!open)}
            whileTap={{ scale: 0.85 }}
            className={`w-[64px] h-[64px] rounded-full flex items-center justify-center relative z-50 overflow-hidden ${scrolled ? 'absolute right-0' : 'md:hidden ml-auto'}`}
          >
             {/* Micro-interaction: localized specular pulse on hover */}
             <motion.div 
                whileHover={{ opacity: 1, scale: 1.5 }}
                className="absolute inset-0 bg-white/20 opacity-0 rounded-full blur-md transition-all duration-500" 
             />
             
             {/* Morphing Menu Icon */}
            <div className="flex flex-col gap-[5px] items-center justify-center w-6 h-6 relative z-10">
              <motion.div animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }} transition={{ duration: 0.5, ease }} className="w-5 h-[1.5px] bg-white rounded-full origin-center" />
              <motion.div animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.2 }} className="w-5 h-[1.5px] bg-white rounded-full" />
              <motion.div animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }} transition={{ duration: 0.5, ease }} className="w-5 h-[1.5px] bg-white rounded-full origin-center" />
            </div>
          </motion.button>

        </motion.div>

        {/* --- DOWNSTREAM LIQUID EXPANSION (Menu Panel) --- */}
        {/* Simulates menu emerging as a liquid extension of the glass body, right-to-left */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: 30, scaleX: 0.9, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, scaleX: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, scaleX: 0.95, filter: "blur(4px)" }}
              transition={{ duration: 0.7, ease }}
              className="absolute top-20 right-6 w-72 rounded-3xl p-8 flex flex-col items-start gap-2 pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5 saturate-200 text-left"
              style={{ transformOrigin: "top right", alignItems: 'flex-start' }}
            >
              {/* Dropdown items materialize with staggered opacity and left alignment */}
              {navItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 15, x: 10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease }}
                  className="w-full text-white/80 font-medium text-lg cursor-pointer py-3 border-b border-white/5 last:border-0 hover:text-white transition-colors"
                >
                  {item}
                </motion.div>
              ))}
              
              <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.06 + 0.1, duration: 0.5, ease }}
                  className="w-full mt-6"
              >
                  <button className="w-full bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl font-semibold text-center hover:bg-white/20 transition-all relative overflow-hidden group">
                      <span className="relative z-10">Start Learning</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
                  </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}