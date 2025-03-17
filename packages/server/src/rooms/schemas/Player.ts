import { Schema, type } from "@colyseus/schema";
import { ServerMsg } from "../../../../shared/types";
import { GameRoom } from "../GameRoom";

// State sync: Player structure
export class Player extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
    @type("number") speed: number = 0.5;
    @type("number") turnSpeed: number = 0.1;
    @type("number") rot: number = 0;
    @type("number") sequence: number = 0;
    @type("string") name: string = "NAME";

    constructor(auth, gameRoom: GameRoom) {
        super();

        this.speed = gameRoom.config.defaultSpeed;
        this.turnSpeed = gameRoom.config.defaultTurnSpeed;
        this.name = auth.user.displayName;
    }

    move(horizontal: number, vertical: number, sequence: number) {
        let speed = this.speed;
        let turnSpeed = this.turnSpeed;
        let rotation = this.rot;

        // Player's forward direction (Z-axis movement)
        let forwardX = Math.sin(rotation);
        let forwardZ = Math.cos(rotation);

        // Move forward/backward
        this.x += forwardX * horizontal * speed;
        this.z += forwardZ * horizontal * speed;

        // Rotate player left/right
        if (vertical > 0) {
            this.rot -= turnSpeed;
        }
        if (vertical < 0) {
            this.rot += turnSpeed;
        }

        this.sequence = sequence;

        console.log(ServerMsg[ServerMsg.PLAYER_MOVE], horizontal, vertical, this.x, this.z, this.rot);
    }

    update(dt) {}
}
