import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entity";
import { Room } from "colyseus.js";
import { MoveController } from "./MoveController";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";

export class InputController {
    private _scene: Scene;
    private _room: Room;
    private _movement: MoveController;
    private needsUpdate: boolean = false;
    public moveKeys = { forward: false, backward: false, left: false, right: false };
    public rightMouseDown: boolean = false;

    // Throttling properties
    private lastUpdateTime: number = 0;
    private readonly movementSendRate: number;

    constructor(entity: Entity) {
        this._movement = entity._movement;
        this._scene = entity._scene;
        this._room = entity._room;
        this.movementSendRate = entity._game.config.movementSendRate;

        this._setupInputListeners();
    }

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

        // Mouse event listeners
        this._scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.button === 2) {
                        // Right-click
                        this.rightMouseDown = true;
                    }
                    break;
                case PointerEventTypes.POINTERUP:
                    if (pointerInfo.event.button === 2) {
                        this.rightMouseDown = false;
                    }
                    break;
            }
        });
    }

    _handleKeyDown(key: string) {
        let updated = false;
        switch (key) {
            case "ArrowUp":
            case "w":
                if (!this.moveKeys.forward) {
                    updated = this.moveKeys.forward = true;
                }
                break;
            case "ArrowDown":
            case "s":
                if (!this.moveKeys.backward) {
                    updated = this.moveKeys.backward = true;
                }
                break;
            case "ArrowLeft":
            case "a":
                if (!this.moveKeys.left) {
                    updated = this.moveKeys.left = true;
                }
                break;
            case "ArrowRight":
            case "d":
                if (!this.moveKeys.right) {
                    updated = this.moveKeys.right = true;
                }
                break;
        }
        if (updated) {
            this.needsUpdate = true;
        }
    }

    _handleKeyUp(key: string) {
        let updated = false;
        switch (key) {
            case "ArrowUp":
            case "w":
                if (this.moveKeys.forward) {
                    updated = !(this.moveKeys.forward = false);
                }
                break;
            case "ArrowDown":
            case "s":
                if (this.moveKeys.backward) {
                    updated = !(this.moveKeys.backward = false);
                }
                break;
            case "ArrowLeft":
            case "a":
                if (this.moveKeys.left) {
                    updated = !(this.moveKeys.left = false);
                }
                break;
            case "ArrowRight":
            case "d":
                if (this.moveKeys.right) {
                    updated = !(this.moveKeys.right = false);
                }
                break;
        }
        if (updated && !Object.values(this.moveKeys).some(Boolean)) {
            this.needsUpdate = false;
        }
    }

    update() {
        const currentTime = Date.now();
        if (!this.needsUpdate || currentTime - this.lastUpdateTime < this.movementSendRate) {
            return;
        }
        this.lastUpdateTime = currentTime;

        let horizontal = 0; // Forward/backward movement
        let vertical = 0; // Left/right movement

        if (this.moveKeys.forward) horizontal = 1;
        if (this.moveKeys.backward) horizontal = -1;

        if (this.rightMouseDown) {
            // Strafe when right mouse button is held
            if (this.moveKeys.left) vertical = -1;
            if (this.moveKeys.right) vertical = 1;
        } else {
            // Rotate when right mouse button is not held
            if (this.moveKeys.left) vertical = 1;
            if (this.moveKeys.right) vertical = -1;
        }

        this._movement.processMove(horizontal, vertical);
    }
}
