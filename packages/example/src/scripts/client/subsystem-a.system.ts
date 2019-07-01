import { System, OnInit, OnUpdate } from "@blokkr/core";

@System()
export class ExampleSubSystem implements OnInit, OnUpdate {
  constructor() {
    console.log("ExampleSubSystem Contstructor");
  }
  onInit() {
    console.log("ExampleSubSystem onInit");
  }
  onUpdate() {
    console.log("onUpdate");
  }
}
