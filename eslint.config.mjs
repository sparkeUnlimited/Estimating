import { defineConfig } from "eslint/config";
import globals from "globals";
/* import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react"; */

// export default defineConfig([
// { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
// { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
// { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
// tseslint.configs.recommended,
// pluginReact.configs.flat.recommended,
// ]);

export default defineConfig([
  {
    files: ["**/*.js", "**/*.mjs"],
    ignores: ["**/*.test.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.amd,
      },
    },
  },
]);
