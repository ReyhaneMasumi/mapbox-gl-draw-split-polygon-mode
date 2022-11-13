import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "src/index.js",
  plugins: [resolve(), commonjs(), terser()],
  output: {
    file: pkg.main,
    format: "umd",
    exports: "named",
    name: "SplitPolygonMode",
    sourcemap: process.env.NODE_ENV !== "production",
  },
};
