import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../Entity";
import { MoveController } from "./MoveController";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { CameraController } from "./CameraController";
import { roundTo } from "../../Utils/Utils";

export class InputController {
    private _camera: CameraController;
    private _scene: Scene;
    private _movement: MoveController;
    private needsUpdate: boolean = false;
    public moveKeys = { forward: false, backward: false, left: false, right: false };
    public rightMouseDown: boolean = false;
    public isCameraRotating: boolean = false;
    public spacePressed: boolean = false;

    constructor(entity: Entity) {
        this._camera = entity._camera;
        this._movement = entity._movement;
        this._scene = entity._scene;

        this._setupInputListeners();
    }

    _setupInputListeners() {
        this._scene.onKeyboardObservable.add((kbInfo) => {
            console.log(kbInfo.event.key);
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
                    if (pointerInfo.event.button === 0) {
                        this.isCameraRotating = true;
                    }
                    if (pointerInfo.event.button === 2) {
                        this.rightMouseDown = true;
                    }
                    break;
                case PointerEventTypes.POINTERUP:
                    if (pointerInfo.event.button === 0) {
                        this.isCameraRotating = false;
                        this._camera.offsetRotationTarget = 0;
                    }
                    if (pointerInfo.event.button === 2) {
                        this.rightMouseDown = false;
                    }
                    break;
                case PointerEventTypes.POINTERMOVE:
                    if (this.isCameraRotating) {
                        let offset = roundTo(pointerInfo.event.movementX * 0.3, 0);
                        this._camera.offsetRotationTarget = offset; // Rotate camera horizontally
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
            case "Space":
                console.log(key);
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
            case "Space":
                this.spacePressed = true;
                break;
        }

        if (updated && !Object.values(this.moveKeys).some(Boolean)) {
            this.needsUpdate = false;
        }
    }

    update() {
        if (!this.needsUpdate) {
            return;
        }

        let horizontal = 0; // Forward/backward movement
        let vertical = 0; // Left/right movement

        if (this.moveKeys.forward) horizontal = 1;
        if (this.moveKeys.backward) horizontal = -1;
        if (this.moveKeys.left) vertical = 1;
        if (this.moveKeys.right) vertical = -1;

        this._movement.processMove(horizontal, vertical);
    }
}
