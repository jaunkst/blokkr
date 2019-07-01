import { injectable, decorate } from "inversify";

export function Service() {
  return (target: any) => {
    try {
      decorate(injectable(), target);
    } catch (err) {
      console.log(err);
    }
    return target;
  };
}
