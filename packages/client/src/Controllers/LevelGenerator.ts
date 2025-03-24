import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameController } from "./GameController";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class LevelGenerator {
    // core
    public _scene: Scene;
    public _game: GameController;
    public config: Config;

    public level: Mesh;

    constructor(gamescene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
    }

    async initialize() {
        // Create a terrain from a height map
        const terrain = MeshBuilder.CreateGroundFromHeightMap(
            "terrain",
            "./terrain/level_0.jpg", // Heightmap image URL
            { width: 100, height: 100, subdivisions: 50, minHeight: 0, maxHeight: 5 },
            this._scene
        );

        const texture = this._game._loadedAssets["GRASS_01"];
        texture.uScale = 40;
        texture.vScale = 40;

        // Apply a material to the terrain
        const terrainMaterial = new StandardMaterial("terrainMat", this._scene);
        terrainMaterial.diffuseTexture = texture;
        terrain.material = terrainMaterial;

        this.level = terrain;
    }
}
