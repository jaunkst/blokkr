const webpack = require("webpack");
const { resolve, join } = require("path");
const { smart } = require("webpack-merge");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const del = require("del");
const expand = require("expand-template")();
const R = require("ramda");

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

exports.command = "build";
exports.desc = "build the minecraft addon";
exports.builder = {
  install: {
    type: "boolean",
    describe: "install the addons"
  },
  name: {
    describe: "name of the addon",
    type: "string"
  }
};
exports.handler = function(argv) {
  del.sync([process.cwd() + "/dist"]);

  const blokkrConfig = JSON.parse(
    readFileSync(resolve(process.cwd(), "blokkr.json"), "utf8")
  );
  const outDir = blokkrConfig.buildOptions.outDir;

  if (R.hasPath(["packs", "behaviorPack"], blokkrConfig)) {
    const manifestPath = R.path(
      ["packs", "behaviorPack", "manifest"],
      blokkrConfig
    );

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

    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), manifestPath), "utf8")
    );

    const packName = R.toLower(
      [
        R.path(["header", "name"], manifest)
          .split(" ")
          .join("_"),
        R.path(["header", "version"], manifest).join(".")
      ].join("_")
    );
    const modules = R.path(["packs", "behaviorPack", "modules"], blokkrConfig);

    const webpackConfig = [];
    if (R.hasPath(["clientData"], modules)) {
      const clientData = R.path(["clientData"], modules);
      if (R.hasPath(["build", "client"], clientData)) {
        const clientConfig = R.path(["build", "client"], clientData);
        clientConfig.entry = resolve(process.cwd(), clientConfig.entry);
        clientConfig.output.path = resolve(
          process.cwd(),
          outDir,
          packName,
          clientConfig.output.path
        );

        webpackConfig.push(
          R.mergeAll([
            sharedConfig,
            clientConfig,
            {
              plugins: [
                new WebpackBar({
                  name: "Client",
                  color: "blue"
                })
              ]
            }
          ])
        );
      }
      if (R.hasPath(["build", "server"], clientData)) {
        const serverConfig = R.path(["build", "server"], clientData);
        serverConfig.entry = resolve(process.cwd(), serverConfig.entry);
        serverConfig.output.path = resolve(
          process.cwd(),
          outDir,
          packName,
          serverConfig.output.path
        );
        webpackConfig.push(
          R.mergeAll([
            sharedConfig,
            serverConfig,
            {
              plugins: [
                new WebpackBar({
                  name: "Server",
                  color: "yellow"
                })
              ]
            }
          ])
        );
      }
    }

    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        process.stderr.write(err);
      } else {
        // if (existsSync(clientSourcePath)) {
        //   const clientSource = readFileSync(clientSourcePath);
        //   writeFileSync(clientSourcePath, clientShims + clientSource);
        // }
        // if (existsSync(serverSourcePath)) {
        //   const serverSource = readFileSync(serverSourcePath);
        //   writeFileSync(serverSourcePath, serverShims + serverSource);
        // }
        // if (argv.install) {
        //   console.log("Installing...");
        //   // "postbuild": "rm -rf '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'
        //   // && cp - rf./ dist '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'"
        // }
      }
    });
  }
};
