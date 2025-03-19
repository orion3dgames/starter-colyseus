import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { TextBlock, Rectangle, Control } from "@babylonjs/gui/2D";
import { countPlayers, roundTo } from "../../Utils/Utils";
import { Entity } from "../../Entities/Entity";
import { InterfaceController } from "../InterfaceController";
import { Room } from "colyseus.js";

export class DebugBox {
    private _engine: Engine;
    private _scene: Scene;
    private _room: Room;
    private _entity: Entity;
    private _ui: InterfaceController;

    private _debugTextUI;

    constructor(playerUI: InterfaceController, entity: Entity) {
        this._ui = playerUI;
        this._engine = playerUI._game.engine;
        this._scene = playerUI._scene;
        this._entity = entity;
        this._room = playerUI._room;

        // create UI
        this._createUI();
    }

    _createUI() {
        let debugPanel = new Rectangle("panel-debugBox");
        debugPanel.top = "15px";
        debugPanel.left = "-15px";
        debugPanel.width = "200px;";
        debugPanel.height = "300px;";
        debugPanel.background = "rgba(0,0,0,.5)";
        debugPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._ui._mainLayer.addControl(debugPanel);

        const debugText = new TextBlock("debugText", "");
        debugText.color = "#FFF";
        debugText.top = "5px";
        debugText.left = "5px";
        debugText.fontSize = "12px;";
        debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        debugPanel.addControl(debugText);

        this._debugTextUI = debugText;
    }

    // debug panel refresh
    public update() {
        let debugData = {
            totalPlayers: countPlayers(this._scene.getMeshByName("player")),
            roomId: this._room.roomId,
            sessionId: this._entity.sessionId,
            name: this._entity.name,
            totalEntities: 0,
            fps: this._engine.getFps(),
            ping: this._ui.ping,
            x: roundTo(this._entity.position.x, 2),
            y: roundTo(this._entity.position.y, 2),
            z: roundTo(this._entity.position.z, 2),
            rotY: roundTo(this._entity.rotation.y, 2),
            seq: this._entity.sequence,
            speed: this._entity.speed,
            debug: this._entity._game.activateServerMovement,
        };

        let debugText = "";
        for (let i in debugData) {
            debugText += i + ": " + debugData[i] + " \n";
        }

        this._debugTextUI.text = debugText;
    }
}
