import "reflect-metadata";
import { Module, ClientService } from "@blokkr/core";

@Module({
  imports: [],
  providers: [ClientService],
  exports: [ClientService]
})
export class CoreModule {
  public name: string = "The is the CoreModule";
  constructor() {
    console.log("CoreModule", this);
  }
}
