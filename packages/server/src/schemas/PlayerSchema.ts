import { Schema, type, view } from "@colyseus/schema";
import { GameRoom } from "../rooms/GameRoom";

// State sync: Player structure
export class PlayerSchema extends Schema {
    // visible to all
    @type("float32") x: number = -22;
    @type("float32") y: number = 0;
    @type("float32") z: number = -19.27;
    @type("float32") rot: number = -5.44;
    @type("string") name: string = "NAME";

    // only needs to be visible to current player
    @view() @type("number") speed: number = 0.5;
    @view() @type("float32") turnSpeed: number = 0.1;
    @type("int16") sequence: number = 0;

    gameRoom: GameRoom;
    sessionId: string;

    constructor(auth, client, gameRoom: GameRoom) {
        super();

        if (!auth.user) {
            auth = {
                user: {
                    displayName: "PLAYER",
                },
            };
        }

        this.gameRoom = gameRoom;
        this.sessionId = client.sessionId;
        this.speed = gameRoom.config.defaultSpeed;
        this.turnSpeed = gameRoom.config.defaultTurnSpeed;
        this.name = auth!.user!.displayName;
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

        let debug = {
            x: this.x,
            y: this.y,
            z: this.z,
            rot: this.rot,
            sequence: this.sequence,
        };

        console.table(debug);
    }

    update(dt) {}

    delete() {}
}
