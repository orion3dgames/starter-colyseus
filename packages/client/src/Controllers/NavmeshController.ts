import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameController } from "./GameController";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { generateSoloNavMesh } from "recast-navigation/generators";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { getNavMeshPositionsAndIndices, init } from "recast-navigation";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { GroundMesh } from "@babylonjs/core/Meshes/groundMesh";

export class NavMeshController {
    // core
    public _scene: Scene;
    public _game: GameController;
    public config: Config;
    public recast;

    constructor(gamescene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
    }

    async initialize(level) {
        this.recast = await init();
        console.log("[RECAST] recast initialized");

        let navmesh = await this.generateNavmesh(level);
        console.log("[RECAST] navmesh created");

        await this.generateNavMeshDebug(navmesh);
        console.log("[RECAST] navmesh debug created");
    }

    async generateNavMeshDebug(navmesh) {
        const [positions, indices] = getNavMeshPositionsAndIndices(navmesh);

        // Create a new mesh
        const customMesh = new Mesh("debugNavMesh", this._scene);

        // Create a VertexData object
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;

        // Optionally, compute normals for correct lighting
        vertexData.normals = [];
        VertexData.ComputeNormals(positions, indices, vertexData.normals);

        // Apply the vertexData to the mesh
        vertexData.applyToMesh(customMesh);

        // Optional: Set a color or material for the mesh
        const material = new StandardMaterial("customMaterial", this._scene);
        material.diffuseColor = Color3.Red();
        material.wireframe = true; // Enable wireframe mode
        customMesh.material = material;
    }

    async generateNavmesh(level: GroundMesh) {
        // Get the positions of the mesh

        const [positions, indices] = this.getPositionsAndIndices([level]);

        const navMeshConfig = {
            borderSize: 0,
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 35,
            walkableHeight: 1,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 12,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        };

        const { success, navMesh } = generateSoloNavMesh(positions, indices, navMeshConfig);

        return navMesh;
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
}
