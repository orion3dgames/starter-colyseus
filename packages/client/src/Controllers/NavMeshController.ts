import { Config } from "../../../shared/Config";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GameController } from "./GameController";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { generateSoloNavMesh } from "recast-navigation/generators";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GameScene } from "../Scenes/GameScene";
import { LevelGenerator } from "./LevelGenerator";
import { Crowd, CrowdAgent, exportNavMesh, getNavMeshPositionsAndIndices, init, NavMesh, NavMeshQuery } from "recast-navigation";
import { GLTF2Export, IExportOptions } from "@babylonjs/serializers";
import { Entity } from "../Entities/Entity";

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
    public _crowd: Crowd;
    public _agents: Map<string, CrowdAgent> = new Map();

    constructor(gamescene: GameScene) {
        this._scene = gamescene._scene;
        this._game = gamescene._game;
        this._gamescene = gamescene;
        this._level = gamescene._level;
        this._entities = gamescene.entities;
    }

    async initialize() {
        this._recast = await init();
        console.log("[RECAST] recast initialized");
    }

    async exportToGLTF() {
        const options: IExportOptions = {
            shouldExportNode: (node): boolean => {
                return node.name === "debugNavMesh";
            },
        };
        GLTF2Export.GLBAsync(this._scene, "fileName", options).then((glb) => {
            glb.downloadFiles();
        });
    }

    async findPath(start: Vector3, end: Vector3) {
        const navMeshQuery = new NavMeshQuery(this._navmesh);
        const { success, error, path } = navMeshQuery.computePath(start, end);
        if (path.length > 0) {
            console.log("[RECAST] navmesh query success: ", start, end, success, path);
            return true;
        }
        console.error("[RECAST] navmesh query failed: ", start, end, error, path);
        return false;
    }

    checkPoint(position: Vector3) {
        const navMeshQuery = new NavMeshQuery(this._navmesh);
        const { success, status, point, polyRef, isPointOverPoly } = navMeshQuery.findClosestPoint(position);
        if (isPointOverPoly) {
            //onsole.log("[RECAST] navmesh check success: ", success, status, point);
            return { isPointOverPoly, point };
        }
        //console.error("[RECAST] navmesh check failed: ", success, status, point);
        return { isPointOverPoly, point };
    }

    async regenerate(navMeshConfig = this.getDefaultConfig()) {
        await this.clearNavmesh();
        await this.generateNavmesh(navMeshConfig);
        await this.generateNavMeshDebug();
    }

    async generateNavmesh(navMeshConfig = this.getDefaultConfig()) {
        //
        await this.clearNavmesh();

        // Get the positions of the mesh
        const [positions, indices] = this.getPositionsAndIndices(this._level.mesh);

        const { success, navMesh } = generateSoloNavMesh(positions, indices, navMeshConfig);

        if (!success) {
            console.error("Error generating the navmesh", navMesh);
        }

        this._navmesh = navMesh;

        this._query = new NavMeshQuery(this._navmesh);

        //await this.createCrowd();
    }

    update() {
        /*
        const dt = 1 / 60;
        const maxSubSteps = 10;
        this._crowd.update(dt, maxSubSteps);

        this._entities.forEach((entity: Entity) => {
            entity._movement.targetPosition.x = entity._agent.interpolatedPosition.x;
            entity._movement.targetPosition.y = entity._agent.interpolatedPosition.y;
            entity._movement.targetPosition.z = entity._agent.interpolatedPosition.z;
        });*/
    }

    impulse(sessionId, targetVelocity) {
        let agent = this._agents.get(sessionId);
        agent.requestMoveVelocity(targetVelocity);
        console.log(this._crowd);
    }

    async createAgent(entity) {
        const navMeshQuery = new NavMeshQuery(this._navmesh);
        const { success, status, randomPolyRef, randomPoint } = navMeshQuery.findRandomPointAroundCircle(entity.position, 2);

        const agent = this._crowd.addAgent(entity.position, {
            radius: 1,
            height: 2,
            maxAcceleration: 4.0,
            maxSpeed: 1.0,
            collisionQueryRange: 0.5,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0,
        });
        entity._agent = agent;

        this._agents.set(entity.sessionId, agent);

        return agent;
    }

    async createCrowd() {
        const maxAgents = 10;
        const maxAgentRadius = 1;
        this._crowd = new Crowd(this._navmesh, { maxAgents, maxAgentRadius });
        console.log(this._crowd);

        // add all entities
        this._gamescene.entities.forEach((entity: Entity) => {
            this.createAgent(entity);
        });
    }

    async clearNavmesh() {
        this._crowd = null;
        this._agents = new Map();
        this._navmesh = null;
        if (this._debugMesh) {
            this._debugMesh.dispose(false, true);
        }
    }

    async generateNavMeshDebug() {
        if (!this._navmesh) {
            console.error("Navmesh does not exists", this._navmesh);
            return false;
        }

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
        //customMesh.position = new Vector3(0, 1, 0);

        // Save for later use
        this._debugMesh = customMesh;

        // debug
        console.log("[RECAST] navmesh debug created");
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
            walkableRadius: 1,
            maxEdgeLen: 12,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        };
    }
}
