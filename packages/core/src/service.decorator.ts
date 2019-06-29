import { injectable, decorate } from "inversify";

export function Service() {
  return (target: any) => {
    decorate(injectable(), target);
    return target;
  };
}
