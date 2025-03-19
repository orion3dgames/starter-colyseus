import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";

export class CameraController {
    private _scene: Scene;
    private _cameraRoot: TransformNode;
    public camera: FollowCamera;

    public offsetRotationTarget: number = 0;
    public offsetRotationDefault: number = 180;
    public goBackToDefault: boolean = false;

    constructor(scene) {
        this._scene = scene;
    }

    createFollowCamera(scene, player) {
        const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), scene);
        camera.radius = 10;
        camera.heightOffset = 6;
        camera.rotationOffset = 180;
        camera.cameraAcceleration = 0.2;
        camera.maxCameraSpeed = 5;
        // Attach Camera to Player
        camera.lockedTarget = player;
        this.camera = camera;
    }

    update() {
        // rotate camera as needed
        this.camera.rotationOffset -= this.offsetRotationTarget;

        // Return camera to default position
        if (this.goBackToDefault && this.camera.rotationOffset !== this.offsetRotationDefault) {
            if (this.camera.rotationOffset > this.offsetRotationDefault) {
                this.camera.rotationOffset -= 1;
            } else {
                this.camera.rotationOffset += 1;
            }
            if (this.camera.rotationOffset === this.offsetRotationDefault) {
                this.goBackToDefault = false;
            }
            console.log("returning back to default", this.camera.rotationOffset);
        }
    }

    tween(player) {
        this._cameraRoot.position = new Vector3(player.position.x, player.position.y, player.position.z);
    }
}
