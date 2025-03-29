import { Schema, type, view } from "@colyseus/schema";
import { GameRoom } from "../rooms/GameRoom";
import { Navmesh } from "../controllers/Navmesh";
import { GiftSchema } from "./GiftSchema";

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

    //
    closestGift: GiftSchema;
    closestGiftDistance: number; ///

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
        // save current position
        let playerPosition = { x: this.x, y: this.y, z: this.z };

        // calculate forces
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
    }

    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }

    distanceBetweenVectors(v1, v2) {
        return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2 + (v2.z - v1.z) ** 2);
    }

    /**
     */
    findClosestGift() {
        let closestDistance = 1000000;
        this.gameRoom.state.gifts.forEach((entity: any) => {
            let playerPos = this.getPosition();
            let entityPos = entity.getPosition();
            let distanceBetween = this.distanceBetweenVectors(playerPos, entityPos);
            if (distanceBetween < closestDistance) {
                closestDistance = distanceBetween;
                this.closestGift = entity;
                this.closestGiftDistance = distanceBetween;
            }
        });
    }

    update(dt) {
        this.findClosestGift();

        if (this.closestGiftDistance < 1) {
            this.closestGift.delete();
            this.gameRoom.state.gifts.delete(this.closestGift.sessionId);
        }
    }

    delete() {}
}
