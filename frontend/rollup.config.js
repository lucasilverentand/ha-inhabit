import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/index.ts",
  output: {
    file: "../custom_components/inhabit/frontend/dist/panel.js",
    format: "es",
    sourcemap: !production,
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    production && terser(),
  ],
  external: [],
};
