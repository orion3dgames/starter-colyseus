import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Entity } from "../Entity";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { GameController } from "../../Controllers/GameController";
import { AssetContainer } from "@babylonjs/core/assetContainer";

const mergeMeshAndSkeleton = function (mesh, skeleton) {
    // pick what you want to merge
    const allChildMeshes = mesh.getChildTransformNodes(true)[0].getChildMeshes(false);

    // Ignore Backpack because pf different attributes
    // https://forum.babylonjs.com/t/error-during-merging-meshes-from-imported-glb/23483
    //const childMeshes = allChildMeshes.filter((m) => !m.name.includes("Backpack"));

    // multiMaterial = true
    const merged = Mesh.MergeMeshes(allChildMeshes, false, true, undefined, undefined, true);
    if (merged) {
        merged.name = "_MergedModel";
        merged.skeleton = skeleton;
    }
    return merged;
};

export class MeshController {
    private _entity: Entity;
    private _game: GameController;
    private _scene: Scene;

    public entityMesh: Mesh | InstancedMesh;
    public fakeShadow: Mesh;

    constructor(entity: Entity) {
        this._entity = entity;
        this._game = entity._game;
    }

    spawnCharacter() {
        let asset = this._game._loadedAssets["PLAYER_01"] as AssetContainer;

        //
        let mergedMesh = mergeMeshAndSkeleton(asset.rootNodes[0], asset.skeletons[0]);
        let playerMesh = mergedMesh.createInstance("player");
        playerMesh.parent = this._entity;

        asset.animationGroups[0].stop();

        // add player shadow
        this._entity._shadow.addShadowCaster(playerMesh);

        //
        this.entityMesh = playerMesh;

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

    spawnCapsule() {
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
