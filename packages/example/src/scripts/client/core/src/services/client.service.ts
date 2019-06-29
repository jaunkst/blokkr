import { Framework } from "../../index";
import { Service } from "@blokkr/core";

@Service()
export class ClientService {
  public system = Framework.system;

  constructor() {}

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
