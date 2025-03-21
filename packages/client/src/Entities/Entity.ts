import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import { MoveController } from "./Entity/MoveController";
import { GameController } from "src/Controllers/GameController";
import { NameplateController } from "./Entity/NameplateController";
import { InputController } from "./Entity/InputController";
import { CameraController } from "../Entities/Entity/CameraController";
import { InterfaceController } from "../Controllers/InterfaceController";

import { Room } from "colyseus.js";
import { MeshController } from "./Entity/MeshController";

export class Entity extends TransformNode {
    public _camera: CameraController;
    public _engine: Engine;
    public _game: GameController;
    public _interface: InterfaceController;
    public _input: InputController;
    public _nameplate: NameplateController;
    public _movement: MoveController;
    public _mesh: MeshController;
    public _room: Room;
    public _shadow: ShadowGenerator;

    // entities
    public _entities;
    public _schema; // colyseus schema

    // mesh
    public playerMesh: Mesh;
    public nameplateMesh: Mesh;

    // other properties
    public scale: number = 1;
    public isCurrentPlayer: boolean = false;

    // colyseus properties
    public sessionId: string = "";
    public name: string = "";
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public speed: number = 0.5;
    public turnSpeed = 0.1; // Rotation speed
    public rot: number = 0;
    public sequence: number = 0;

    constructor(name: string, scene: Scene, gameScene: GameScene, schema, isCurrentPlayer = false) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._engine = gameScene._engine;
        this._room = gameScene.room;
        this._game = gameScene._game;
        this._interface = gameScene._interface;
        this._shadow = gameScene._shadow;
        this._entities = gameScene.entities;
        this._schema = schema;
        this.isCurrentPlayer = isCurrentPlayer;
        this.sessionId = name;

        // set entity
        Object.assign(this, schema);

        // set initial position & roation
        this.position = new Vector3(this.x, this.y, this.z);
        this.rotation = new Vector3(0, this.rot, 0);

        // controllers
        this._movement = new MoveController(this);
        this._nameplate = new NameplateController(this);
        this._mesh = new MeshController(this);

        // if current player
        if (isCurrentPlayer) {
            this._camera = new CameraController(scene);
            this._camera.createFollowCamera(this._scene, this);
            this._input = new InputController(this);
            this._interface.setCurrentPlayer(this);
        }

        // spawn player
        this._mesh.spawn();

        // update from server
        gameScene.$(this._schema).onChange((test) => {
            let debug = {
                x: this._schema.x,
                y: this._schema.y,
                z: this._schema.z,
                rot: this._schema.rot,
                sequence: this._schema.sequence,
            };

            console.table(debug);

            // update player data from server data
            Object.assign(this, this._schema);

            // set default position
            this._movement.setPositionAndRotation(this._schema); // set next default position from server entity

            // do server reconciliation on client if current player only & not blocked
            if (this.isCurrentPlayer) {
                this._movement.reconcileMove(this._schema.sequence); // set default entity position
            }
        });

        // show entity label
        this.nameplateMesh = this._nameplate.addNamePlate();
    }

    public update(delta: number) {
        // update entity movement
        this._movement.update();

        // update only for current player
        if (this.isCurrentPlayer) {
            this._camera.update();
            this._input.update();
        }
    }

    public updateServerRate() {
        // update only for current player
        if (this.isCurrentPlayer) {
            this._interface.update();
        }
    }

    public delete() {
        if (this.playerMesh) {
            this.playerMesh.dispose();
        }
        if (this.nameplateMesh) {
            this.nameplateMesh.dispose();
        }
    }
}
