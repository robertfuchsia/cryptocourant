export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-09";

/** In demo-modus zijn deze waarden nooit in gebruik, maar de client wil ze wel hebben. */
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo";
export const readToken = process.env.SANITY_API_READ_TOKEN || "";
