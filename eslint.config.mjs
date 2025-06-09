import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  {
    files: ["**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
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
      globals: {
        ...globals.browser,
      },
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
