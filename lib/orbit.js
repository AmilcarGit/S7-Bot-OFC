import config from "../config.js";

const BASE_URL = "https://orbit-cloud.onrender.com/api/v1";

export async function orbitGet(ruta, params = {}) {
  const query = new URLSearchParams({
    apikey: config.orbitApiKey,
    ...params,
  }).toString();

  const url = `\( {BASE_URL} \){ruta}?${query}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-orbit-ip": config.orbitIp,
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Orbit API HTTP ${response.status} - ${response.statusText}`);
  }

  return response.json();
}