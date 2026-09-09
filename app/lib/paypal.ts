import "server-only";

type PayPalEnvironment = "sandbox" | "live";

type PayPalErrorBody = {
  message?: string;
  details?: Array<{ description?: string }>;
};

export class PayPalRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PayPalRequestError";
    this.status = status;
  }
}

function getPayPalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment: PayPalEnvironment = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new PayPalRequestError("PayPal is not configured on the server.", 503);
  }

  return {
    clientId,
    clientSecret,
    environment,
    apiBase: environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
}

async function getAccessToken() {
  const { clientId, clientSecret, apiBase } = getPayPalConfig();
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const body = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !body.access_token) {
    throw new PayPalRequestError(body.error_description ?? "PayPal authentication failed.", 502);
  }

  return body.access_token;
}

export async function paypalRequest<T>(path: string, init: RequestInit = {}) {
  const { apiBase } = getPayPalConfig();
  const accessToken = await getAccessToken();
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  const body = await response.json() as T & PayPalErrorBody;
  if (!response.ok) {
    const detail = body.details?.[0]?.description;
    throw new PayPalRequestError(detail ?? body.message ?? "PayPal could not process the request.", 502);
  }

  return body;
}

