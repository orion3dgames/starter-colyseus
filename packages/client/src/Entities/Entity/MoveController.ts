import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ServerMsg, PlayerInputs } from "../../../../shared/types";
import { Entity } from "../Entity";
import { Scene } from "@babylonjs/core/scene";
import { GameController } from "../../Controllers/GameController";

export class MoveController {
    private _player: Entity;
    private _room;
    private _game: GameController;
    private _scene: Scene;

    public targetPosition: Vector3;
    private targetRotation: Vector3;

    public playerInputs: PlayerInputs[] = []; // Stores the player's movement inputs for prediction/reconciliation
    private playerLatestSequence: number; // Tracks the sequence number of the last processed move by the server
    private sequence: number = 0; // Sequence counter to track the order of player inputs

    constructor(player: Entity) {
        // Initialize the controller with the player's entity and other game objects
        this._scene = player._scene;
        this._player = player;
        this._room = player._room;
        this._game = player._game;

        // Set the initial target position and rotation to the player's current position and rotation
        this.targetPosition = this._player.position.clone();
        this.targetRotation = this._player.rotation.clone();
    }

    // Set the player's target position and rotation based on external input (e.g., from the server)
    public setPositionAndRotation(entity): void {
        this.targetPosition = new Vector3(entity.x, entity.y, entity.z); // Set the new target position (y is set to 0)
        this.targetRotation = new Vector3(0, entity.rot, 0); // Set the new target rotation (yaw only)
    }

    // Moves the player based on input values for horizontal and vertical movement
    public move(horizontal: number, vertical: number) {
        let playerPosition = this.targetPosition.clone();

        // Normalize the movement vector to ensure consistent movement speed regardless of direction
        const movementVector = new Vector3(horizontal * this._player.speed, 0, vertical * this._player.speed);
        const movementTarget = playerPosition.add(movementVector);

        //
        const { nearestRef: polyRef } = this._player._navmesh._query.findNearestPoly(playerPosition);

        // Move along the surface of the navmesh
        const { resultPosition, visited } = this._player._navmesh._query.moveAlongSurface(polyRef, playerPosition, movementTarget);
        const moveAlongSurfaceFinalRef = visited[visited.length - 1];

        // get height
        const { success: heightSuccess, height } = this._player._navmesh._query.getPolyHeight(moveAlongSurfaceFinalRef, resultPosition);

        if (heightSuccess) {
            // Update the player's target position based on forward and strafe movement
            this.targetPosition.x = resultPosition.x;
            this.targetPosition.z = resultPosition.z;
            this.targetPosition.y = height;
        }

        // rotate player mesh to fake player rotation
        const rotation = Math.atan2(movementVector.x, movementVector.z) - Math.PI;
        this._player._mesh.entityMesh.rotation.y = rotation;
    }

    // Smoothly interpolate the player's position and rotation towards the target
    public update(tween: number = 0.1) {
        let l = this._player.position.subtract(this.targetPosition).length();
        if (l > 0.01) {
            Vector3.LerpToRef(this._player.position, this.targetPosition, tween, this._player.position);
            Vector3.LerpToRef(this._player.rotation, this.targetRotation, tween, this._player.rotation);
        }
    }

    // Processes the player's movement input, sends it to the server, and performs prediction
    public processMove(horizontal: number, vertical: number) {
        this.sequence++; // Increment the input sequence to keep track of the order of moves

        let latestInput = { seq: this.sequence, h: horizontal, v: vertical }; // Create an input object with sequence and movement values

        if (!this.canMove(latestInput)) return; // Check if the player is allowed to move

        this._game.sendMessage(ServerMsg.PLAYER_MOVE, latestInput); // Send the move input to the server
        this.predictionMove(latestInput); // Perform local prediction of the player's movement
    }

    // Local movement prediction: updates the player's position based on the latest input
    public predictionMove(latestInput: PlayerInputs) {
        this.move(latestInput.h, latestInput.v); // Move the player based on the input
        this.playerInputs.push(latestInput); // Store the input for later reconciliation
    }

    // Reconciles the player's predicted movement with the server's confirmation
    public reconcileMove(latestSequence: number) {
        this.playerLatestSequence = latestSequence; // Update the latest valid sequence from the server

        if (!this.playerInputs.length) return; // If there are no inputs to reconcile, exit

        // Filter out inputs that have already been processed and apply the remaining ones
        this.playerInputs = this.playerInputs.filter((input) => {
            if (input.seq > this.playerLatestSequence) {
                this.move(input.h, input.v); // Apply the remaining valid inputs
                return true; // Keep this input for future processing
            }
            return false; // Discard already processed inputs
        });
    }

    // Determines whether the player is allowed to move, currently always returns true
    public canMove(_playerInput: PlayerInputs): boolean {
        return true; // In this version, the player can always move
    }
}
