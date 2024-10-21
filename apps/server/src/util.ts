import type { Request, Response } from "express";
import { createServerSupabase } from "./supabase";
import { refreshToken } from "./github";

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export async function getUserAccessToken(req: Request, res: Response) {
  const supabase = createServerSupabase(req, res);
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("user_ghtokens")
    .select("refresh_token")
    .eq("user_id", user.data.user?.id)
    .single();

  if (error) {
    console.error("Error getting access token", error);
    throw error;
  }

  const tokens = await refreshToken(data.refresh_token);

  {
    const { error } = await supabase.from("user_ghtokens").upsert([
      {
        user_id: user.data.user?.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        refresh_token_expires_in: tokens.refresh_token_expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
    ]);

    if (error) {
      console.error(error);
    }
  }

  return {
    accessToken: tokens.access_token,
  };
}

export async function getUserOctokit(req: Request, res: Response) {
  const { accessToken } = await getUserAccessToken(req, res);
  const { Octokit } = await import("octokit");
  return new Octokit({ auth: accessToken });
}
