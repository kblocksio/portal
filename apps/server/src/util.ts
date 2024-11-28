import type { Request, Response } from "express";
import { createServerSupabase, privateSupabase } from "./supabase";
import { refreshToken } from "./github";

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export async function getUserAccessToken(
  req: Request,
  res: Response,
): Promise<{
  accessToken: string | undefined;
}> {
  const supabase = createServerSupabase(req, res);
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    console.error("User is not signed in to Supabase", user.error?.message);
    return {
      accessToken: undefined,
    };
  }

  const { data, error } = await privateSupabase
    .from("user_ghtokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", user.data.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error getting access token from Supabase", error);
    return {
      accessToken: undefined,
    };
  }

  if (!data?.refresh_token || !data?.access_token) {
    return {
      accessToken: undefined,
    };
  }

  // If the access token is not expired, return it.
  if (data.expires_at && new Date(data.expires_at) > new Date()) {
    return {
      accessToken: data.access_token,
    };
  }

  // Otherwise, refresh the token.
  const tokens = await refreshToken({
    refreshToken: data.refresh_token,
  });

  const { error: upsertError } = await privateSupabase
    .from("user_ghtokens")
    .upsert([
      {
        user_id: user.data.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        refresh_token_expires_in: tokens.refresh_token_expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        expires_at: new Date(
          new Date().getTime() + tokens.expires_in * 1000,
        ).toISOString(),
        refresh_token_expires_at: new Date(
          new Date().getTime() + tokens.refresh_token_expires_in * 1000,
        ).toISOString(),
      },
    ]);

  if (upsertError) {
    console.error("Error upserting access token to Supabase", upsertError);
  }

  return {
    accessToken: tokens.access_token,
  };
}

export async function getUserOctokit(
  req: Request,
  res: Response,
): Promise<InstanceType<typeof Octokit> | undefined> {
  const { accessToken } = await getUserAccessToken(req, res);
  if (!accessToken) {
    return undefined;
  }
  const { Octokit } = await import("octokit");
  return new Octokit({ auth: accessToken });
}
