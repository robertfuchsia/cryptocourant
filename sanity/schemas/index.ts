import type { SchemaTypeDefinition } from "sanity";
import { blockContent } from "./blockContent";
import { post } from "./post";
import { author } from "./author";
import { category } from "./category";
import { page } from "./page";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  author,
  category,
  page,
  siteSettings,
  blockContent,
];
