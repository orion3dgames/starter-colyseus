import { Schema, type } from "@colyseus/schema";
import { GameState } from "./GameState";

function getRandomColor() {
    const colors = ["f52b00", "1b6df7", "21f71b", "e8f50e"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// State sync: Player structure
export class GiftSchema extends Schema {
    @type("string") sessionId: string;
    @type("float32") x: number = -5;
    @type("float32") y: number = 0;
    @type("float32") z: number = 0;
    @type("float32") rot: number = 0;
    @type("string") name: string = "NAME";
    @type("string") color: string = "#FFFFFF";

    public state: GameState;
    public spawnPoint;

    constructor(state: GameState, spawnPoint, sessionId) {
        super();

        this.state = state;
        this.spawnPoint = spawnPoint;

        this.sessionId = sessionId;
        this.x = spawnPoint.x;
        this.y = spawnPoint.y;
        this.z = spawnPoint.z;
        this.color = getRandomColor();
        this.name = "Gift";
    }

    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }

    update(dt) {}

    delete() {
        this.state.spawnPositions[this.spawnPoint.key].used = false;
    }
}
