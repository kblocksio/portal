import { execSync } from "child_process";

execSync(`npx supabase link --project-ref ${process.env.SUPABASE_PROJECT_ID}`, {
  stdio: "inherit",
});

execSync(`npx supabase db push`, {
  stdio: "inherit",
});
