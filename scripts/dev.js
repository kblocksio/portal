import concurrently from "concurrently";

process.on("SIGINT", () => {
  console.log("Gracefully shutting down...");
  process.exit(0);
});

(async () => {
  try {
    await concurrently([
      {
        command: "kubectl port-forward svc/portal-redis 6379:18284 -n default",
        name: "redis",
        prefixColor: "red",
      },
      {
        command: "npm run dev",
        cwd: "apps/server",
        name: "server",
        prefixColor: "blue",
      },
      {
        command: "npm run dev",
        cwd: "apps/web",
        name: "web",
        prefixColor: "magenta",
      },
    ]).result;
  } catch (error) {
    console.error(error);
  }
})();
