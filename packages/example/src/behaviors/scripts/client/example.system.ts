import { System, OnInit, OnUpdate } from "@blokkr/core";
import { ClientService } from "@blokkr/core";
import { ExampleSubSystem } from "./subsystem-a.system";
@System({
  systems: [ExampleSubSystem]
})
export class ExampleSystem implements OnInit, OnUpdate {
  public m: string = "This is the ExampleSystem";
  constructor(private client: ClientService) {
    console.log("ExampleSystem Contstructor", this);
  }
  onInit() {
    console.log("ExampleSystem", "onInit");
  }
  onUpdate() {
    // console.log("onUpdate");
  }
}
