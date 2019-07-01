const webpack = require("webpack");
const { resolve } = require("path");
const { smart } = require("webpack-merge");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const del = require("del");

const clientSourcePath = resolve(
  process.cwd(),
  "dist",
  "behaviors",
  "scripts",
  "client",
  "client.js"
);

const serverSourcePath = resolve(
  process.cwd(),
  "dist",
  "behaviors",
  "scripts",
  "server",
  "server.js"
);

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
  install: {}
};
exports.handler = function(argv) {
  console.log(argv);

  const blokkrConfig = JSON.parse(
    readFileSync(resolve(process.cwd(), "blokkr.json"))
  );

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
    }
  };

  // TODO replace CopyPlugin
  const clientConfig = {
    name: "client",
    entry: "./src/behaviors/scripts/client/client.ts",
    output: {
      path: process.cwd() + "/dist/behaviors/scripts/client",
      filename: "client.js"
    },
    plugins: [
      new WebpackBar({
        name: "Behavior Client",
        color: "yellow"
      }),
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
    },
    plugins: [
      new WebpackBar({
        name: "Behavior Server",
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
      if (existsSync(clientSourcePath)) {
        const clientSource = readFileSync(clientSourcePath);
        writeFileSync(clientSourcePath, clientShims + clientSource);
      }

      if (existsSync(serverSourcePath)) {
        const serverSource = readFileSync(serverSourcePath);
        writeFileSync(serverSourcePath, serverShims + serverSource);
      }

      if (argv.install) {
        console.log("Installing...");
        // "postbuild": "rm -rf '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'
        // && cp - rf./ dist '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'"
      }
    }
  });
};
