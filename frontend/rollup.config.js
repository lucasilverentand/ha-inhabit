import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;
const buildFromTsc = process.env.BUILD_FROM_TSC === "1";

export default {
  input: buildFromTsc ? "dist/index.js" : "src/index.ts",
  output: {
    file: "../custom_components/inhabit/frontend/dist/panel.js",
    format: "es",
    sourcemap: !production,
  },
  plugins: [
    resolve(),
    !buildFromTsc &&
      typescript({
        tsconfig: "./tsconfig.json",
      }),
    production && terser(),
  ].filter(Boolean),
  external: [],
};
