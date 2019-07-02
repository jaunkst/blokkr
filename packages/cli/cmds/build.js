// https://webpack.js.org/api/node/

const webpack = require("webpack");
const { resolve, join } = require("path");
const { smart } = require("webpack-merge");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const del = require("del");
const expand = require("expand-template")();
const R = require("ramda");

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
  const colors = ["yellow", "blue", "green", "red"];

  if (R.hasPath(["packs", "behaviorPack"], blokkrConfig)) {
    const manifestPath = R.path(
      ["packs", "behaviorPack", "manifest"],
      blokkrConfig
    );

    const sharedConfig = {
      watch: false,
      // mode: "production",
      module: {
        rules: [
          {
            test: /\.ts/,
            use: "ts-loader",
            exclude: /node_modules/
          }
        ]
      },
      stats: "minimal",
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
    const outputPaths = [];
    if (R.hasPath(["clientData"], modules)) {
      const clientData = R.path(["clientData"], modules);
      if (R.hasPath(["build", "client"], clientData)) {
        const clientConfig = R.path(["build", "client"], clientData);
        clientConfig.entry = resolve(process.cwd(), clientConfig.entry);
        clientOutPath = resolve(
          process.cwd(),
          outDir,
          packName,
          clientConfig.output.path
        );
        clientConfig.output.path = clientOutPath;
        outputPaths.push({
          clientSourcePath: join(clientOutPath, clientConfig.output.filename)
        });
        webpackConfig.push(
          R.mergeAll([
            sharedConfig,
            clientConfig,
            {
              plugins: [
                new WebpackBar({
                  name: "Client",
                  color: "blue",
                  profile: true
                })
              ]
            }
          ])
        );
      }
      if (R.hasPath(["build", "server"], clientData)) {
        const serverConfig = R.path(["build", "server"], clientData);
        serverConfig.entry = resolve(process.cwd(), serverConfig.entry);
        serverOutPath = resolve(
          process.cwd(),
          outDir,
          packName,
          serverConfig.output.path
        );
        serverConfig.output.path = serverOutPath;
        outputPaths.push({
          serverSourcePath: join(serverOutPath, serverConfig.output.filename)
        });
        webpackConfig.push(
          R.mergeAll([
            sharedConfig,
            serverConfig,
            {
              plugins: [
                new WebpackBar({
                  name: "Server",
                  color: "yellow",
                  profile: true
                })
              ]
            }
          ])
        );
      }
    }

    webpack(webpackConfig, (err, multiStats) => {
      if (err || multiStats.hasErrors()) {
        process.stderr.write(err);
      } else {
        // multiStats.stats.forEach(stats => {
        //   console.log(stats.compilation);
        //   // stats.compilation.warnings.forEach(warning => {
        //   //   // console.log(warning);
        //   // });
        // });
        // process.stdout.write(multiStats.toString({ colors: true }) + "\n");

        // console.log(multiStats);

        outputPaths.forEach(outputPath => {
          if (existsSync(outputPath.clientSourcePath)) {
            const clientSource = readFileSync(outputPath.clientSourcePath);
            writeFileSync(
              outputPath.clientSourcePath,
              clientShims + clientSource
            );
          }
          if (existsSync(outputPath.serverSourcePath)) {
            const serverSource = readFileSync(outputPath.serverSourcePath);
            writeFileSync(
              outputPath.serverSourcePath,
              serverShims + serverSource
            );
          }
        });

        if (argv.install) {
          console.log("Installing...");
          // "postbuild": "rm -rf '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'
          // && cp - rf./ dist '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'"
        }
      }
    });
  }
};
