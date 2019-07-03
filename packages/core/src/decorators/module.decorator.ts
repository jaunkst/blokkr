import "reflect-metadata";
import { injectable, decorate, Container } from "inversify";
import { BehaviorSubject, Subscription, Subject } from "rxjs";
import { takeUntil as rxTakeUntil } from "rxjs/operators";
import {
  resolveContainerForTarget,
  getOptionsForTarget,
  setOptionsForTarget
} from "../utils";

const initialize$ = new BehaviorSubject(false);
const update$ = new BehaviorSubject(false);
const shutdown$ = new Subject();

declare var __system__: IVanillaClientSystem;
__system__.initialize = () => {
  initialize$.next(true);
};

__system__.update = () => {
  update$.next(true);
};

__system__.shutdown = () => {
  shutdown$.next(true);
};

export interface IModuleOptions {
  imports?: any[];
  exports?: any[];
  providers?: any[];
  systems?: any[];
  bootstrap?: any[];
}
class ModuleDecorator {
  private target: any;
  private options: any = {
    imports: [],
    exports: [],
    providers: [],
    systems: [],
    bootstrap: []
  };

  constructor(target: any, options: IModuleOptions) {
    try {
      this.options = Object.assign({}, this.options, options);
      setOptionsForTarget(target, this.options);
      this.target = target;
      decorate(injectable(), this.target);
      this.bindImports(this.options.imports);
      this.bindProviders(this.options.providers);
      this.bindSystems(this.options.systems);
      this.resolveModule();

      const systems = this.bootstrapSystems(this.options.bootstrap);
      const initSub: Subscription = initialize$.subscribe(isInitialized => {
        if (isInitialized) {
          initSub.unsubscribe();
          this.visitSystems(systems, (system: any) => {
            if (system.instance.onInit) {
              system.instance.onInit.bind(system.instance)();
            }
          });
        }
      });

      update$.pipe(rxTakeUntil(shutdown$)).subscribe(() => {
        this.visitSystems(systems, (system: any) => {
          if (system.instance.onUpdate) {
            system.instance.onUpdate.bind(system.instance)();
          }
        });
      });
    } catch (err) {
      console.log(err);
    }
  }

  public getTarget(): any {
    return this.target;
  }

  private visitSystems(systems: any[], exec: Function): void {
    try {
      systems.forEach((system: any) => {
        exec(system);
        this.visitSystems(system.systems, exec);
      });
    } catch (err) {
      console.log(`visitSystems: ${err}`);
    }
  }

  private bindImports(imports: any[]): void {
    try {
      const container: Container = resolveContainerForTarget(this.target);
      imports.forEach(importModule => {
        const importModuleOptions = getOptionsForTarget(importModule);
        return (<any>importModuleOptions).exports.forEach(
          (exportDeclaration: any) => {
            const importModuleContainer = resolveContainerForTarget(
              importModule
            );
            if (!container.isBound(exportDeclaration)) {
              container.bind(exportDeclaration).toDynamicValue(context => {
                return importModuleContainer.get(exportDeclaration);
              });
            }
          }
        );
      });
    } catch (err) {
      console.log(`bindImports: ${err}`);
    }
  }

  private bindProviders(providerKlasses: any[]): void {
    try {
      const container: Container = resolveContainerForTarget(this.target);
      providerKlasses.forEach(providerKlass => {
        container
          .bind(providerKlass)
          .toSelf()
          .inSingletonScope();
      });
    } catch (err) {
      console.log(`bindProviders: ${err}`);
    }
  }

  private bindSystems(systemKlasses: any[]): void {
    try {
      const container: Container = resolveContainerForTarget(this.target);
      systemKlasses.forEach(systemKlass => {
        container
          .bind(systemKlass)
          .toSelf()
          .inSingletonScope();
      });
    } catch (err) {
      console.log(`bindSystems: ${err}`);
    }
  }

  private bootstrapSystems(systemKlasses: any[]): any[] {
    const container: Container = resolveContainerForTarget(this.target);
    return systemKlasses.map(systemKlass => {
      const system = container.get(systemKlass);
      const systemOptions: any = getOptionsForTarget(systemKlass);
      return {
        instance: system,
        systems: this.bootstrapSystems(systemOptions.systems)
      };
    });
  }

  private resolveModule(): void {
    // TODO: FIX SCOPE OF MODULE CONSTRUCTOR
    const container: Container = resolveContainerForTarget(this.target);
    container
      .bind(this.target)
      .toSelf()
      .inSingletonScope();
    container.get(this.target);
  }
}
export function Module(options?: IModuleOptions) {
  return (target: any) => {
    return new ModuleDecorator(target, options).getTarget();
  };
}
