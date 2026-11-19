import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@tributon/classifier", "@tributon/db", "@tributon/pipeline", "@tributon/tax-pack"],
  serverExternalPackages: ["pg"],
  poweredByHeader: false,
};
export default config;
