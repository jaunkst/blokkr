import { injectable, decorate } from "inversify";
import { setOptionsForTarget } from "./utils";

class SystemDecorator {
  private target: any;
  private options: any = {
    systems: []
  };

  constructor(target: any, options: any) {
    try {
      this.options = Object.assign({}, this.options, options);
      setOptionsForTarget(target, this.options);
      this.target = target;
      decorate(injectable(), this.target);
    } catch (err) {
      console.log(err);
    }
  }

  public getTarget(): any {
    return this.target;
  }
}

export interface ISystemOptions {
  systems?: any[];
}
export function System(options?: ISystemOptions) {
  return (target: any) => {
    return new SystemDecorator(target, options).getTarget();
  };
}
