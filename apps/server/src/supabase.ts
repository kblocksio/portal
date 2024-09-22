import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

import type { Request, Response } from "express";

export const createServerSupabase = (req: Request, res: Response) => {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.header("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            ),
          );
        },
      },
    },
  );
};
