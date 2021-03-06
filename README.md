[![Build Status](https://cloud.drone.io/api/badges/jaunkst/blokkr/status.svg)](https://cloud.drone.io/jaunkst/blokkr)
[![CodeFactor](https://www.codefactor.io/repository/github/jaunkst/blokkr/badge)](https://www.codefactor.io/repository/github/jaunkst/blokkr)

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

## Running the example

```
git clone git@github.com:jaunkst/blokkr.git
cd blokkr
yarn install
yarn oao bootstrap
cd packages/example
yarn blok build --install
```

🎉 Start minecraft and add the example addon to a new game.

# Modules

Modules register all services, and systems. Modules can be imported into other modules. Imported module services and systems are available to services, and systems in the target module.

This should allow publishing of sytems and services to be consumed in an addon as a module bundle. The modules also allow the developer to seperate groups of services and systems by context.

# Services

Services can be injected into modules, services, and systems. Services can provide shared functionality and state.

# Entities

The entity is a general purpose object. Usually, it only consists of a unique id.

# Components

The raw data for one aspect of the object, and how it interacts with the world.

# Systems

Each System runs continuously and performs global actions on every Entity that possesses a Component of the same aspect as that System. Systems can have register sub systems.

# CLI Docs

## Built With

- [Yarn](https://github.com/yarnpkg/yarn) - 📦🐈 Fast, reliable, and secure dependency management
- [OAO](https://github.com/guigrpa/oao) - A Yarn-based, opinionated monorepo management tool
- [minecraft-scripting-types](https://github.com/minecraft-addon-tools/minecraft-scripting-types) - TypeScript typings for the Minecraft Scripting API

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/jaunkst/82cee7be059c9da3d1edec4c0b6267f8) for details on our code of conduct, and the process for submitting pull requests to us.

### Development Commands

To rebuild the monorepor dependencies and example app on file change run.

```
yarn watch
```

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
