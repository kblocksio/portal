import { getEnv } from "./util";

export interface GithubTokens {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
  scope: string;
}

export type GithubTokensResponse = GithubTokens | { error: Error };

export const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: getEnv("GITHUB_CLIENT_ID"),
      client_secret: getEnv("GITHUB_CLIENT_SECRET"),
    }),
  });
  if (!response.ok) {
    console.error(response.status, response.statusText, await response.text());
    return { error: new Error("Failed to exchange code for tokens") };
  }
  const data = await response.json();
  return data as GithubTokens;
};

export interface RefreshTokenOptions {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
  scope: string;
}

export const refreshToken = async (options: RefreshTokenOptions) => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: options.refreshToken,
      client_id: getEnv("GITHUB_CLIENT_ID"),
      client_secret: getEnv("GITHUB_CLIENT_SECRET"),
    }),
  });
  if (!response.ok) {
    console.error(
      "Error refreshing the token on GitHub",
      response.status,
      response.statusText,
      await response.text(),
    );
    console.error({
      grant_type: "refresh_token",
      refresh_token: `${options.refreshToken.slice(0, 6)}...`,
      client_id: `${getEnv("GITHUB_CLIENT_ID").slice(0, 6)}...`,
      client_secret: `${getEnv("GITHUB_CLIENT_SECRET").slice(0, 6)}...`,
    });
    throw new Error("Failed to refresh token");
  }
  const data = await response.json();
  return data as RefreshTokenResponse;
};
