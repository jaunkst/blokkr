import { Module } from "@blokkr/core";
import { CoreModule, ClientService } from "@client/core";
@Module({
  imports: [CoreModule],
  bootstrap: [ClientModule]
})
class ClientModule {
  constructor(client: ClientService) {
    const scriptLoggerConfig = client.createEventData(
      "minecraft:script_logger_config"
    );
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    client.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);
  }
}
