import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameController } from "./GameController";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { generateSoloNavMesh } from "recast-navigation/generators";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { GameScene } from "../Scenes/GameScene";
import { LevelGenerator } from "./LevelGenerator";
import { exportNavMesh, getNavMeshPositionsAndIndices, importNavMesh, init, NavMesh, NavMeshQuery } from "recast-navigation";
import { Entity } from "../Entities/Entity";
import Debugger from "../Utils/Debugger";

export class NavMeshController {
    // core
    public _scene: Scene;
    public _gamescene: GameScene;
    public _game: GameController;
    public _entities: Map<string, Entity>;
    public config: Config;

    //
    public _level: LevelGenerator;
    public _recast;
    public _navmesh: NavMesh;
    public _query: NavMeshQuery;
    public _debugMesh: Mesh;

    constructor(gamescene: GameScene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
        this._gamescene = gamescene;
        this._level = gamescene._level;
        this._entities = gamescene.entities;
    }

    async initialize() {
        this._recast = await init();
        //debug("RECAST", "");
        Debugger.log("RECAST", "recast initialized");
    }

    async export() {
        /* export */
        const navMeshExport: Uint8Array = exportNavMesh(this._navmesh);

        // Create element with <a> tag
        const link = document.createElement("a");

        // Create a blog object with the file content which you want to add to the file
        const file = new Blob([navMeshExport as any], { type: "application/octet-stream" });

        // Add file content in the object URL
        link.href = URL.createObjectURL(file);

        // Add file name
        link.download = "level.bin";

        // Add click event to <a> tag to save file.
        link.click();

        URL.revokeObjectURL(link.href);

        // update assets
        this._game._loadedAssets["LEVEL_01_NAVMESH"] = file.arrayBuffer;
    }

    async import() {
        await this.clearNavmesh();
        const navMeshExport = this._game._loadedAssets["LEVEL_01_NAVMESH"];
        const arr = new Uint8Array(navMeshExport);
        const { navMesh } = importNavMesh(arr);
        this._navmesh = navMesh;
        this._query = new NavMeshQuery(this._navmesh);
        await this.generateNavMeshDebug();
        Debugger.log("RECAST", "imported navmesh");
    }

    async regenerate(navMeshConfig = this.getDefaultConfig()) {
        await this.generateNavmesh(navMeshConfig, this._level.mesh);
        await this.generateNavMeshDebug();
    }

    async generateNavmesh(navMeshConfig = this.getDefaultConfig(), mesh = []) {
        // clear navmesh
        await this.clearNavmesh();

        // Get the positions of the mesh
        const [positions, indices] = this.getPositionsAndIndices(mesh);

        const { success, navMesh } = generateSoloNavMesh(positions, indices, navMeshConfig);

        if (!success) {
            Debugger.error("RECAST", "error generating the navmesh", navMesh);
        }

        this._navmesh = navMesh;

        this._query = new NavMeshQuery(this._navmesh);
    }

    update() {}

    async clearNavmesh() {
        this._navmesh = null;
        if (this._debugMesh) {
            this._debugMesh.dispose(false, true);
        }
        Debugger.log("RECAST", "navmesh reset");
    }

    async generateNavMeshDebug() {
        if (!this._navmesh) {
            Debugger.error("RECAST", "navmesh does not exists");
            return false;
        }

        const [positions, indices] = getNavMeshPositionsAndIndices(this._navmesh);

        if (positions.length === 0 || indices.length === 0) {
            Debugger.warn("RECAST", "navmesh position and indices are empty");
            return false;
        }

        // Create a new mesh
        const customMesh = new Mesh("debugNavMesh", this._scene);

        // Create a VertexData object
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;

        // Compute normals for correct lighting
        vertexData.normals = [];
        VertexData.ComputeNormals(positions, indices, vertexData.normals);

        // 🎨 Generate random colors for each face
        const colors = new Array((positions.length / 3) * 4).fill(0); // Initialize array

        for (let i = 0; i < indices.length; i += 3) {
            // Generate a random color for this face
            const color = new Color4(Math.random(), Math.random(), Math.random(), 1);

            // Assign the color to each vertex of the face
            for (let j = 0; j < 3; j++) {
                const vertexIndex = indices[i + j] * 4; // Each Color4 has 4 values (RGBA)
                colors[vertexIndex] = color.r;
                colors[vertexIndex + 1] = color.g;
                colors[vertexIndex + 2] = color.b;
                colors[vertexIndex + 3] = color.a;
            }
        }

        // Apply colors to vertex data
        vertexData.colors = colors;

        // Apply the vertexData to the mesh
        vertexData.applyToMesh(customMesh);

        // Create and assign material
        const material = new StandardMaterial("navMeshDebug", this._scene);
        material.backFaceCulling = false;
        material.alpha = 0.5;
        material.emissiveColor = new Color3(50, 50, 50);
        customMesh.material = material;

        // Move it slightly up to avoid z-fighting
        //customMesh.position = new Vector3(0, 1, 0);

        // Save for later use
        this._debugMesh = customMesh;

        // hide mesh by default
        this._debugMesh.isVisible = false;

        // debug
        Debugger.log("RECAST", "navmesh debug created");
    }

    getPositionsAndIndices = (meshes: Mesh[]): [positions: Float32Array, indices: Uint32Array] => {
        const toMerge: {
            positions: ArrayLike<number>;
            indices: ArrayLike<number>;
        }[] = [];

        for (const mesh of meshes) {
            const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
            const indices = mesh.getIndices();
            indices.reverse();

            toMerge.push({
                positions,
                indices,
            });
        }
        return this.mergePositionsAndIndices(toMerge);
    };

    mergePositionsAndIndices = (
        meshes: Array<{
            positions: ArrayLike<number>;
            indices: ArrayLike<number>;
        }>
    ): [Float32Array, Uint32Array] => {
        const mergedPositions: number[] = [];
        const mergedIndices: number[] = [];

        const positionToIndex: { [hash: string]: number } = {};
        let indexCounter = 0;

        for (const { positions, indices } of meshes) {
            for (let i = 0; i < indices.length; i++) {
                const pt = indices[i] * 3;

                const x = positions[pt];
                const y = positions[pt + 1];
                const z = positions[pt + 2];

                const key = `${x}_${y}_${z}`;
                let idx = positionToIndex[key];

                if (!idx) {
                    positionToIndex[key] = idx = indexCounter;
                    mergedPositions.push(x, y, z);
                    indexCounter++;
                }

                mergedIndices.push(idx);
            }
        }

        return [Float32Array.from(mergedPositions), Uint32Array.from(mergedIndices)];
    };

    getDefaultConfig() {
        return {
            borderSize: 0,
            tileSize: 0,
            cs: 0.2, // cell size
            ch: 0.2, // cell height
            walkableSlopeAngle: 60,
            walkableHeight: 2,
            walkableClimb: 2,
            walkableRadius: 2,
            minRegionArea: 12,
        };
    }
}
