import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { GameController } from "./GameController";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

export class LevelGenerator {
    // core
    public _scene: Scene;
    public _game: GameController;
    public _shadow: ShadowGenerator;
    public config: Config;

    public mesh;

    constructor(gamescene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
        this._shadow = gamescene._shadow;
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
        this._shadow.addShadowCaster(mesh);
        this.mesh = [mesh];
    }
}
