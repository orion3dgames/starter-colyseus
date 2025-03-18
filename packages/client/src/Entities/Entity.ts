import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { MoveController } from "./Entity/MoveController";
import { GameController } from "src/Controllers/GameController";
import { NameplateController } from "./Entity/NameplateController";
import { InputController } from "./Entity/InputController";
import { CameraController } from "../Entities/Entity/CameraController";
import { InterfaceController } from "../Controllers/InterfaceController";

export class Entity extends TransformNode {
    public _camera: CameraController;
    public _engine: Engine;
    public _game: GameController;
    public _room;
    public _shadow;
    public _interface: InterfaceController;
    public _input: InputController;
    public _nameplate: NameplateController;
    public _movement: MoveController;

    // entities
    public _entities;
    public _entity;

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
    public speed: number = 1;
    public turnSpeed = 0.1; // Rotation speed
    public rot: number = 0;
    public sequence: number = 0;

    constructor(name: string, scene: Scene, gameScene: GameScene, entity, isCurrentPlayer = false) {
        super(name, scene);

        // set variables
        this._scene = scene;
        this._engine = gameScene._engine;
        this._room = gameScene.room;
        this._game = gameScene._game;
        this._interface = gameScene._interface;
        this._shadow = gameScene._shadow;
        this._entities = gameScene.entities;
        this._entity = entity;
        this.isCurrentPlayer = isCurrentPlayer;
        this.sessionId = name;

        // set entity
        Object.assign(this, entity);

        // set initial position & roation
        this.position = new Vector3(entity.x, entity.y, entity.z);
        this.rotation = new Vector3(0, entity.rot, 0);

        // spawn player
        this.spawn();

        // move controller
        this._movement = new MoveController(this);
        this._nameplate = new NameplateController(this);

        // if current player
        if (isCurrentPlayer) {
            this._input = new InputController(this);
            this._camera = new CameraController(scene);
            this._camera.createUniversalCamera(this._scene);
            this._interface.setCurrentPlayer(this);
        }

        // update from server
        gameScene.$(this._entity).onChange((test) => {
            console.log("[SERVER UPDATE]", this._entity);

            // update player data from server data
            Object.assign(this, this._entity);

            // set default position
            this._movement.setPositionAndRotation(entity); // set next default position from server entity

            // do server reconciliation on client if current player only & not blocked
            if (this.isCurrentPlayer) {
                this._movement.reconcileMove(this._entity.sequence); // set default entity position
            }
        });

        // show entity label
        this.nameplateMesh = this._nameplate.addNamePlate();
    }

    public spawn() {
        // square
        let boxSize = 1;
        //const box = MeshBuilder.CreateCapsule("box", { height: boxSize, radius: boxSize / 4 }, this._scene);
        const box = MeshBuilder.CreateBox("box", { height: boxSize, width: boxSize }, this._scene);
        box.position = new Vector3(0, boxSize / 2, 0);
        const material = new StandardMaterial("box-material", this._scene);
        material.diffuseColor = Color3.FromHexString("#FFFFFF");
        material.specularColor = Color3.Black();
        box.material = material;
        box.parent = this;
        this.playerMesh = box;

        // add player shadow
        this._shadow.addShadowCaster(box);
    }

    public update(delta: number) {
        // update entity movement
        this._movement.update();

        // update only for current player
        if (this.isCurrentPlayer) {
            this._input.update();
            this._camera.tween(this);
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
