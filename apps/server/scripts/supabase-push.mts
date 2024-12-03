import { execSync } from "child_process";

console.log("SUPABASE_PROJECT_ID", process.env.SUPABASE_PROJECT_ID);
// execSync(`npx supabase link --project-ref ${process.env.SUPABASE_PROJECT_ID}`, {
//   stdio: "inherit",
// });

// execSync(`npx supabase db push`, {
//   stdio: "inherit",
// });
