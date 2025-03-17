import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { PlayerInput } from "./Entity/PlayerInput";
import { PlayerCamera } from "../Controllers/PlayerCamera";
import { PlayerUI } from "../Controllers/PlayerUI";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameScene } from "../Scenes/GameScene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MoveController } from "./Entity/MoveController";
import { GameController } from "src/Controllers/GameController";

export class Entity extends TransformNode {
    public _camera: PlayerCamera;
    public _engine: Engine;
    public _input: PlayerInput;
    public _game: GameController;
    public _entity;
    public _room;
    public _shadow;
    public _ui: PlayerUI;
    public playerMesh: Mesh;
    public isCurrentPlayer;
    public tile;
    public characterLabel;
    public moveController: MoveController;
    public _entities;

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
        this._ui = gameScene._ui;
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
        this.moveController = new MoveController(this);

        // if current player
        if (isCurrentPlayer) {
            this._input = new PlayerInput(this);
            this._camera = new PlayerCamera(scene);
            this._camera.createUniversalCamera(this._scene);
            this._ui.setCurrentPlayer(this);
        }

        // update from server
        gameScene.$(this._entity).onChange((test) => {
            // update player data from server data
            Object.assign(this, this._entity);

            // set default position
            this.moveController.setPositionAndRotation(entity); // set next default position from server entity

            // do server reconciliation on client if current player only & not blocked
            if (this.isCurrentPlayer) {
                //this.moveController.reconcileMove(this._entity.sequence); // set default entity position
            }
        });

        // show entoty label
        this.characterLabel = this._ui.createEntityLabel(this);
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
        this.moveController.update();

        // only for current player
        if (this.isCurrentPlayer) {
            this._ui.update();
            this._camera.tween(this);
            this._input.update();
        }
    }

    public updateServerRate() {}

    public delete() {
        if (this.playerMesh) {
            this.playerMesh.dispose();
        }
        if (this.characterLabel) {
            this.characterLabel.dispose();
        }
    }
}
