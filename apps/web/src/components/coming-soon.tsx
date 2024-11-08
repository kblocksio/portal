import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import wingLogo from "../assets/wing-light.svg";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ComingSoon = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 overflow-hidden bg-black">
      <div className="absolute inset-0 h-screen w-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="h-full w-full"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="mx-auto flex flex-col items-center justify-center gap-10">
        <motion.img
          src={wingLogo}
          className="text-white"
          alt="Wing Logo"
          width={280}
          height={153}
          initial={{ opacity: 0, y: 30, scale: 0.75 }}
          animate={{ opacity: 0.68, y: 0, scale: 1 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <motion.h1
          className={cn(
            "text-center text-3xl font-bold md:text-7xl lg:text-6xl",
            "bg-gradient-to-b from-neutral-50 to-neutral-300 bg-clip-text text-transparent",
          )}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          Your{" "}
          <span className="bg-gradient-to-b from-yellow-50 to-yellow-600 bg-clip-text text-transparent">
            golden
          </span>{" "}
          path to production
        </motion.h1>
        {/* <TextGenerateEffect
          className="mt-6 self-end"
          textClassName="text-white text-3xl"
          duration={4}
          filter={false}
          words={"Coming Soon..."}
        /> */}
      </div>
      <Button
        variant="outline"
        className="z-10"
        onClick={() => {
          window.open("https://go.kblocks.io/early-access", "_blank");
        }}
      >
        Apply for early access
      </Button>
      {/* <button
        className={cn(
          "relative overflow-hidden rounded-full px-6 py-3",
          "bg-gradient-to-r from-yellow-500 to-yellow-600",
          "text-lg font-bold text-white shadow-lg",
          "transform transition-transform hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50",
        )}
      >
        Apply for early access
      </button> */}
    </div>
  );
};
