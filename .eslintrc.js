export default {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [__dirname + "/tsconfig.json"],
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off",
  },
  env: {
    node: true,
    es2020: true,
  },
};
