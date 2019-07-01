import { System, OnInit, OnUpdate } from "@blokkr/core";
import { ExampleSubSystem } from "./subsystem-a.system";
@System({
  systems: [ExampleSubSystem]
})
export class ExampleSystem implements OnInit, OnUpdate {
  constructor() {
    console.log("ExampleSystem Contstructor");
  }
  onInit() {
    console.log("onInit", "foo", "bar");
  }
  onUpdate() {
    // console.log("onUpdate");
  }
}
