import { apiUrl } from "./api";
import { getAccessToken, setSession, getSnapshot, clearSession } from "./customerSession";

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: { field: string; message: string }[];

  constructor(message: string, status: number, code?: string, errors?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Attach the stored access token as a Bearer header. Defaults to true. */
  auth?: boolean;
  /** Internal — prevents the refresh-and-retry loop from recursing through the refresh call itself. */
  skipRefresh?: boolean;
}

async function parseErrorMessage(response: Response): Promise<ApiError> {
  let payload: Record<string, unknown> | null = null;
  try {
    payload = await response.json();
  } catch {
    // no JSON body
  }
  const message =
    (payload?.message as string | undefined) ??
    (typeof payload?.error === "string" ? (payload.error as string) : undefined) ??
    `Request failed with status ${response.status}`;
  const code = payload?.code as string | undefined;
  const errors = payload?.errors as { field: string; message: string }[] | undefined;
  return new ApiError(message, response.status, code, errors);
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }
  if (auth) {
    const token = getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers: requestHeaders,
    body: requestBody,
    credentials: "include",
  });

  if (response.status === 401 && auth && !skipRefresh) {
    try {
      await refreshAccessToken();
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    } catch {
      clearSession();
      throw await parseErrorMessage(response);
    }
  }

  if (!response.ok) {
    throw await parseErrorMessage(response);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function refreshAccessToken(): Promise<string> {
  const data = await apiFetch<{ success: boolean; accessToken: string }>("/customer/auth/refresh-token", {
    method: "POST",
    auth: false,
    skipRefresh: true,
  });
  const { customer } = getSnapshot();
  if (customer) setSession(customer, data.accessToken);
  return data.accessToken;
}
