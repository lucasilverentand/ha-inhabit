import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: "src/**/*.test.ts",
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true, target: "es2022", tsconfig: "tsconfig.json" }),
  ],
  testFramework: {
    config: {
      timeout: 5000,
    },
  },
};
