import { Schema, type, view } from "@colyseus/schema";

// State sync: Player structure
export class PlayerSchema extends Schema {
    // visible to all
    @type("float32") x: number = 0;
    @type("float32") y: number = 0;
    @type("float32") z: number = 0;
    @type("float32") rot: number = 0;
    @type("string") name: string = "NAME";

    // only needs to be visible to current player
    @view() @type("number") speed: number = 0.5;
    @view() @type("float32") turnSpeed: number = 0.1;
    @view() @type("int16") sequence: number = 0;
}
