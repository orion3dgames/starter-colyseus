import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameController } from "./GameController";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { generateSoloNavMesh } from "recast-navigation/generators";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { getNavMeshPositionsAndIndices, init } from "recast-navigation";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { GroundMesh } from "@babylonjs/core/Meshes/groundMesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { NavMeshQuery } from "recast-navigation";

export class NavMeshController {
    // core
    public _scene: Scene;
    public _game: GameController;
    public config: Config;

    //
    public _recast;
    public _navmesh;
    public _debugMesh: Mesh;

    constructor(gamescene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
    }

    async initialize(level) {
        this._recast = await init();
        console.log("[RECAST] recast initialized");

        this._navmesh = await this.generateNavmesh(level);
        console.log("[RECAST] navmesh created");

        await this.generateNavMeshDebug();
        console.log("[RECAST] navmesh debug created");
    }

    async findPath(start: Vector3, end: Vector3) {
        const navMeshQuery = new NavMeshQuery(this._navmesh);
        const { success, error, path } = navMeshQuery.computePath(start, end);
        console.log("[RECAST] navmesh query: ", start, end, success, error, path);
        return success;
    }

    async generateNavMeshDebug() {
        const [positions, indices] = getNavMeshPositionsAndIndices(this._navmesh);

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
        customMesh.position = new Vector3(0, 0.01, 0);

        // Save for later use
        this._debugMesh = customMesh;
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
            walkableRadius: 2,
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
