import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import RAPIER, { ColliderDesc, RigidBody, World } from "@dimforge/rapier3d-compat-simd";

export class PhysicsController {
    public _physics: typeof RAPIER;
    public _scene: Scene;

    public gravity = { x: 0.0, y: -9.81, z: 0.0 };
    public world: World;
    public rigidBodies = new Map();
    public colliders = new Map();
    public meshes = new Map();

    public debugMesh;
    public debugMeshVertexData;

    constructor(scene) {
        this._scene = scene;
    }

    async init() {
        await RAPIER.init();
        this._physics = RAPIER;
        console.log("[PHYSICS] rapier initialized", this._physics);

        this.world = new this._physics.World(this.gravity);
        console.log("[PHYSICS] rapier world initialized", this.world);

        // Create a debug mesh
        this.debugMesh = new Mesh("debugMesh", this._scene);
        this.debugMeshVertexData = new VertexData();
    }

    debug() {
        const { vertices, colors } = this.world.debugRender();

        const points = [];
        for (let i = 0; i < vertices.length; i += 6) {
            // Extract each pair of points (x, y, z)
            const v1 = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            const v2 = new Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
            points.push(v1, v2);
        }

        // Dispose of the old debug mesh and create a new one
        this.debugMesh.dispose();
        this.debugMesh = MeshBuilder.CreateLines("debugLines", { points }, this._scene);
        this.debugMesh.color = new Color3(1, 0, 0); // Red color for debug lines
    }

    impulse(mesh, x, z) {
        console.log("[PHYSICS] impulse", x, z);
        this.rigidBodies.get(mesh.id).applyImpulse({ x: x, y: 0, z: z }, true);
    }

    addStaticMesh(mesh) {
        // add static mesh collider
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        const indices = mesh.getIndices();
        let meshCollider = this._physics.ColliderDesc.trimesh(positions, indices);
        meshCollider.friction = 5;

        // RAPIER physics always uses quaternions.
        // https://rapier.rs/docs/user_guides/javascript/rigid_bodies
        mesh.computeWorldMatrix(true);
        let groundRotQ = mesh.absoluteRotationQuaternion.clone();
        let groundSizes = mesh.getHierarchyBoundingVectors();

        // initial position
        meshCollider.setTranslation(0, 0, 0);
        // initial rotation
        meshCollider.setRotation({
            x: groundRotQ.x,
            y: groundRotQ.y,
            z: groundRotQ.z,
            w: groundRotQ.w,
        });

        // Add physics ground in world.
        // Since it is static, it doesn't need a rigid body component.
        this.world.createCollider(meshCollider);

        //
        //this.debug();
    }

    addDynamicMesh(sphereMesh: Mesh) {
        console.log("[PHYSICS] adding mesh to simulation as a rigibody: ", sphereMesh.id);
        let id = sphereMesh.id;
        //
        sphereMesh.computeWorldMatrix(true);
        let sphereBounding = sphereMesh.getBoundingInfo().boundingBox;
        let sphereSizes = sphereMesh.getHierarchyBoundingVectors();

        // Add a dynamic rigid body to go with the sphere collider.
        let sphereRigidDesc = this._physics.RigidBodyDesc.dynamic();

        // Move the rigid body instead of the collider, when applicable.
        sphereRigidDesc.setTranslation(sphereSizes.min.x + sphereSizes.max.x, sphereSizes.min.y + sphereSizes.max.y, sphereSizes.min.z + sphereSizes.max.z);

        let sphereRigidBody = this.world.createRigidBody(sphereRigidDesc);
        let sphereColliderDesc = this._physics.ColliderDesc.ball(
            Math.max(sphereBounding.extendSize.x, sphereBounding.extendSize.y, sphereBounding.extendSize.z)
        );
        sphereColliderDesc.setDensity(5);
        sphereColliderDesc.setRestitution(0.8); // A little bouncy.
        let sphereCollider = this.world.createCollider(sphereColliderDesc, sphereRigidBody);

        //
        this.colliders.set(id, sphereCollider);
        this.rigidBodies.set(id, sphereRigidBody);
        this.meshes.set(id, sphereMesh);
    }

    update() {
        this.world.step();

        //this.debug();

        // move
        this.rigidBodies.forEach((rb: RigidBody, id) => {
            let mesh = this.meshes.get(id);
            let sphereCollider = this.colliders.get(id);

            if (mesh.position.y < -10) {
                rb.setTranslation({ x: 0, y: 4, z: 0 }, false);
            }

            //console.log("[PHYSICS] updating rigid body", id);
            let position = rb.translation();
            mesh.setAbsolutePosition(new Vector3(position.x, position.y, position.z));

            //
            let sRotation = sphereCollider.rotation(); // Quaternion
            this.meshes.get(id).rotationQuaternion = new Quaternion(sRotation.x, sRotation.y, sRotation.z, sRotation.w);
        });
    }
}
