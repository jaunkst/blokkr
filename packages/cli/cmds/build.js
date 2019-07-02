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
  console.log(argv);
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

              // const webpackConfig = R.merge(sharedConfig, build.webpack);

              return R.merge(sharedConfig, entry);
            }, blokkrModule.build)
          };
        } else {
          return [];
        }
      }, pack.modules)
    };

    // const clientConfig = {
    //   name: "client",
    //   entry: "./src/behaviors/scripts/client/client.ts",
    //   output: {
    //     path: process.cwd() + "/dist/behaviors/scripts/client",
    //     filename: "client.js"
    //   },
    //   plugins: [
    //     new WebpackBar({
    //       name: "Behavior Client",
    //       color: "yellow"
    //     }),
    //     new CopyPlugin([
    //       {
    //         from: process.cwd() + "/src/behaviors/manifest.json",
    //         to: process.cwd() + "/dist/behaviors/manifest.json"
    //       },
    //       {
    //         from: process.cwd() + "/src/behaviors/pack_icon.png",
    //         to: process.cwd() + "/dist/behaviors/pack_icon.png"
    //       }
    //     ])
    //   ]
    // };

    // return { packName, outDir,  };
    // return {
    //   modules: R.values(
    //     R.mapObjIndexed((index, key, obj) => {
    //       const module = R.find(R.propEq("uuid", key), manifest.modules);
    //       return R.merge(
    //         { module },
    //         JSON.parse(
    //           expand(JSON.stringify(obj[key]), {
    //             manifestName: R.toLower(manifest.header.name)
    //               .split(" ")
    //               .join("_"),
    //             moduleVersion: module.version.join(".")
    //           })
    //         )
    //       );
    //     }, pack.modules)
    //   ),
    //   copy: {
    //     from: manifestPath,
    //     to: join(outDir, packName, "manifest.json")
    //   }
    // };

    // return {
    //   manifest: readFileSync(resolve(process.cwd(), pack.manifest), "utf8"),
    //   buildConfig: manifest.modules.find()
    // };
  });

  // console.log(JSON.stringify(buildConfig, null, 2));
  // const packageConfig = JSON.parse(
  //   readFileSync(resolve(process.cwd(), "package.json"), "utf8")
  // );
  // const packageName = (argv.name ? argv.name : packageConfig.name)
  //   .split(" ")
  //   .join("_");

  // blokkrConfig = JSON.parse(
  //   expand(readFileSync(resolve(process.cwd(), "blokkr.json"), "utf8"), {
  //     name: packageName,
  //     version: packageConfig.version
  //   })
  // );

  // console.log(blokkrConfig);

  // function resolveTsconfigPathsToAlias({
  //   tsconfigPath = process.cwd() + "/tsconfig.json",
  //   webpackConfigBasePath = "./"
  // } = {}) {
  //   const { paths } = require(tsconfigPath).compilerOptions;

  //   const aliases = {};

  //   Object.keys(paths).forEach(item => {
  //     const key = item.replace("/*", "");
  //     const value = resolve(
  //       webpackConfigBasePath,
  //       paths[item][0].replace("/*", "")
  //     );

  //     aliases[key] = value;
  //   });

  //   return aliases;
  // }

  // // TODO replace CopyPlugin
  // const clientConfig = {
  //   name: "client",
  //   entry: "./src/behaviors/scripts/client/client.ts",
  //   output: {
  //     path: process.cwd() + "/dist/behaviors/scripts/client",
  //     filename: "client.js"
  //   },
  //   plugins: [
  //     new WebpackBar({
  //       name: "Behavior Client",
  //       color: "yellow"
  //     }),
  //     new CopyPlugin([
  //       {
  //         from: process.cwd() + "/src/behaviors/manifest.json",
  //         to: process.cwd() + "/dist/behaviors/manifest.json"
  //       },
  //       {
  //         from: process.cwd() + "/src/behaviors/pack_icon.png",
  //         to: process.cwd() + "/dist/behaviors/pack_icon.png"
  //       }
  //     ])
  //   ]
  // };

  // var serverConfig = {
  //   name: "server",
  //   entry: "./src/behaviors/scripts/server/server.ts",
  //   output: {
  //     path: process.cwd() + "/dist/behaviors/scripts/server",
  //     filename: "server.js"
  //   },
  //   plugins: [
  //     new WebpackBar({
  //       name: "Behavior Server",
  //       color: "blue"
  //     })
  //   ]
  // };

  // const webpackConfig = [
  //   smart(sharedConfig, clientConfig),
  //   smart(sharedConfig, serverConfig)
  // ];

  del.sync([process.cwd() + "/dist"]);

  packConfigs.forEach(packConfig => {
    packConfig.builds.forEach(build => {
      if (build.webpack) {
        build.webpack.plugins = [
          new WebpackBar({
            name: "Behavior Client",
            color: "yellow"
          })
        ];
        webpack(build.webpack, (err, stats) => {
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
    });
  });
};
