const prettier = require("prettier");
const walkSync = require("walk-sync");
const { readFileSync, writeFileSync } = require("fs");
exports.command = "format";
exports.desc = "format project source";
exports.builder = {};
exports.handler = function(argv) {
  const filePaths = walkSync(".", {
    globs: ["src/**/*.ts"],
    ignore: ["node_modules"]
  });

  const formattedSourcePaths = [];

  filePaths.forEach(filePath => {
    const formatOptions = { parser: "typescript" };
    const source = readFileSync(filePath).toString();
    if (!prettier.check(source, formatOptions)) {
      const formattedSource = prettier.format(source, formatOptions);
      writeFileSync(filePath, formattedSource, "utf8");
      formattedSourcePaths.push(filePath);
    }
  });

  if (formattedSourcePaths.length) {
    formattedSourcePaths.forEach(filePath => {
      process.stdout.write(`${filePath}\n`);
    });
    process.stdout.write(
      `✨ Formatted ${formattedSourcePaths.length} files.\n`
    );
  } else {
    process.stdout.write(`✨ No files to format.\n`);
  }
};
