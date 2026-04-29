import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiquidMobileNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll to transform navbar into orb
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

  return (
    <>
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.08), 
            0 15px 25px rgba(0, 0, 0, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 1), 
            inset 0 -1px 0 rgba(255, 255, 255, 0.4);
        }
        
        .liquid-hover {
            position: relative;
            overflow: hidden;
        }
        
        .liquid-hover::before {
            content: '';
            position: absolute;
            top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-20deg);
            pointer-events: none;
            transition: all 0.8s ease;
            opacity: 0;
            mix-blend-mode: overlay;
        }

        .liquid-hover:hover::before {
            opacity: 1;
            left: 200%;
            transition: left 1.5s ease-in-out;
        }
      `}</style>
      
      {/* Container that handles positioning */}
      <div className="fixed top-6 right-6 md:left-1/2 md:-translate-x-1/2 md:right-auto z-50 flex justify-end md:justify-center w-full md:w-auto pr-6 md:pr-0 pointer-events-none">
        
        {/* The Morphing Navigation Element */}
        <motion.div
          initial={false}
          animate={{
            width: scrolled ? "64px" : "100%",
            maxWidth: scrolled ? "64px" : "800px",
            borderRadius: scrolled ? "999px" : "50px",
            padding: scrolled ? "0px" : "8px 16px",
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1], // Premium smooth
          }}
          className="glass-panel liquid-hover flex items-center justify-between border-none pointer-events-auto h-[60px]"
          style={{ transformOrigin: "right center" }}
        >
          {/* Desktop Links (Hidden when scrolled or on small screens) */}
          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, width: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="hidden md:flex items-center gap-6 w-full px-4"
              >
                {navItems.map((item) => (
                  <div key={item} className="text-black font-medium text-sm cursor-pointer hover:text-[#0099FD] transition-colors relative group px-3 py-2 rounded-full hover:bg-white/40">
                     {item}
                     {(item === "Products" || item === "Uses" || item === "Company") && (
                         <span className="ml-1 inline-block w-2 h-2 border-r border-b border-current transform rotate-45 mb-1 group-hover:translate-y-0.5 transition-transform" />
                     )}
                  </div>
                ))}
                
                <div className="ml-auto">
                    <button className="bg-black text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#0099FD] transition-all transform hover:-translate-y-0.5 shadow-lg">
                        Start Learning
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile / Scrolled Orb Button */}
          <motion.button
            onClick={() => setOpen(!open)}
            whileTap={{ scale: 0.9 }}
            className={`w-[60px] h-[60px] rounded-full flex items-center justify-center relative z-50 ${scrolled ? 'absolute right-0' : 'md:hidden ml-auto'}`}
          >
            {/* Morphing Hamburger/Close Icon */}
            <div className="flex flex-col gap-[5px] items-center justify-center w-6 h-6">
              <motion.div
                animate={{ 
                    rotate: open ? 45 : 0, 
                    y: open ? 7 : 0,
                    backgroundColor: open ? "#0099FD" : "#000000"
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-5 h-[2px] rounded-full origin-center"
              />
              <motion.div
                animate={{ opacity: open ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-[2px] bg-black rounded-full"
              />
              <motion.div
                animate={{ 
                    rotate: open ? -45 : 0, 
                    y: open ? -7 : 0,
                    backgroundColor: open ? "#0099FD" : "#000000"
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-5 h-[2px] rounded-full origin-center"
              />
            </div>
          </motion.button>
        </motion.div>

        {/* Right-to-Left Expanding Menu (Mobile & Scrolled State) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute top-20 right-6 w-64 glass-panel rounded-3xl p-6 flex flex-col items-start gap-2 pointer-events-auto"
              style={{ transformOrigin: "top right" }}
            >
              {navItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="w-full text-black font-semibold text-lg cursor-pointer py-3 border-b border-white/20 last:border-0 hover:text-[#0099FD] transition-colors flex justify-between items-center group"
                >
                  {item}
                  {(item === "Products" || item === "Uses" || item === "Company") && (
                         <span className="w-2 h-2 border-r-2 border-t-2 border-current transform rotate-45 group-hover:translate-x-1 transition-transform" />
                  )}
                </motion.div>
              ))}
              
              <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="w-full mt-4"
              >
                  <button className="w-full bg-black text-white px-6 py-3 rounded-2xl font-semibold text-center hover:bg-[#0099FD] transition-all shadow-lg">
                      Start Learning
                  </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}