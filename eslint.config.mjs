import next from "@next/eslint-plugin-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const nextRules = {
  ...next.configs.recommended.rules,
  ...next.configs["core-web-vitals"].rules,
};

export default [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "@next/next": next,
    },
    rules: {
      ...nextRules,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@next/next": next,
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...nextRules,
    },
  },
];
