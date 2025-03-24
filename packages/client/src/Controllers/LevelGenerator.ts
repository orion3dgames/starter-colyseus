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

    async initialize() {
        this.mesh = [this._game._loadedAssets["LEVEL_01"].loadedMeshes[1]];

        //this.mesh = [level];
    }

    // async initialize() {
    //     // generate level
    //     const plane = MeshBuilder.CreatePlane("plane", { size: 20 }, this._scene);
    //     plane.rotation.x = Math.PI / 2;
    //     plane.receiveShadows = true;

    //     // generate obstacles
    //     const box = MeshBuilder.CreateBox("box", { size: 2 }, this._scene);
    //     box.position = new Vector3(0, 1, 5);

    //     const level = Mesh.MergeMeshes([plane, box], true, false, null, false, true);

    //     const texture = this._game._loadedAssets["GRASS_01"] as Texture;
    //     texture.uScale = 60;
    //     texture.vScale = 60;
    //     const material = new StandardMaterial("grass", this._scene);
    //     material.specularColor = Color3.Black();
    //     material.diffuseTexture = texture;

    //     level.material = material;

    //     this.mesh = [level];
    // }

    // async initialize() {

    //     // Create a terrain from a height map
    //     const terrain = MeshBuilder.CreateGroundFromHeightMap(
    //         "terrain",
    //         "./terrain/level_0.jpg", // Heightmap image URL
    //         { width: 100, height: 100, subdivisions: 50, minHeight: 0, maxHeight: 5 },
    //         this._scene
    //     );

    //     terrain.receiveShadows = true;

    //     const texture = this._game._loadedAssets["GRASS_01"];
    //     texture.uScale = 40;
    //     texture.vScale = 40;

    //     // Apply a material to the terrain
    //     const terrainMaterial = new StandardMaterial("terrainMat", this._scene);
    //     terrainMaterial.specularColor = Color3.Black();
    //     terrainMaterial.diffuseTexture = texture;
    //     terrain.material = terrainMaterial;

    //     this.level = terrain;

    // }
}
