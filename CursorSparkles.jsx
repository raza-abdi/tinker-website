import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#0099FD", "#30C70B", "#FEC000"];

function Star({ color }) {
  return (
    <div
      className="relative"
      style={{
        width: 12,
        height: 12,
        filter: "blur(0.3px)",
      }}
    >
      {/* vertical */}
      <div
        className="absolute left-1/2 top-0 w-[1px] h-full"
        style={{
          transform: "translateX(-50%)",
          background: "white",
          opacity: 0.8,
        }}
      />

      {/* horizontal */}
      <div
        className="absolute top-1/2 left-0 h-[1px] w-full"
        style={{
          transform: "translateY(-50%)",
          background: "white",
          opacity: 0.8,
        }}
      />

      {/* gradient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          opacity: 0.4,
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}

export default function CursorSparkles() {
  const [sparkles, setSparkles] = useState([]);
  const [insideNav, setInsideNav] = useState(false);

  useEffect(() => {
    let lastSpawnTime = 0;
    
    const handleMove = (e) => {
      // detect navbar hover
      const nav = document.getElementById("liquid-nav");
      if (nav) {
        const rect = nav.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        setInsideNav(isInside);
        if (isInside) return;
      }

      // Throttle spawn rate based on velocity (simple time check for organic feel)
      const now = Date.now();
      if (now - lastSpawnTime < 40) return; // roughly 25fps spawn rate max
      lastSpawnTime = now;

      const newSparkle = {
        id: now,
        x: e.clientX + (Math.random() - 0.5) * 30, // Dispersion
        y: e.clientY + (Math.random() - 0.5) * 30,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      setSparkles((prev) => [...prev.slice(-15), newSparkle]); // Max 15 particles onscreen
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <AnimatePresence>
        {!insideNav &&
          sparkles.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
              }}
            >
              <Star color={s.color} />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}