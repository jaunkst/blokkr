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
  const colors = ["yellow", "blue", "green", "red"];
  const _blokkrConfig = JSON.parse(
    readFileSync(resolve(process.cwd(), "blokkr.json"), "utf8")
  );

  const packConfigs = _blokkrConfig.packs.map(pack => {
    const manifestPath = resolve(process.cwd(), pack.manifest);
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), pack.manifest), "utf8")
    );
    const packName = R.toLower(
      [
        manifest.header.name.split(" ").join("_"),
        manifest.header.version.join(".")
      ].join("_")
    );
    const outDir = _blokkrConfig.buildOptions.outDir;

    return {
      packName,
      builds: R.map(blokkrModule => {
        const manifestModule = R.find(_manifestModule => {
          return blokkrModule.uuid === _manifestModule.uuid;
        }, manifest.modules);

        if (manifestModule.type === "client_data") {
          return {
            type: "client_data",
            webpack: R.map(entry => {
              entry.entry = resolve(process.cwd(), entry.entry);
              entry.output.path = resolve(
                process.cwd(),
                outDir,
                packName,
                entry.output.path
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

              return R.merge(R.merge(sharedConfig, entry), {
                plugins: [
                  new WebpackBar({
                    name: entry.name,
                    color: colors.shift()
                  })
                ]
              });
            }, blokkrModule.build)
          };
        } else {
          return [];
        }
      }, pack.modules)
    };
  });

  del.sync([process.cwd() + "/dist"]);

  const webpackConfig = R.flatten(
    R.map(
      entry => entry.webpack,
      R.flatten(
        packConfigs.map(packConfig => {
          return packConfig.builds.filter(build => {
            return build.webpack;
          });
        })
      )
    )
  );

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
};
