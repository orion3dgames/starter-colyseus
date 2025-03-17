import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entity";
import { Room } from "colyseus.js";
import { MoveController } from "./MoveController";

export class PlayerInput {
    private _scene: Scene;
    private _room: Room;
    private _moveController: MoveController;
    private needsUpdate: boolean = false;
    public moveKeys = { forward: false, backward: false, left: false, right: false };

    constructor(entity: Entity) {
        this._moveController = entity.moveController;
        this._scene = entity._scene;
        this._room = entity._room;

        this._setupInputListeners();
    }

    // Babylon.js Keyboard Input Handling
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

    // Handle key press
    _handleKeyDown(key) {
        let updated = false;
        switch (key) {
            case "ArrowUp":
                if (!this.moveKeys.forward) updated = this.moveKeys.forward = true;
                break;
            case "ArrowDown":
                if (!this.moveKeys.backward) updated = this.moveKeys.backward = true;
                break;
            case "ArrowLeft":
                if (!this.moveKeys.left) updated = this.moveKeys.left = true;
                break;
            case "ArrowRight":
                if (!this.moveKeys.right) updated = this.moveKeys.right = true;
                break;
        }
        if (updated) this.needsUpdate = true;
    }

    // Handle key release
    _handleKeyUp(key) {
        let updated = false;
        switch (key) {
            case "ArrowUp":
                if (this.moveKeys.forward) updated = !(this.moveKeys.forward = false);
                break;
            case "ArrowDown":
                if (this.moveKeys.backward) updated = !(this.moveKeys.backward = false);
                break;
            case "ArrowLeft":
                if (this.moveKeys.left) updated = !(this.moveKeys.left = false);
                break;
            case "ArrowRight":
                if (this.moveKeys.right) updated = !(this.moveKeys.right = false);
                break;
        }

        // Only stop updating if ALL keys are released
        if (updated && !this.moveKeys.forward && !this.moveKeys.backward && !this.moveKeys.left && !this.moveKeys.right) {
            this.needsUpdate = false;
        }
    }

    // Update only when needed
    update() {
        if (!this.needsUpdate) return; // Skip update if nothing changed

        let horizontal = 0; // Forward/backward movement
        let vertical = 0; // Left/right rotation

        if (this.moveKeys.forward) horizontal = 1;
        if (this.moveKeys.backward) horizontal = -1;
        if (this.moveKeys.left) vertical = 1;
        if (this.moveKeys.right) vertical = -1;

        this._moveController.processMove(horizontal, vertical);
    }
}
