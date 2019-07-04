const { join } = require("path");
const { execSync } = require("child_process");
const chokidar = require("chokidar");

const coreWatcher = chokidar.watch(join(process.cwd(), "packages", "core"), {
  ignored: [/dist/, /node_modules/]
});
coreWatcher.on("ready", function(a) {
  coreWatcher.on("all", function(eventName, path, stats) {
    execSync("yarn build", {
      stdio: "inherit",
      cwd: join(process.cwd(), "packages", "core")
    });

    execSync("yarn oao add @blokkr/example ./packages/core", {
      stdio: "inherit",
      cwd: join(process.cwd())
    });
  });
});

const cliWatcher = chokidar.watch(join(process.cwd(), "packages", "cli"), {
  ignored: [/dist/, /node_modules/]
});
cliWatcher.on("ready", function(a) {
  cliWatcher.on("all", function(eventName, path, stats) {
    execSync("yarn oao add @blokkr/example ./packages/cli", {
      stdio: "inherit",
      cwd: join(process.cwd())
    });
  });
});

const exampleWatcher = chokidar.watch(
  join(process.cwd(), "packages", "example"),
  {
    ignored: [/dist/, /node_modules/]
  }
);
exampleWatcher.on("ready", function(a) {
  exampleWatcher.on("all", function(eventName, path, stats) {
    console.log({ path });
    execSync("yarn build --install", {
      stdio: "inherit",
      cwd: join(process.cwd(), "packages", "example")
    });
  });
});
