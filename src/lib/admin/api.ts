/** Parse API responses without assuming JSON (avoids "Unexpected token R" on 413 text). */
export async function readApiJson<T extends Record<string, unknown> = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = (await response.text()).trim();
  if (!response.ok) {
    const hint =
      response.status === 413 || /^request en/i.test(text)
        ? "File is too large for the server. Use a smaller file or paste an external link instead."
        : text.slice(0, 280) || `Request failed (${response.status})`;
    throw new Error(hint);
  }

  throw new Error(text.slice(0, 280) || "Unexpected non-JSON response.");
}
