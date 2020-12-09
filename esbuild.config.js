/* eslint-env node */

const { build } = require("esbuild");

const getNamedEntrypointsPlugin = (entrypoints) => ({
  name: "named-entrypoints-plugin",
  setup: (build) => {
    const entrypointNamesRegex = new RegExp(
      "^(" + Object.keys(entrypoints).join("|") + ")$"
    );
    build.onResolve({ filter: entrypointNamesRegex }, (args) => {
      return {
        path: args.path,
        namespace: "entrypoint-alias",
      };
    });

    build.onLoad({ filter: /.*/, namespace: "entrypoint-alias" }, (args) => {
      const entrypointName = args.path;
      const entrypointPath = entrypoints[entrypointName];
      return {
        contents: `import "${entrypointPath}"`,
        resolveDir: __dirname,
      };
    });
  },
});

build({
  outdir: __dirname + "/dist",
  bundle: true,
  target: "es2019",
  format: "esm",
  // splitting: true,
  entryPoints: ["virtual-entrypoint.debug.js"],
  plugins: [
    getNamedEntrypointsPlugin({
      "virtual-entrypoint.debug.js": __dirname + "/src/deep-path/index.js",
    }),
  ],
}).catch(() => {
  process.exit(1);
});
