import { Module, ClientService } from "@blokkr/core";
import { CoreModule } from "./core";
import { ExampleSystem } from "./example.system";
import { ExampleSubSystem } from "./subsystem-a.system";

@Module({
  imports: [CoreModule],
  systems: [ExampleSystem, ExampleSubSystem],
  bootstrap: [ExampleSystem]
})
class ClientModule {
  constructor(client: ClientService) {
    // const scriptLoggerConfig = client.createEventData(
    //   "minecraft:script_logger_config"
    // );
    // scriptLoggerConfig.data.log_errors = true;
    // scriptLoggerConfig.data.log_information = true;
    // scriptLoggerConfig.data.log_warnings = true;
    // client.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);
    // let chatEventData = client.createEventData("minecraft:display_chat_event");
    // chatEventData.data.message = "ClientService is working.";
    // client.broadcastEvent("minecraft:display_chat_event", chatEventData);
  }
}
