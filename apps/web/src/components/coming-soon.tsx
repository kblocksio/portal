import { SparklesCore } from "./ui/sparkles";
import { TextGenerateEffect } from "./ui/text-generate-effect";

export const ComingSoon = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black">
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
      <div className="mx-auto flex flex-col items-center justify-center">
        <img
          src="/wing-light.svg"
          className="text-white"
          alt="Wing Logo"
          width={280}
          height={153}
        />
        <h1 className="text-center text-3xl font-bold text-white md:text-7xl lg:text-6xl">
          Paving platform golden paths
        </h1>
        <TextGenerateEffect
          className="mt-6 self-end"
          textClassName="text-white text-3xl"
          duration={4}
          filter={false}
          words={"Coming Soon..."}
        />
      </div>
    </div>
  );
};
