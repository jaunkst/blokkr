const webpack = require("webpack");
const { resolve } = require("path");
const { smart } = require("webpack-merge");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");
const { readFileSync, writeFileSync } = require("fs");
const del = require("del");

const polyfills = `
const __system__ = client.registerSystem(0, 0);
const console = {
  log: function(...data) {
    let chatEventData = __system__.createEventData(
      "minecraft:display_chat_event"
    );
    chatEventData.data.message = data;
    __system__.broadcastEvent("minecraft:display_chat_event", chatEventData);
  }
};
`;

exports.command = "build";
exports.desc = "build the minecraft addon";
exports.builder = {
  dir: {
    default: "."
  }
};
exports.handler = function(argv) {
  function resolveTsconfigPathsToAlias({
    tsconfigPath = process.cwd() + "/tsconfig.json",
    webpackConfigBasePath = "./"
  } = {}) {
    const { paths } = require(tsconfigPath).compilerOptions;

    const aliases = {};

    Object.keys(paths).forEach(item => {
      const key = item.replace("/*", "");
      const value = resolve(
        webpackConfigBasePath,
        paths[item][0].replace("/*", "")
      );

      aliases[key] = value;
    });

    return aliases;
  }

  const sharedConfig = {
    watch: false,
    module: {
      rules: [
        {
          test: /\.ts/,
          use: "ts-loader",
          exclude: /node_modules/
        }
      ]
    },
    stats: "none",
    resolve: {
      extensions: [".ts", ".js"],
      alias: resolveTsconfigPathsToAlias()
    },
    optimization: {
      minimize: false
    }
  };

  const clientConfig = {
    name: "client",
    entry: "./src/scripts/client/client.ts",
    output: {
      path: process.cwd() + "/dist/scripts/client",
      filename: "client.js"
    },
    plugins: [
      new WebpackBar({
        name: "client",
        color: "yellow"
      }),
      new CopyPlugin([
        {
          from: process.cwd() + "/src/manifest.json",
          to: process.cwd() + "/dist/manifest.json"
        },
        {
          from: process.cwd() + "/src/pack_icon.png",
          to: process.cwd() + "/dist/pack_icon.png"
        }
      ])
    ]
  };

  var serverConfig = {
    name: "server",
    entry: "./src/scripts/server/server.ts",
    output: {
      path: process.cwd() + "/dist/scripts/server",
      filename: "server.js"
    },
    plugins: [
      new WebpackBar({
        name: "server",
        color: "blue"
      })
    ]
  };

  const webpackConfig = [
    smart(sharedConfig, clientConfig),
    smart(sharedConfig, serverConfig)
  ];

  del.sync([process.cwd() + "/dist"]);

  webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      process.stderr.write(err);
    } else {
      const clientSourcePath = resolve(
        process.cwd(),
        "dist",
        "scripts",
        "client",
        "client.js"
      );

      const clientSource = readFileSync(clientSourcePath);

      writeFileSync(clientSourcePath, polyfills + clientSource);
    }
  });
};
