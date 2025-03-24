import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Entity } from "../../Entities/Entity";
import { InterfaceController } from "../InterfaceController";
import { Room } from "colyseus.js";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Button } from "@babylonjs/gui/2D/controls/button";

export class NavmeshBox {
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
        var panel = new StackPanel("navmeshcontrols");
        panel.width = "220px";
        panel.left = "15px;";
        panel.top = "15px;";
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        panel.isPointerBlocker = true;
        this._ui._mainLayer.addControl(panel);

        const settings = this._ui.currentPlayer._navmesh.getDefaultConfig();

        let newSettings = { ...settings };

        for (let s in settings) {
            const debugText = new TextBlock("debugText" + s, s + ": " + settings[s]);
            debugText.color = "#FFF";
            debugText.top = "5px";
            debugText.left = "5px";
            debugText.fontSize = "12px;";
            debugText.height = "15px";
            debugText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            debugText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            panel.addControl(debugText);

            let maximum = settings[s] > 0 ? settings[s] * 2 : 1;

            var slider = new Slider(s);
            slider.minimum = 0;
            slider.maximum = maximum;
            slider.value = settings[s];
            slider.isVertical = false;
            slider.height = "20px";
            slider.width = "200px";
            slider.onValueChangedObservable.add((value) => {
                let control = this._ui._mainLayer.getControlByName("debugText" + s) as TextBlock;
                newSettings[s] = value;
                control.text = s + ": " + value;
            });
            panel.addControl(slider);
        }

        const simpleButton = Button.CreateSimpleButton("simpleButton", "GENERATE");
        simpleButton.width = "200px;";
        simpleButton.height = "30px";
        simpleButton.color = "white";
        simpleButton.background = "#000";
        simpleButton.thickness = 1;
        simpleButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        simpleButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(simpleButton);

        simpleButton.onPointerDownObservable.add(() => {
            this._ui.currentPlayer._navmesh.regenerate(newSettings);
        });

        //////////////////////////////
        const resetButton = Button.CreateSimpleButton("simpleButton", "RESET");
        resetButton.width = "200px;";
        resetButton.height = "30px";
        resetButton.color = "white";
        resetButton.background = "#000";
        resetButton.thickness = 1;
        resetButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        resetButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(resetButton);

        resetButton.onPointerDownObservable.add(() => {
            newSettings = this._ui.currentPlayer._navmesh.getDefaultConfig();
            for (let s in settings) {
                let control = this._ui._mainLayer.getControlByName("debugText" + s) as TextBlock;
                control.text = s + ": " + settings[s];

                let slider = this._ui._mainLayer.getControlByName(s) as Slider;
                slider.value = settings[s];
            }
        });
    }

    // debug panel refresh
    public update() {}
}
