import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["out/**", "node_modules/**"],
  },
];

export default eslintConfig;
