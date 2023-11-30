import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ignore-imports.js", {
  parentURL: pathToFileURL(__filename),
});