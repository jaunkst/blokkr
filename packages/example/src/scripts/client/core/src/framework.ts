import { Container } from "inversify";
const container = new Container();

declare var __system__: any;
const system = __system__ ? __system__ : client.registerSystem(0, 0);

export class Framework {
  public static system = system;
  public static container = container;
  public static resolve(target: any) {
    return Framework.container.resolve(target);
  }
}
