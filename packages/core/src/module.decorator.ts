import "reflect-metadata";
import { injectable, decorate } from "inversify";
import {
  resolveContainerForModule,
  getOptionsForModule,
  setOptionsForModule
} from "./utils";
import { BehaviorSubject, Subscription, combineLatest } from "rxjs";
import { filter as rxFilter, map as rxMap } from "rxjs/operators";

console.log("MOMO");

const initialize$ = new BehaviorSubject(false);
const update$ = new BehaviorSubject(false);

declare var __system__: IVanillaClientSystem;
__system__.initialize = () => {
  initialize$.next(true);
};

__system__.update = () => {
  update$.next(true);
};

// Module Decorator
export interface ModuleOptions {
  root?: boolean;
  imports?: any[];
  exports?: any[];
  providers?: any[];
  bootstrap?: any[];
}
export function Module(options?: ModuleOptions) {
  return (target: any) => {
    const _options: ModuleOptions = (<any>Object).assign(
      {},
      {
        imports: [],
        modules: [],
        providers: [],
        bootstrap: []
      },
      options
    );

    setOptionsForModule(target, options);
    // NOTE get the container for the target @Module
    const moduleContainer = resolveContainerForModule(target);

    // NOTE bind the target @Module declarations to the @Module container
    _options.providers.forEach(provider => {
      moduleContainer
        .bind(provider)
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
      const resolvedModule = resolveContainerForModule(bootstrapModule).resolve(
        bootstrapModule
      );
      const initSub: Subscription = initialize$.subscribe(
        (isInitialized: boolean) => {
          if (isInitialized && (<any>resolvedModule).onInit) {
            (<any>resolvedModule).onInit();
            initSub.unsubscribe();
          }
        }
      );

      combineLatest([initialize$, update$])
        .pipe(
          rxFilter(([initialize, _update]) => {
            return initialize;
          }),
          rxMap(([_initialize, update]) => {
            return update;
          })
        )
        .subscribe(_update => {
          if ((<any>resolvedModule).onUpdate) {
            (<any>resolvedModule).onUpdate();
          }
        });
    });

    // TODO initialize all other modules so that they can use module
    // level constructors

    return target;
  };
}
