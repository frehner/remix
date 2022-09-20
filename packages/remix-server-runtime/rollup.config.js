/* eslint-disable no-restricted-globals, import/no-nodejs-modules */
const path = require("path");
const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const copy = require("rollup-plugin-copy");
const replace = require("@rollup/plugin-replace");

const {
  getOutputDir,
  isBareModuleId,
  createBanner,
  copyToPlaygrounds,
  magicExportsPlugin,
} = require("../../rollup.utils");
const { name: packageName, version } = require("./package.json");

const EXPERIMENTAL_BUILD = !!process.env.EXPERIMENTAL_BUILD;

const replacePlugin = replace({
  preventAssignment: true,
  values: {
    "process.env.EXPERIMENTAL_BUILD": EXPERIMENTAL_BUILD ? "1" : "0",
  },
});

/** @returns {import("rollup").RollupOptions[]} */
module.exports = function rollup() {
  let sourceDir = "packages/remix-server-runtime";
  let outputDir = getOutputDir(packageName);
  let outputDist = path.join(outputDir, "dist");

  return [
    {
      external(id) {
        return isBareModuleId(id);
      },
      input: `${sourceDir}/index.ts`,
      treeshake: "smallest",
      output: {
        banner: createBanner(packageName, version),
        dir: outputDist,
        format: "cjs",
        preserveModules: true,
        exports: "named",
      },
      plugins: [
        replacePlugin,
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          extensions: [".ts", ".tsx"],
        }),
        nodeResolve({ extensions: [".ts", ".tsx"] }),
        copy({
          targets: [
            { src: "LICENSE.md", dest: [outputDir, sourceDir] },
            { src: `${sourceDir}/package.json`, dest: outputDir },
            { src: `${sourceDir}/README.md`, dest: outputDir },
          ],
        }),
        magicExportsPlugin({ packageName, version }),
        copyToPlaygrounds(),
      ],
    },
    {
      external(id) {
        return isBareModuleId(id);
      },
      input: `${sourceDir}/index.ts`,
      treeshake: "smallest",
      output: {
        banner: createBanner(packageName, version),
        dir: `${outputDist}/esm`,
        format: "esm",
        preserveModules: true,
      },
      plugins: [
        replacePlugin,
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          extensions: [".ts", ".tsx"],
        }),
        nodeResolve({ extensions: [".ts", ".tsx"] }),
        copyToPlaygrounds(),
      ],
    },
  ];
};
