import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

import type { Request, Response } from "express";
import type { Database } from "./supabase.types";
import { getEnv } from "./util";

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_KEY");

export const createServerSupabase = (req: Request, res: Response) => {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.header("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.append("Set-Cookie", serializeCookieHeader(name, value, options)),
        );
      },
    },
  });
};
