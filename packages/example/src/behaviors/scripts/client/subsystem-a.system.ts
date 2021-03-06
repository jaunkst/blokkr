import { System, OnInit, OnUpdate } from "@blokkr/core";
import { ClientService } from "@blokkr/core";

@System()
export class ExampleSubSystem implements OnInit, OnUpdate {
  constructor(public client: ClientService) {
    console.log("ExampleSubSystem Contstructor");
  }
  onInit() {
    console.log("ExampleSubSystem onInit");
    console.log(this.client);
  }
  onUpdate() {
    // console.log("onUpdate");
  }
}
