import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";

export class CameraController {
    private _scene: Scene;
    private _cameraRoot: TransformNode;
    public camera: UniversalCamera;

    public offsetRotationTarget: number = 0;
    public offsetRotationDefault: number = 180;
    public goBackToDefault: boolean = false;

    constructor(scene) {
        this._scene = scene;

        //set up camera
        var cameraRoot = new TransformNode("cameraRoot");
        cameraRoot.position = new Vector3(0, 1.5, 0);
        cameraRoot.rotation = new Vector3(0, 0, 0);
        this._cameraRoot = cameraRoot;

        var camYAxis = new TransformNode("camYAxis");
        camYAxis.rotation = new Vector3(0.8, Math.PI / 2, 0);
        camYAxis.parent = cameraRoot;

        var camera = new UniversalCamera("playercamera", new Vector3(0, 1, -45), this._scene);
        camera.lockedTarget = cameraRoot.position;
        camera.fov = 0.35;
        camera.parent = camYAxis;

        this.camera = camera;
    }

    update(player) {
        this._cameraRoot.position = Vector3.Lerp(this._cameraRoot.position, new Vector3(player.position.x, player.position.y, player.position.z), 0.2);
    }

    /*
    createFollowCamera(scene, player) {
        const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), scene);
        camera.radius = 15;
        camera.heightOffset = 10;
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
            //console.log("returning back to default", this.camera.rotationOffset);
        }
    }

    public backToDefaultRotation(_player) {
        if (!_player._input.isCameraRotating) {
            this.goBackToDefault = true;
        }
    }
        */
}
