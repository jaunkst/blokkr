import { Module, OnInit, OnUpdate, ClientService } from "@blokkr/core";
import { CoreModule } from "@client/core";

@Module({
  imports: [CoreModule],
  bootstrap: [ClientModule]
})
class ClientModule implements OnInit, OnUpdate {
  constructor(client: ClientService) {
    const scriptLoggerConfig = client.createEventData(
      "minecraft:script_logger_config"
    );
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    client.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

    let chatEventData = client.createEventData("minecraft:display_chat_event");
    chatEventData.data.message = "ClientService is working.";
    client.broadcastEvent("minecraft:display_chat_event", chatEventData);
  }

  public onInit(): void {
    console.log("onInit");
  }

  public onUpdate(): void {
    // console.log("onUpdate");
  }
}
