import { Behavior } from "@babylonjs/core/Behaviors/behavior";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";

export interface CameraShakeOptions {
    shakePattern?: "perlin" | "sin";

    amplitude?: number | Vector3;
    frequency?: number | Vector3;
    frequencyOffset?: number;

    rotation?: number | Vector3;
    rotationFrequency?: number | Vector3;
    rotationOffset?: number;

    speed?: number;
    influence?: number;

    onBeforeUpdate?: (
        targetValues: Pick<CameraShakeOptions, "amplitude" | "frequency" | "rotation" | "rotationFrequency">
    ) => Pick<CameraShakeOptions, "amplitude" | "frequency" | "rotation" | "rotationFrequency">;
}

const defaultCameraShakeOptions: Required<Omit<CameraShakeOptions, "onBeforeUpdate">> = {
    shakePattern: "perlin",

    amplitude: 0,
    frequency: 0,
    frequencyOffset: Math.random(),

    rotation: 0,
    rotationFrequency: 0,
    rotationOffset: Math.random(),

    speed: 1,
    influence: 1,
};

export class CameraShake implements Behavior<TransformNode> {
    public readonly name = "CameraShake";
    public isEnable = true;
    public options: CameraShakeOptions = defaultCameraShakeOptions;

    private target: Nullable<TransformNode> = null;
    private parent: Nullable<TransformNode> = null;
    private beforeRenderObserver: Nullable<Observer<Scene>> = null;
    private perlin = new Perlin();

    constructor(options: CameraShakeOptions = defaultCameraShakeOptions) {
        this.options = options;

        // pass all default values from defaultCameraShakeOptions if they are not set in options
        for (const key in defaultCameraShakeOptions) {
            const optionsKey = key as keyof CameraShakeOptions;

            if (this.options[optionsKey] === undefined) {
                // @ts-ignore
                this.options[optionsKey] = defaultCameraShakeOptions[optionsKey];
            }
        }
    }

    public init(): void {}

    public attach(target: TransformNode): void {
        this.target = target;

        this.parent = new TransformNode("shakeParent");
        this.parent.position = this.target.position.clone();
        this.parent.parent = this.target.parent;
        this.target.parent = this.parent;

        this.beforeRenderObserver = this.target.getScene().onBeforeRenderObservable.add(() => {
            if (this.isEnable) {
                this.shake();
            }
        });
    }

    public detach(): void {
        if (this.target && this.parent && this.beforeRenderObserver) {
            this.target.parent = null;
            this.parent.dispose();
            this.parent = null;
        }

        if (this.target && this.beforeRenderObserver) {
            this.target.getScene().onBeforeRenderObservable.remove(this.beforeRenderObserver);
            this.beforeRenderObserver = null;
        }
    }

    private shake(): void {
        if (!this.target || !this.parent) {
            return;
        }

        const speed = this.options.speed ?? defaultCameraShakeOptions.speed ?? 1;

        const shakePatternFunc = this.options.shakePattern === "perlin" ? this.perlin.noise1D.bind(this.perlin) : Math.sin;

        const time = (Date.now() / 1000) * speed;

        this.shakePosition(time, shakePatternFunc);
        this.shakeRotation(time, shakePatternFunc);
    }

    private shakePosition(time: number, shakePatternFunc: (x: number) => number): void {
        if (!this.target || !this.parent) {
            return;
        }

        const amplitude = this.getValueAsVector(this.options.amplitude);
        if (amplitude.length() === 0) {
            return;
        } // No need to calculate if amplitude is zero

        const frequency = this.getValueAsVector(this.options.frequency);
        const frequencyOffset = this.options.frequencyOffset || defaultCameraShakeOptions.frequencyOffset || 0;
        const influence = this.options.influence ?? defaultCameraShakeOptions.influence ?? 1;

        const x = amplitude.x * (shakePatternFunc((frequency.x + frequencyOffset) * time) * 0.5 + 0.5) * influence;
        const y = amplitude.y * (shakePatternFunc((frequency.y + frequencyOffset) * time) * 0.5 + 0.5) * influence;
        const z = amplitude.z * (shakePatternFunc((frequency.z + frequencyOffset) * time) * 0.5 + 0.5) * influence;

        const left = this.target.getDirection(Vector3.Left());
        const up = this.target.getDirection(Vector3.Up());
        const forward = this.target.getDirection(Vector3.Forward());

        const offsetX = left.scale(x - amplitude.x * 0.5);
        const offsetY = up.scale(y - amplitude.y * 0.5);
        const offsetZ = forward.scale(z - amplitude.z * 0.5);

        const offset = offsetX.add(offsetY).add(offsetZ);
        this.parent.position = this.target.position.clone().add(offset);
    }

    private shakeRotation(time: number, shakePatternFunc: (x: number) => number): void {
        if (!this.target || !this.parent) {
            return;
        }

        const rotation = this.getValueAsVector(this.options.rotation);
        if (rotation.length() === 0) {
            return;
        } // No need to calculate if rotation is zero

        const frequency = this.getValueAsVector(this.options.frequency);
        const rotationFrequency = this.getValueAsVector(this.options.rotationFrequency);
        const rotationOffset = this.options.rotationOffset || defaultCameraShakeOptions.rotationOffset || 0;
        const influence = this.options.influence ?? defaultCameraShakeOptions.influence ?? 1;

        const x = rotation.x * shakePatternFunc((frequency.x + rotationFrequency.x + rotationOffset) * time) * influence;
        const y = rotation.y * shakePatternFunc((frequency.y + rotationFrequency.y + rotationOffset) * time) * influence;
        const z = rotation.z * shakePatternFunc((frequency.z + rotationFrequency.z + rotationOffset) * time) * influence;

        const left = this.target.getDirection(Vector3.Left());
        const up = this.target.getDirection(Vector3.Up());
        const forward = this.target.getDirection(Vector3.Forward());

        const quaternionX = Quaternion.RotationAxis(left, x);
        const quaternionY = Quaternion.RotationAxis(up, y);
        const quaternionZ = Quaternion.RotationAxis(forward, z);

        const finalQuaternion = quaternionX.multiply(quaternionY).multiply(quaternionZ);

        this.parent.rotation = finalQuaternion.toEulerAngles();
    }

    private getValueAsVector(value?: number | Vector3): Vector3 {
        if (!value) {
            return Vector3.Zero();
        }

        return value instanceof Vector3 ? value : new Vector3(value, value, value);
    }
}

class Perlin {
    private readonly p: number[] = [];

    constructor() {
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }

        for (let i = 0; i < 256; i++) {
            const r = Math.floor(Math.random() * 256);
            const t = this.p[i];
            this.p[i] = this.p[r];
            this.p[r] = t;
        }

        this.p.push(...this.p);
    }

    public noise(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;

        return this.lerp(
            w,
            this.lerp(
                v,
                this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
                this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
            ),
            this.lerp(
                v,
                this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
            )
        );
    }

    public noise1D(x: number): number {
        return this.noise(x, x, x);
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}
