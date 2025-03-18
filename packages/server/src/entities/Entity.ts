import { StateView } from "@colyseus/schema";
import { GameRoom } from "../rooms/GameRoom";
import { PlayerSchema } from "../schemas/PlayerSchema";

export class Entity {
    gameRoom: GameRoom;
    // colyseus chema
    schema: PlayerSchema;

    sessionId: string;

    // visible to all
    x: number = 0;
    y: number = 0;
    z: number = 0;
    rot: number = 0;
    name: string = "NAME";
    speed: number = 0.5;
    turnSpeed: number = 0.1;
    sequence: number = 0;

    constructor(auth, client, gameRoom: GameRoom) {
        if (!auth.user) {
            auth = {
                user: {
                    displayName: "PLAYER",
                },
            };
        }

        this.gameRoom = gameRoom;
        this.schema = new PlayerSchema();
        this.sessionId = client.sessionId;
        this.speed = gameRoom.config.defaultSpeed;
        this.turnSpeed = gameRoom.config.defaultTurnSpeed;
        this.name = auth!.user!.displayName;

        // add to colyseus state
        client.view = new StateView();
        gameRoom.state.players.set(this.sessionId, this.schema);
        client.view.add(this.schema);
    }

    /*
     * synchronize server entity values to schema so it updates to the client(s) states
     */
    syncToSchema() {
        // private properties
        this.schema.sequence = this.sequence;
        this.schema.speed = this.speed;
        this.schema.turnSpeed = this.turnSpeed;

        // public properties
        this.schema.name = this.name;
        this.schema.rot = this.rot;
        // when the below properties are commented, all the above property get synced correctly
        // --- > when i uncomment the below properties, every get synced except for the private properties...
        //this.schema.x = this.x;
        //this.schema.y = this.y;
        //this.schema.z = this.z;
        console.log("SYNCING SEQ TO SCHEMA", this.schema.sequence);
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
    }

    update(dt) {
        this.syncToSchema();
    }

    delete() {
        console.log("[DELETED] deleting schema for ", this.sessionId);
        this.gameRoom.state.players.delete(this.sessionId);
    }
}
