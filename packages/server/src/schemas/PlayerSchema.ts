import { Schema, type, view } from "@colyseus/schema";
import { GameRoom } from "../rooms/GameRoom";
import { Navmesh } from "../controllers/Navmesh";

// State sync: Player structure
export class PlayerSchema extends Schema {
    // visible to all
    @type("float32") x: number = -5;
    @type("float32") y: number = 0;
    @type("float32") z: number = 0;
    @type("float32") rot: number = 0;
    @type("string") name: string = "NAME";

    // only needs to be visible to current player
    @view() @type("number") speed: number;
    @view() @type("float32") turnSpeed: number;
    @type("int16") sequence: number = 0;

    gameRoom: GameRoom;
    _navmesh: Navmesh;
    sessionId: string;

    //
    lastKnowValidHeight: [];

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
        this._navmesh = gameRoom._navmesh;
        this.sessionId = client.sessionId;
        this.speed = gameRoom.config.defaultSpeed;
        this.turnSpeed = gameRoom.config.defaultTurnSpeed;
        this.name = auth!.user!.displayName;
    }

    move(horizontal: number, vertical: number, sequence: number) {
        let playerPosition = { x: this.x, y: this.y, z: this.z };

        const movementVector = {
            x: horizontal * this.speed,
            y: 0,
            z: vertical * this.speed,
        };

        // Normalize the movement vector to ensure consistent movement speed regardless of direction
        const movementTarget = {
            x: playerPosition.x + movementVector.x,
            y: playerPosition.y + movementVector.y,
            z: playerPosition.z + movementVector.z,
        };

        // find closest region
        const { nearestRef: polyRef } = this._navmesh._query.findNearestPoly(playerPosition);

        // Move along the surface of the navmesh
        const { resultPosition, visited } = this._navmesh._query.moveAlongSurface(polyRef, playerPosition, movementTarget);
        const moveAlongSurfaceFinalRef = visited[visited.length - 1];
        const { success: heightSuccess, height } = this._navmesh._query.getPolyHeight(moveAlongSurfaceFinalRef, resultPosition); // get height

        // Update the player's target position based on forward and strafe movement
        let newPosition = {
            x: resultPosition.x,
            z: resultPosition.z,
            y: playerPosition.y,
        };

        // make sure the height is valid and on navmesh
        if (heightSuccess) {
            newPosition.y = height;
        } else {
            newPosition = playerPosition;
        }

        // set new position
        this.x = newPosition.x;
        this.z = newPosition.z;
        this.y = newPosition.y;

        // update sequence
        this.sequence = sequence;

        /*
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

        console.table(debug);*/
    }

    update(dt) {}

    delete() {}
}
