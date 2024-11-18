import concurrently from "concurrently";
import type { CloseEvent } from "concurrently";
import { execSync } from "child_process";
import dotenv from "@dotenvx/dotenvx";

// Use dotenv to load environment variables
dotenv.config();

// Start supabase
execSync("npx supabase start", {
  stdio: "inherit",
});

// Load supabase env variables
const supabaseStatusJson = JSON.parse(
  execSync("npx supabase status --output json").toString(),
);

// Load supabase env variables into the current shell
for (const [key, value] of Object.entries(supabaseStatusJson)) {
  if (typeof value === "string") {
    process.env[`SUPABASE_${key}`] = value;
  }
}

// Reload dotenv to pick up missing expansions
dotenv.config({ override: true });

try {
  await concurrently(
    [
      {
        command: "npx tsx watch src/index.ts --clear-screen=false",
        name: "server",
        prefixColor: "blue",
      },
      {
        name: "web",
        prefixColor: "purple",
        command: "npx vite --open",
        cwd: "../web",
      },
      {
        command:
          "docker run --rm -p 6379:6379 -p 8001:8001 -e REDIS_ARGS='--requirepass u52u2dgOtXNFYYSSHc0PI' redis/redis-stack:latest",
        name: "redis",
        prefixColor: "red",
      },
    ],
    {
      killOthers: ["failure"],
    },
  ).result;
} catch (error) {
  const closeEvents = error as CloseEvent[];
  for (const event of closeEvents) {
    console.log(`[${event.command.name}] exited with code ${event.exitCode}`);
  }
}
