import { Schema, type, view } from "@colyseus/schema";
import { GameRoom } from "../rooms/GameRoom";

// State sync: Player structure
export class Player extends Schema {
    // visible to all
    @type("float32") x: number = 0;
    @type("float32") y: number = 0;
    @type("float32") z: number = 0;
    @type("float32") rot: number = 0;
    @type("string") name: string = "NAME";

    // only needs to be visible to current player
    @view() @type("float32") speed: number = 0.5;
    @view() @type("float32") turnSpeed: number = 0.1;
    @type("int16") sequence: number = 0;

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

        // update sequence number
        this.sequence = sequence;

        // console.log(speed, turnSpeed, this.x, this.z, this.rot);
    }

    update(dt) {}
}
