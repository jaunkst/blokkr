import "reflect-metadata";
import { Container, injectable, decorate } from "inversify";
import { generate } from "shortid";

Reflect.defineMetadata("module:containers", {}, Reflect);
export function resolveContainerForModule(target: any): Container {
  const moduleContainers = Reflect.getMetadata("module:containers", Reflect);
  if (moduleContainers[target]) {
    return moduleContainers[target];
  }
  const moduleContainer = new Container();
  moduleContainers[target] = moduleContainer;
  (<any>moduleContainer).id = generate();
  Reflect.defineMetadata("module:containers", moduleContainers, Reflect);
  return moduleContainer;
}

export function getOptionsForModule(target: any): any[] {
  if (!Reflect.hasMetadata("module:options", target)) {
    Reflect.defineMetadata("module:options", {}, target);
  }
  return Reflect.getMetadata("module:options", target);
}

export function setOptionsForModule(target: any, options: any) {
  return Reflect.defineMetadata("module:options", options, target);
}
