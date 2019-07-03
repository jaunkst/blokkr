import { System, OnInit, OnUpdate } from "@blokkr/core";
import { ExampleSubSystem } from "./subsystem-a.system";
@System({
  systems: [ExampleSubSystem]
})
export class ExampleSystem implements OnInit, OnUpdate {
  public m: string = "mooX";
  constructor() {
    console.log("ExampleSystem Contstructor", this);
  }
  onInit() {
    console.log("onInit", "foo", "bar");
    console.log(JSON.stringify({ x: "WTH" }));
    console.log(JSON.stringify({ m: this.m }));
    console.log(this);
  }
  onUpdate() {
    // console.log("onUpdate");
  }
}
