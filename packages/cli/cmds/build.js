const webpack = require("webpack");
const { resolve } = require("path");
const { smart } = require("webpack-merge");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");
const { readFileSync, writeFileSync } = require("fs");
const del = require("del");
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
const _cliProgress = require("cli-progress");
const bar1 = new _cliProgress.Bar(
  {},
  {
    format: "Compiling: {bar}" + "{percentage}%",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591"
  }
);
bar1.start(100, 0);

const clientShims = `
const __client__ = client.registerSystem(0, 0);
const console = {
  log: function(...data) {
    let chatEventData = __client__.createEventData(
      "minecraft:display_chat_event"
    );
    chatEventData.data.message = data;
    __client__.broadcastEvent("minecraft:display_chat_event", chatEventData);
  }
};
`;

const serverShims = `
const __server__ = server.registerSystem(0, 0);
const console = {
  log: function(...data) {
    let chatEventData = __server__.createEventData(
      "minecraft:display_chat_event"
    );
    chatEventData.data.message = data;
    __server__.broadcastEvent("minecraft:display_chat_event", chatEventData);
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
    stats: {
      errors: true,
      errorDetails: true
    },
    resolve: {
      extensions: [".ts", ".js"],
      alias: resolveTsconfigPathsToAlias()
    },
    optimization: {
      minimize: false
    },
    plugins: [
      new ProgressPlugin((percentage, msg) => {
        bar1.update(100 * percentage);
        if (percentage >= 1) {
          bar1.stop();
        }
        // console.log(percentage);
      })
    ]
  };

  const clientConfig = {
    name: "client",
    entry: "./src/behaviors/scripts/client/client.ts",
    output: {
      path: process.cwd() + "/dist/behaviors/scripts/client",
      filename: "client.js"
    },
    plugins: [
      new CopyPlugin([
        {
          from: process.cwd() + "/src/behaviors/manifest.json",
          to: process.cwd() + "/dist/behaviors/manifest.json"
        },
        {
          from: process.cwd() + "/src/behaviors/pack_icon.png",
          to: process.cwd() + "/dist/behaviors/pack_icon.png"
        }
      ])
    ]
  };

  var serverConfig = {
    name: "server",
    entry: "./src/behaviors/scripts/server/server.ts",
    output: {
      path: process.cwd() + "/dist/behaviors/scripts/server",
      filename: "server.js"
    }
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
        "behaviors",
        "scripts",
        "client",
        "client.js"
      );

      const clientSource = readFileSync(clientSourcePath);

      writeFileSync(clientSourcePath, clientShims + clientSource);

      // const serverSourcePath = resolve(
      //   process.cwd(),
      //   "dist",
      //   "scripts",
      //   "server",
      //   "server.js"
      // );

      // const clientSource = readFileSync(clientSourcePath);

      // writeFileSync(clientSourcePath, clientShims + clientSource);
    }
  });
};
