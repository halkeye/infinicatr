// eslint-disable-next-line import/no-unresolved
import { defineConfig, globalIgnores } from "eslint/config";
import pluginPromise from "eslint-plugin-promise";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import js from "@eslint/js";

export default defineConfig([
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  pluginPromise.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs}"],
    // plugins: { js },
    // extends: ["js/recommended"],
    rules: {
      semi: [2, "always"],
      "no-extra-semi": 2,
      "no-unused-vars": [
        2,
        {
          vars: "all",
          args: "after-used",
        },
      ],
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: [
      "rollup.config.mjs",
      "rollup-plugin-fake-mustache.mjs",
      "rollup-plugin-manifest-json.mjs",
      "eslint.config.mjs",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "import/no-nodejs-modules": "off",
    },
  },
  globalIgnores([
    "**/*.diff",
    "**/*.err",
    "**/*.orig",
    "**/*.log",
    "**/*.rej",
    "**/*.swo",
    "**/*.swp",
    "**/*.vi",
    "**/*~",
    "**/*.sass-cache",
    "**/.DS_Store",
    "**/._*",
    "**/Thumbs.db",
    "**/.cache",
    "**/.project",
    "**/.settings",
    "**/.tmproj",
    "**/nbproject",
    "**/*.sublime-project",
    "**/*.sublime-workspace",
    "**/*.esproj",
    "**/*.espressostorage",
    "**/*.rbc",
    "**/.hg",
    "**/.svn",
    "**/.CVS",
    "**/intermediate",
    "**/publish",
    "**/.idea",
    "build/buildinfo.properties",
    "build/config/buildinfo.properties",
    "**/.tmp",
    "**/.grunt",
    "**/www-built",
    "**/dist",
    "**/www-ghdeploy",
    "**/package.zip",
    "**/node_modules",
    "app/bower_components",
    "**/.direnv",
    "**/.envrc",
  ]),
]);
