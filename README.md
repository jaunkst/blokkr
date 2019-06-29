> 👷 WARNING! This repo is still in progress.

---

# ⚒️ Blokkr - Minecraft Bedrock Addon Framework

This is the monorepo for an opinionated framework for building Minecraft Bedrock addons.

The framework is inspired by Angular IoC, Angular CLI, and RxJS. The intent of this project is to provide everything to build clean and scalable bedrock addons.

## Getting Started

### Prerequisites

Things you will need.

- Minecraft (Bedrock) on Windows, OSX, or Linux.
  [Minecraft Bedrock Launcher](https://mcpelauncher.readthedocs.io/en/latest/index.html) is recommended for OSX, and Linux.
- Node.js >= v10.13.0
- Blokkr CLI

### Installing

```
yarn install -g @blokkr/cli
```

Generating a new addon project.

```
blok new <project>
```

Building your addon

```
blok build
```

Installing your addon

```
blok install
```

Developing the addon

```
blok build --install --watch
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

## Built With

- [Yarn](https://github.com/yarnpkg/yarn) - 📦🐈 Fast, reliable, and secure dependency management
- [OAO](https://github.com/guigrpa/oao) - A Yarn-based, opinionated monorepo management tool
- [minecraft-scripting-types](https://github.com/minecraft-addon-tools/minecraft-scripting-types) - TypeScript typings for the Minecraft Scripting API

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/jaunkst/82cee7be059c9da3d1edec4c0b6267f8) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use a synchronized versioning scheme for versioning. For the versions available, see the [tags on this repository](https://github.com/jaunkst/brokkr/tags).

## 🧙 Authors

- **Jason Aunkst** - _Initial work_

See also the list of [contributors](https://github.com/jaunkst/brokkr/graphs/contributors) who participated in this project.

## Acknowledgments

- Hat tip to [AtomicBlom](https://github.com/minecraft-addon-tools/minecraft-scripting-types/commits?author=AtomicBlom) for the generation of bedrock API types.
- IoC is inspired by the great work from Angular.io

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
