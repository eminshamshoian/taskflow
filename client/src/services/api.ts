import { env } from "../config/env";

export async function getHealth() {
  const response = await fetch(`${env.apiUrl}/health`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
