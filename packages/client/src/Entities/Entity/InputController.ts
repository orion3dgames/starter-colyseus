import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entity";
import { Room } from "colyseus.js";
import { MoveController } from "./MoveController";

export class InputController {
    private _scene: Scene;
    private _room: Room;
    private _movement: MoveController;
    private needsUpdate: boolean = false;
    public moveKeys = { forward: false, backward: false, left: false, right: false };

    // Throttling properties
    private lastUpdateTime: number = 0;
    private readonly movementSendRate: number = 100; // Update every 100ms (10 times per second)

    constructor(entity: Entity) {
        this._movement = entity._movement;
        this._scene = entity._scene;
        this._room = entity._room;

        // Load movement send rate from game configuration
        this.movementSendRate = entity._game.config.movementSendRate;

        this._setupInputListeners();
    }

    // Set up keyboard input listeners
    _setupInputListeners() {
        this._scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this._handleKeyDown(kbInfo.event.key);
                    break;
                case KeyboardEventTypes.KEYUP:
                    this._handleKeyUp(kbInfo.event.key);
                    break;
            }
        });
    }

    // Handle key press events
    _handleKeyDown(key) {
        let updated = false;
        switch (key) {
            case "ArrowUp":
                if (!this.moveKeys.forward) {
                    updated = this.moveKeys.forward = true;
                }
                break;
            case "ArrowDown":
                if (!this.moveKeys.backward) {
                    updated = this.moveKeys.backward = true;
                }
                break;
            case "ArrowLeft":
                if (!this.moveKeys.left) {
                    updated = this.moveKeys.left = true;
                }
                break;
            case "ArrowRight":
                if (!this.moveKeys.right) {
                    updated = this.moveKeys.right = true;
                }
                break;
        }
        if (updated) {
            this.needsUpdate = true;
        }
    }

    // Handle key release events
    _handleKeyUp(key) {
        let updated = false;
        switch (key) {
            case "ArrowUp":
                if (this.moveKeys.forward) {
                    updated = !(this.moveKeys.forward = false);
                }
                break;
            case "ArrowDown":
                if (this.moveKeys.backward) {
                    updated = !(this.moveKeys.backward = false);
                }
                break;
            case "ArrowLeft":
                if (this.moveKeys.left) {
                    updated = !(this.moveKeys.left = false);
                }
                break;
            case "ArrowRight":
                if (this.moveKeys.right) {
                    updated = !(this.moveKeys.right = false);
                }
                break;
        }

        // Only stop updating if all keys are released
        if (updated && !this.moveKeys.forward && !this.moveKeys.backward && !this.moveKeys.left && !this.moveKeys.right) {
            this.needsUpdate = false;
        }
    }

    // Update player movement based on key presses
    update() {
        const currentTime = Date.now();
        if (!this.needsUpdate || currentTime - this.lastUpdateTime < this.movementSendRate) {
            return;
        }
        this.lastUpdateTime = currentTime;

        let horizontal = 0; // Forward/backward movement
        let vertical = 0; // Left/right rotation

        if (this.moveKeys.forward) {
            horizontal = 1;
        }
        if (this.moveKeys.backward) {
            horizontal = -1;
        }
        if (this.moveKeys.left) {
            vertical = 1;
        }
        if (this.moveKeys.right) {
            vertical = -1;
        }

        this._movement.processMove(horizontal, vertical);
    }
}
