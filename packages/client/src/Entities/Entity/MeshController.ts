import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Entity } from "../Entity";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

export class MeshController {
    private _entity: Entity;
    private _scene: Scene;

    public entityMesh;

    constructor(entity: Entity) {
        this._entity = entity;
    }

    spawn() {
        // create player mesh
        let boxSize = 1;
        const box = MeshBuilder.CreateBox("box", { height: boxSize, width: boxSize }, this._scene);
        box.position = new Vector3(0, boxSize / 2, 0);

        // material
        const material = new StandardMaterial("box-material", this._scene);
        material.specularColor = Color3.Black();

        //
        box.material = material;
        box.parent = this._entity;

        // add player shadow
        this._entity._shadow.addShadowCaster(box);

        //
        this.entityMesh = box;
    }

    update() {}
}
