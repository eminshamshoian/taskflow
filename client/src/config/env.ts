const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL");
}

const parsedUrl = new URL(apiUrl);

if (!["http:", "https:"].includes(parsedUrl.protocol)) {
  throw new Error("VITE_API_URL must use HTTP or HTTPS");
}

export const env = Object.freeze({
  apiUrl: apiUrl.replace(/\/+$/, ""),
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
});
