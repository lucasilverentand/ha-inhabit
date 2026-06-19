import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: "src/**/*.test.ts",
  concurrency: 1,
  concurrentBrowsers: 1,
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
