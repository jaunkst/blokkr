import { System, OnInit, OnUpdate } from "@blokkr/core";

@System()
export class ServerSystem implements OnInit, OnUpdate {
  public m: string = "mooX";
  constructor() {
    console.log("ServerSystem Contstructor", this);
  }
  onInit() {
    console.log("onInit", "ServerSystem onInit");
  }
  onUpdate() {
    // console.log("onUpdate");
  }
}
