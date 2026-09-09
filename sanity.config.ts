"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: "CryptoCourant",
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Site-instellingen is een singleton: niet dupliceren of verwijderen.
    actions: (prev, { schemaType }) =>
      schemaType === "siteSettings"
        ? prev.filter(
            ({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish"
          )
        : prev,
  },
});
