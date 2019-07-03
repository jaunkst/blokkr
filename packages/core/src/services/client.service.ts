import { Service } from "../decorators/service.decorator";

declare var __system__: IVanillaClientSystem;
@Service()
export class ClientService {
  public system = __system__;

  constructor() {
    console.log("IVanillaClientSystem");
  }

  public registerEventData(eventIdentifier: string, eventData: any): true {
    return this.system.registerEventData(eventIdentifier, eventData);
  }

  public createEventData(eventIdentifier: string): IEventData<any> {
    return this.system.createEventData(eventIdentifier);
  }

  public broadcastEvent(
    eventIdentifier: string,
    eventData: IEventData<any>
  ): boolean {
    return this.system.broadcastEvent(eventIdentifier, eventData);
  }
}
