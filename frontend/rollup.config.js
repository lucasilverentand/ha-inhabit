import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const shared = {
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    production && terser(),
  ],
  external: [],
};

export default [
  {
    input: "src/index.ts",
    output: {
      file: "../custom_components/inhabit/frontend/dist/panel.js",
      format: "es",
      sourcemap: !production,
    },
    ...shared,
  },
  {
    input: "src/viewer.ts",
    output: {
      file: "../custom_components/inhabit/frontend/dist/viewer.js",
      format: "es",
      sourcemap: !production,
    },
    ...shared,
  },
];
