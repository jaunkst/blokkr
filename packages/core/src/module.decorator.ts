import "reflect-metadata";
import { injectable, decorate } from "inversify";

import {
  resolveContainerForModule,
  getOptionsForModule,
  setOptionsForModule
} from "./utils";
// Module Decorator
export interface ModuleOptions {
  root?: boolean;
  imports?: any[];
  exports?: any[];
  declarations?: any[];
  bootstrap?: any[];
}
export function MCModule(options?: ModuleOptions) {
  return (target: any) => {
    const _options: ModuleOptions = (<any>Object).assign(
      {},
      {
        imports: [],
        modules: [],
        declarations: [],
        services: [],
        bootstrap: []
      },
      options
    );

    setOptionsForModule(target, options);
    // NOTE get the container for the target @Module
    const moduleContainer = resolveContainerForModule(target);

    // NOTE bind the target @Module declarations to the @Module container
    _options.declarations.forEach(declaration => {
      moduleContainer
        .bind(declaration)
        .toSelf()
        .inSingletonScope();
    });

    // ANCHOR  A Angular style IoC module imports.
    // this block looks at import modules and creates a new binding
    // for the import modules exports
    _options.imports.forEach(importModule => {
      const importModuleOptions = getOptionsForModule(importModule);
      return (<any>importModuleOptions).exports.forEach(
        (exportDeclaration: any) => {
          const importModuleContainer = resolveContainerForModule(importModule);
          if (!moduleContainer.isBound(exportDeclaration)) {
            moduleContainer.bind(exportDeclaration).toDynamicValue(context => {
              return importModuleContainer.get(exportDeclaration);
            });
          }
        }
      );
    });

    // NOTE make the target @injectable
    decorate(injectable(), target);

    // NOTE add the target to the @Module container
    moduleContainer
      .bind(target)
      .toSelf()
      .inSingletonScope();

    // NOTE initialize bootstrap modules from target @Module
    _options.bootstrap.forEach(bootstrapModule => {
      resolveContainerForModule(bootstrapModule).resolve(bootstrapModule);
    });

    // TODO initialize all other modules so that they can use module
    // level constructors

    return target;
  };
}
