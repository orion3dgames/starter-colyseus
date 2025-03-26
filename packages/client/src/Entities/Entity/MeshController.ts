import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Entity } from "../Entity";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class MeshController {
    private _entity: Entity;
    private _scene: Scene;

    public entityMesh: Mesh;
    public fakeShadow: Mesh;

    constructor(entity: Entity) {
        this._entity = entity;
    }

    spawn() {
        // create player mesh
        let boxSize = 2;
        const box = MeshBuilder.CreateCapsule("Player_" + this._entity.sessionId, { height: boxSize, radius: 0.5 }, this._scene);
        box.position = new Vector3(0, boxSize / 2 + 0.01, 0);

        // material
        const material = new StandardMaterial("box-material", this._scene);
        material.specularColor = Color3.Black();

        //
        box.material = material;
        box.parent = this._entity;

        // add arms
        const arms = MeshBuilder.CreateBox("PlayerArm_" + this._entity.sessionId, { width: 2, height: 0.2, depth: 0.2 }, this._scene);
        arms.position = new Vector3(0, -0.1, 0);
        arms.parent = box;

        // add player shadow
        this._entity._shadow.addShadowCaster(box);

        //
        this.entityMesh = box;

        // add cheap shadow
        if (this._entity._game._loadedAssets["DYNAMIC_shadow_01"]) {
            let shadowMesh = this._entity._game._loadedAssets["DYNAMIC_shadow_01"].createInstance("shadow_" + this._entity.sessionId);
            shadowMesh.parent = this._entity;
            shadowMesh.isPickable = false;
            shadowMesh.checkCollisions = false;
            shadowMesh.doNotSyncBoundingInfo = true;
            shadowMesh.position = new Vector3(0, 0.01, 0);
            shadowMesh.alwaysSelectAsActiveMesh = true;
            this.fakeShadow = shadowMesh;
        }
    }

    update() {}
}
