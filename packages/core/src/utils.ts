import "reflect-metadata";
import { Container } from "inversify";
import { generate } from "shortid";

Reflect.defineMetadata("module:containers", {}, Reflect);
export function resolveContainerForTarget(target: any): Container {
  const containers = Reflect.getMetadata("module:containers", Reflect);
  if (containers[target]) {
    return containers[target];
  }
  const container = new Container();
  containers[target] = container;
  (<any>container).id = generate();
  Reflect.defineMetadata("moduyarnle:containers", containers, Reflect);
  return container;
}

export function getOptionsForTarget(target: any): any[] {
  if (!Reflect.hasMetadata("module:options", target)) {
    Reflect.defineMetadata("module:options", {}, target);
  }
  return Reflect.getMetadata("module:options", target);
}

export function setOptionsForTarget(target: any, options: any) {
  return Reflect.defineMetadata("module:options", options, target);
}
