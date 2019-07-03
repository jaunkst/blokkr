// https://webpack.js.org/api/node/

const webpack = require("webpack");
const { resolve, join, basename } = require("path");
const { smart } = require("webpack-merge");
const {
  readFileSync,
  writeFileSync,
  existsSync,
  copySync
} = require("fs-extra");
const del = require("del");
const expand = require("expand-template")();
const R = require("ramda");
var Multiprogress = require("multi-progress");
var multi = new Multiprogress(process.stderr);
const chalk = require("chalk");
const homedir = require("os").homedir();

function createProgressBar(name, color) {
  const progressBar = multi.newBar(`${chalk[color].bold(name)}▕:bar▏:percent`, {
    complete: `${chalk[color]("█")}`,
    incomplete: " ",
    width: 30,
    total: 100
  });

  return new webpack.ProgressPlugin({
    entries: true,
    modules: true,
    profile: true,
    handler: (percentage, message, ...args) => {
      progressBar.tick(100 * percentage, { percentage, message });
    }
  });
}

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
  const deferredMethods = [];
  if (R.hasPath(["packs", "behaviorPack"], blokkrConfig)) {
    const manifestPath = R.path(
      ["packs", "behaviorPack", "manifest"],
      blokkrConfig
    );

    const iconPath = R.path(["packs", "behaviorPack", "icon"], blokkrConfig);

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

    deferredMethods.push(() => {
      copySync(
        join(process.cwd(), manifestPath),
        join(process.cwd(), outDir, packName, basename(manifestPath))
      );
    });

    deferredMethods.push(() => {
      copySync(
        join(process.cwd(), iconPath),
        join(process.cwd(), outDir, packName, basename(iconPath))
      );
    });
    // copySync(manifestPath, join(process.cwd(), outDir, packName));

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
              plugins: [createProgressBar("Behavior Client", "yellow")]
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
              plugins: [createProgressBar("Behavior Server", "blue")]
            }
          ])
        );
      }
    }

    webpack(webpackConfig, (err, multiStats) => {
      console.log("\n\n");
      if (err) {
        process.stderr.write(err);
        process.exit(1);
      } else if (multiStats.hasErrors()) {
        multiStats.stats.forEach(stat => {
          const error = R.head(stat.compilation.errors);
          process.stderr.write(error.message);
          process.exit(1);
        });
      } else {
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

        deferredMethods.forEach(deferred => {
          deferred();
        });

        if (argv.install) {
          console.log("Installing...");
          const installPath = join(
            homedir,
            "Library",
            "Application Support",
            "mcpelauncher",
            "games",
            "com.mojang",
            "development_behavior_packs"
          );
          console.log({ installPath });
          del(join(process.cwd(), installPath, packName));
          copySync(join(process.cwd(), outDir), installPath);

          // del(installPath);
          // if (existsSync(installPath)) {
          //   copyAssets.forEach(asset => {
          //     copySync(join(process.cwd(), outDir), installPath);
          //   });
          //   // copySync(join(process.cwd(), outDir));
          // }
          // "postbuild": "rm -rf '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'
          // && cp - rf./ dist '/Users/bitmonolith/Library/Application Support/mcpelauncher/games/com.mojang/development_behavior_packs/Ragnarok'"
        }
      }
    });
  }
};
