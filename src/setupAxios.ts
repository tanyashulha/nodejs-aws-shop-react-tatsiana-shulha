import axios, { AxiosError, AxiosResponse } from "axios";

const FALLBACK_AUTH_MESSAGES: Record<401 | 403, string> = {
  401: "Error 401: Unauthorized — authorization is required",
  403: "Error 403: Forbidden — invalid or expired credentials",
};

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authorization_token");
  if (!token) {
    return {};
  }

  return { Authorization: `Basic ${token}` };
}

export function getAuthorizedRequestConfig() {
  return {
    headers: getAuthHeaders(),
    validateStatus: () => true,
  };
}

/** Same as: const data = await res.json(); data.message ?? `Error ${res.status}` */
export function getHttpErrorMessage(status: number, data?: unknown): string {
  if (data && typeof data === "object" && data !== null) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  if (status === 401 || status === 403) {
    return FALLBACK_AUTH_MESSAGES[status];
  }

  return `Error ${status}`;
}

export function assertOkResponse<T>(response: AxiosResponse<T>): T {
  if (response.status >= 400) {
    throw new Error(getHttpErrorMessage(response.status, response.data));
  }

  return response.data;
}

export function getAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return getHttpErrorMessage(error.response.status, error.response.data);
    }

    if (error.message === "Network Error") {
      return localStorage.getItem("authorization_token")
        ? FALLBACK_AUTH_MESSAGES[403]
        : FALLBACK_AUTH_MESSAGES[401];
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      window.alert(
        getHttpErrorMessage(error.response.status, error.response.data)
      );
    }

    return Promise.reject(error);
  }
);
