import { env } from "@/env";

const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const MEMBER_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedMembers: { emails: Set<string>; expiresAt: number } | null = null;

function base64UrlEncode(input: string | Uint8Array): string {
  let binary: string;
  if (typeof input === "string") {
    binary = input;
  } else {
    binary = "";
    for (let i = 0; i < input.length; i++)
      binary += String.fromCharCode(input[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

async function signJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64UrlEncode(
    JSON.stringify({
      iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  );
  const signingInput = `${header}.${claims}`;

  // Private keys in env files are typically stored with literal \n escapes
  const pem = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const assertion = await signJwt();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Google token exchange failed: ${res.status} ${await res.text()}`,
    );
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function fetchMemberEmails(): Promise<Set<string>> {
  if (cachedMembers && cachedMembers.expiresAt > Date.now()) {
    return cachedMembers.emails;
  }
  const token = await getAccessToken();
  const range = encodeURIComponent("C2:C");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_MEMBERS_ID}/values/${range}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(
      `Google Sheets fetch failed: ${res.status} ${await res.text()}`,
    );
  }
  const data = (await res.json()) as { values?: string[][] };
  const emails = new Set<string>();
  for (const row of data.values ?? []) {
    const value = row[0]?.trim().toLowerCase();
    if (value) emails.add(value);
  }
  cachedMembers = { emails, expiresAt: Date.now() + MEMBER_CACHE_TTL_MS };
  return emails;
}

export async function isClubMember(email: string): Promise<boolean> {
  const emails = await fetchMemberEmails();
  return emails.has(email.trim().toLowerCase());
}
