import "reflect-metadata";
import { Module, ClientService } from "@blokkr/core";

@Module({
  imports: [],
  providers: [ClientService],
  exports: [ClientService]
})
export class CoreModule {
  public foo: string = "bar";
  constructor() {
    console.log("CoreModule", this);
  }
}
