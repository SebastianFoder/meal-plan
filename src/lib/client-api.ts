export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function parseApiError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Something went wrong.";
  const err = (payload as { error?: unknown }).error;
  if (!err || typeof err !== "object") return "Something went wrong.";

  const formErrors = (err as { formErrors?: string[] }).formErrors;
  if (Array.isArray(formErrors) && formErrors.length > 0) {
    return formErrors.join(" ");
  }

  const fieldErrors = (err as { fieldErrors?: Record<string, string[]> }).fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const parts = Object.values(fieldErrors).flat();
    if (parts.length > 0) return parts.join(" ");
  }

  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return "Check the form and try again.";
}

export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    throw new ApiError(parseApiError(payload), res.status);
  }
  return (await res.json()) as T;
}
