import { System, OnInit, OnUpdate } from "@blokkr/core";
import { ClientService } from "@blokkr/core";
import { ExampleSubSystem } from "./subsystem-a.system";
@System({
  systems: [ExampleSubSystem]
})
export class ExampleSystem implements OnInit, OnUpdate {
  public m: string = "mooX";
  constructor(private client: ClientService) {
    console.log("ExampleSystem Contstructor", this);
  }
  onInit() {
    console.log("onInit", "foo", "bar");
    console.log(JSON.stringify({ x: "WTH" }));
    console.log(JSON.stringify({ m: this.m }));
    console.log(this);

    console.log("loading ui");
    let loadEventData = this.client.createEventData("minecraft:load_ui");
    loadEventData.data.path = "test.html";
    loadEventData.data.options.is_showing_menu = false;
    loadEventData.data.options.absorbs_input = true;
    this.client.broadcastEvent("minecraft:load_ui", loadEventData);
  }
  onUpdate() {
    // console.log("onUpdate");
  }
}
