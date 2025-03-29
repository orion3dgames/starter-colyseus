import { Schema, type } from "@colyseus/schema";
import { GameState } from "./GameState";

function getRandomColor() {
    const colors = ["f52b00", "1b6df7", "21f71b", "e8f50e"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// State sync: Player structure
export class GiftSchema extends Schema {
    @type("float32") x: number = -5;
    @type("float32") y: number = 0;
    @type("float32") z: number = 0;
    @type("float32") rot: number = 0;
    @type("string") name: string = "NAME";
    @type("string") color: string = "#FFFFFF";

    constructor(state: GameState, position) {
        super();

        this.x = position.x;
        this.y = position.y;
        this.z = position.z;
        this.color = getRandomColor();
        this.name = "Gift";
    }

    update(dt) {}

    delete() {}
}
