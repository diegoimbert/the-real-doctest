// Copyright (c) 2023 Diego Imbert
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ignore-imports.js", {
  parentURL: pathToFileURL(__filename),
});
register("./doctest.js", {
  parentURL: pathToFileURL(__filename),
});
