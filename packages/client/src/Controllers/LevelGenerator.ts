import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameController } from "./GameController";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

export class LevelGenerator {
    // core
    public _scene: Scene;
    public _game: GameController;
    public config: Config;

    public mesh;

    constructor(gamescene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
    }

    mergeMesh(mesh, key = "MERGED_") {
        const allChildMeshes = mesh.getChildMeshes(false);
        const merged = Mesh.MergeMeshes(allChildMeshes, true, false, undefined, false, false);
        if (merged) {
            merged.name = key + "_" + mesh.name;
            return merged;
        }
    }

    async initialize() {
        const mesh = this.mergeMesh(this._game._loadedAssets["LEVEL_01"].loadedMeshes[0]);

        mesh.receiveShadows = true;

        this.mesh = [mesh];
    }
}
