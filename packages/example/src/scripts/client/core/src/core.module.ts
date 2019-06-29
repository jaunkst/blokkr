import "reflect-metadata";
import { MCModule } from "@blokkr/core";
import { ClientService } from "../index";

@MCModule({
  imports: [],
  declarations: [ClientService],
  exports: [ClientService]
})
export class CoreModule {
  constructor() {}
}
