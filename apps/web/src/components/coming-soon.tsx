import { motion } from "framer-motion";
import { useMemo } from "react";

import "./coming-soon.css";

const Star = () => {
  const style = useMemo(() => {
    const size = Math.ceil(Math.random() * 2);
    const delay = Math.random().toFixed(2);
    const duration = 1 + Math.random() * 5;
    const intensity = Math.random() * 0.5 + 0.25;
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      transitionDelay: `${delay}s`,
      animationDelay: `${delay}s`,
      "--duration": `${duration}s`,
      backgroundColor: `rgba(255, 255, 255, ${intensity})`,
    };
  }, []);
  return (
    <div
      className="absolute animate-[pulse_var(--duration)_ease-in-out_infinite] rounded-full"
      style={style}
    ></div>
  );
};

const starCount = 1000;

export function ComingSoon() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black bg-gradient-to-b from-black via-purple-900/80 to-indigo-900/80">
      <div className="pointer-events-none">
        {Array.from({ length: starCount }).map((_, index) => (
          <Star key={index} />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center text-center"
      >
        <img src="/images/wing.svg" alt="Wing Logo" />
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 text-5xl font-bold text-white"
        >
          Coming Soon
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 text-xl text-white"
        >
          We're working on something{" "}
          <motion.span
            className="font-bold"
            animate={{
              color: [
                "hsl(0, 100%, 70%)",
                "hsl(60, 100%, 70%)",
                "hsl(120, 100%, 70%)",
                "hsl(180, 100%, 70%)",
                "hsl(240, 100%, 70%)",
                "hsl(300, 100%, 70%)",
                "hsl(360, 100%, 70%)",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            exciting
          </motion.span>
          . Come back later!
        </motion.p>
      </motion.div>
    </div>
  );
}
