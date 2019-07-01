import "reflect-metadata";
import { Module, ClientService } from "@blokkr/core";

@Module({
  imports: [],
  providers: [ClientService],
  exports: [ClientService]
})
export class CoreModule {
  constructor() {}
}
