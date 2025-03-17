import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

export class PlayerCamera {
    private _scene: Scene;
    private _cameraRoot;
    public camera: ArcRotateCamera | FollowCamera | UniversalCamera;

    public shakeTimer;
    public shouldShake: boolean = false;

    constructor(scene) {
        this._scene = scene;
    }

    createUniversalCamera(scene) {
        //set up camera
        var cameraRoot = new TransformNode("cameraRoot");
        cameraRoot.position = new Vector3(0, 1.5, 0);
        cameraRoot.rotation = new Vector3(0, 0, 0);
        this._cameraRoot = cameraRoot;

        var camYAxis = new TransformNode("camYAxis");
        camYAxis.rotation = new Vector3(0, 0, 0);
        camYAxis.parent = cameraRoot;

        var camera = new UniversalCamera("playercamera", new Vector3(0, 2, -30), this._scene);
        camera.lockedTarget = cameraRoot.position;
        camera.fov = 0.35;
        camera.parent = camYAxis;

        this.camera = camera;
    }

    createFollowCamera(scene, player) {
        const followCamera = new FollowCamera("followCam", new Vector3(0, 3, -10), scene);
        followCamera.lockedTarget = player; // Always follow the player
        followCamera.radius = 20; // Distance from player
        followCamera.heightOffset = 4; // Camera height
        followCamera.rotationOffset = 10; // Angle behind player
        scene.activeCamera = followCamera;
    }

    createArcRotateCamera(scene, canvas, player) {
        const camera = new ArcRotateCamera("arcCamera", Math.PI / 2, Math.PI / 3, 5, player.position, scene);
        camera.attachControl(canvas, true);
        this.camera = camera;
    }

    tween(player) {
        //this.camera.position = player.position;
        //this._cameraRoot.position = Vector3.Lerp(this._cameraRoot.position, new Vector3(player.position.x, player.position.y, player.position.z), 0.2);
        this._cameraRoot.position = new Vector3(player.position.x, player.position.y, player.position.z);
        //this._cameraRoot.lockedTarget = player.position;
    }
}
