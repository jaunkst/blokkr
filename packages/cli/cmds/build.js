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
var chokidar = require("chokidar");

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

const __console__ = readFileSync(join(__dirname, "polyfills", "console.js"));

const clientShims = `
const __system__ = client.registerSystem(0, 0);
${__console__}
const console = __console__;
`;

const serverShims = `
const __system__ = server.registerSystem(0, 0);
${__console__}
const console = __console__;
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

const postWebpackJobs = [];
function postWebpack(func) {
  postWebpackJobs.push(() => {
    func();
  });
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
  function build() {
    if (existsSync(join(process.cwd(), "/dist"))) {
      del.sync([process.cwd() + "/dist"]);
    }

    const blokkrConfig = JSON.parse(
      readFileSync(resolve(process.cwd(), "blokkr.json"), "utf8")
    );
    const outDir = blokkrConfig.buildOptions.outDir;
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

      postWebpack(() => {
        copySync(
          join(process.cwd(), manifestPath),
          join(process.cwd(), outDir, packName, basename(manifestPath))
        );
      });

      postWebpack(() => {
        copySync(
          join(process.cwd(), iconPath),
          join(process.cwd(), outDir, packName, basename(iconPath))
        );
      });
      // copySync(manifestPath, join(process.cwd(), outDir, packName));

      const modules = R.path(
        ["packs", "behaviorPack", "modules"],
        blokkrConfig
      );

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

          const clientSourcePath = join(
            clientOutPath,
            clientConfig.output.filename
          );
          postWebpack(() => {
            if (existsSync(clientSourcePath)) {
              const clientSource = readFileSync(clientSourcePath);
              writeFileSync(clientSourcePath, clientShims + clientSource);
            }
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

          const serverSourcePath = join(
            serverOutPath,
            serverConfig.output.filename
          );

          postWebpack(() => {
            if (existsSync(serverSourcePath)) {
              const serverSource = readFileSync(serverSourcePath);
              writeFileSync(serverSourcePath, serverShims + serverSource);
            }
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

      postWebpack(() => {
        if (argv.install) {
          const installPath = join(
            homedir,
            "Library",
            "Application Support",
            "mcpelauncher",
            "games",
            "com.mojang",
            "development_behavior_packs"
          );
          const targetPackPath = join(installPath, packName);
          del.sync(targetPackPath, { force: true });
          copySync(join(process.cwd(), outDir), installPath);
          process.stdout.write(
            `${chalk.green("Installed")} ${targetPackPath}\n`
          );
        }
      });

      try {
        webpack(webpackConfig, (err, multiStats) => {
          process.stdout.write("\n\n");
          if (err) {
            process.stderr.write(err);
            process.exit(1);
          } else if (multiStats.hasErrors()) {
            multiStats.stats.forEach(stat => {
              console.log(stat);
              const error = R.head(stat.compilation.errors);
              process.stderr.write(error.message);
              process.exit(1);
            });
          } else {
            postWebpackJobs.forEach(run => {
              run();
            });

            // console.log(join(process.cwd(), "packages"));

            // const watcher = chokidar.watch(join(process.cwd(), "packages"));
            // watcher.on("ready", function(a) {
            //   watcher.on("all", function(b) {
            //     console.log({ a, b });
            //     // console.log("Clearing /app/ module cache from server");
            //     // Object.keys(require.cache).forEach(function(id) {
            //     //   if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
            //     // });
            //   });
            // });
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  build();
};
