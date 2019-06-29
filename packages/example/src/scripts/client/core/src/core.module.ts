import "reflect-metadata";
import { Module } from "@blokkr/core";
import { ClientService } from "../index";

@Module({
  imports: [],
  declarations: [ClientService],
  exports: [ClientService]
})
export class CoreModule {
  constructor() {}
}
