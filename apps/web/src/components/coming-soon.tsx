import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";

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
        <img
          src="/wing-light.svg"
          className="text-white"
          alt="Wing Logo"
          width={280}
          height={153}
        />
        <h1 className="text-center text-3xl font-bold text-white md:text-7xl lg:text-6xl">
          Your golden path to production
        </h1>
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
    </div>
  );
};
