import RAPIER from "@dimforge/rapier3d-compat-simd";

export class PhysicsController {
    public _physics: typeof RAPIER;

    public gravity = { x: 0.0, y: -9.81, z: 0.0 };
    public world;
    public rigidBody;

    constructor() {}

    async init() {
        await RAPIER.init();
        this._physics = RAPIER;
        console.log("[PHYSICS] rapier initialized", this._physics);

        this.world = new this._physics.World(this.gravity);
        console.log("[PHYSICS] rapier world initialized", this.world);
    }

    addMesh(mesh) {}

    update() {
        this.world.step();
    }
}
