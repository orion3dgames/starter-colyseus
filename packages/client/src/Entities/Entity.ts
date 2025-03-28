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
import { NavMeshController } from "../Controllers/NavMeshController";
import { CrowdAgent } from "recast-navigation";

export class Entity extends TransformNode {
    public _camera: CameraController;
    public _engine: Engine;
    public _game: GameController;
    public _interface: InterfaceController;
    public _input: InputController;
    public _nameplate: NameplateController;
    public _navmesh: NavMeshController;
    public _movement: MoveController;
    public _mesh: MeshController;
    public _room: Room;
    public _shadow: ShadowGenerator;

    // entities
    public _entities;
    public _schema; // colyseus schema

    // mesh
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

    public _agent: CrowdAgent;
    color: any;

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
        this._navmesh = gameScene._navmesh;
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

        // current player only controllers
        if (isCurrentPlayer) {
            this._camera = new CameraController(scene);
            this._input = new InputController(this);
            this._interface.setCurrentPlayer(this);
        }

        // spawn player
        this._mesh.spawnCapsule();
        //this._mesh.spawnCharacter();

        // update from server
        gameScene.$(this._schema).onChange((test) => {
            let debug = {
                x: this._schema.x,
                y: this._schema.y,
                z: this._schema.z,
                rot: this._schema.rot,
                sequence: this._schema.sequence,
            };

            //console.table(debug);

            // // update player data from server data
            Object.assign(this, this._schema);

            // // set default position
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
        this._movement.update();

        // update only for current player
        if (this.isCurrentPlayer) {
            this._camera.update(this);
        }
    }

    public updateServerRate() {
        // update only for current player
        if (this.isCurrentPlayer) {
            // update entity movement
            this._input.update();
            this._interface.update();
        }
    }

    public delete() {
        if (this._mesh.entityMesh) {
            this._mesh.entityMesh.dispose();
            this._mesh.fakeShadow.dispose();
        }
        if (this.nameplateMesh) {
            this.nameplateMesh.dispose();
        }
    }
}
