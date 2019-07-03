export function Observe(eventName: string) {
  // return function(target: any, propertyName: string, descriptor: any) {
  // Framework.system.listenForEvent(eventName, eventData =>
  //   receivePinkyMessage(eventData)
  // );

  //   // const rootContainer = Framework.container;
  //   // const debugService = rootContainer.resolve(DebugService);
  //   // debugService.log("LKASDJASLKASJD");
  //   // // console.log({ eventName, target, propertyName });
  //   // // Framework.resolve(DebugService);

  //   Framework.logJson({ eventName, target, propertyName, descriptor });
  //   // return target;
  // };

  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // descriptor.enumerable = value;
    // Framework.logJson({ eventName, target, propertyKey, descriptor });
    // Framework.system.listenForEvent("minecraft:display_chat_event", () => {
    //   Framework.log("LKJASDLKJADSLKJASDLKAJSDLKAJSD");
    // });
    // const eventDataDefaults = { narf: false };
    // Framework.system.registerEventData("test:moo", eventDataDefaults);
    // let pinkyEventData = Framework.system.createEventData("test:moo");
    // pinkyEventData.data.narf = true;
    // Framework.system.broadcastEvent("test:moo", pinkyEventData);
  };
}
