import { Entity } from "../../Entities/Entity";
import { InterfaceController } from "../InterfaceController";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Button } from "@babylonjs/gui/2D/controls/button";
import Debugger from "../../Utils/Debugger";

export class NavmeshBox {
    private _ui: InterfaceController;

    constructor(playerUI: InterfaceController, entity: Entity) {
        this._ui = playerUI;

        // create UI
        this._createUI();
    }

    _createUI() {
        var panel = new StackPanel("navmeshcontrols");
        panel.width = "220px";
        panel.left = "15px;";
        panel.top = "50px;";
        panel.background = "#222";
        panel.isVisible = false;
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        panel.isPointerBlocker = true;
        this._ui._mainLayer.addControl(panel);

        //////////////////////////////
        const showButton = Button.CreateSimpleButton("simpleButton", "TOGGLE NAVMESH");
        showButton.width = "200px;";
        showButton.height = "30px";
        showButton.top = "15px;";
        showButton.left = "15px;";
        showButton.color = "white";
        showButton.background = "#000";
        showButton.thickness = 1;
        showButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        showButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._ui._mainLayer.addControl(showButton);
        showButton.onPointerDownObservable.add(() => {
            panel.isVisible = !panel.isVisible;
        });

        ///
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

            let maximum = settings[s] > 0 ? settings[s] * 4 : 1;

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
            for (let s in newSettings) {
                let control = this._ui._mainLayer.getControlByName("debugText" + s) as TextBlock;
                control.text = s + ": " + newSettings[s];

                let slider = this._ui._mainLayer.getControlByName(s) as Slider;
                slider.value = newSettings[s];
            }
            Debugger.log("RECAST", "navmesh setting reset", newSettings);
            this._ui.currentPlayer._navmesh.clearNavmesh();
        });

        //////////////////////////////
        const exportButton = Button.CreateSimpleButton("simpleButton", "EXPORT");
        exportButton.width = "200px;";
        exportButton.height = "30px";
        exportButton.color = "white";
        exportButton.background = "#000";
        exportButton.thickness = 1;
        exportButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        exportButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(exportButton);

        exportButton.onPointerDownObservable.add(() => {
            this._ui.currentPlayer._navmesh.export();
        });

        //////////////////////////////
        const importButton = Button.CreateSimpleButton("simpleButton", "IMPORT");
        importButton.width = "200px;";
        importButton.height = "30px";
        importButton.color = "white";
        importButton.background = "#000";
        importButton.thickness = 1;
        importButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        importButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(importButton);

        importButton.onPointerDownObservable.add(() => {
            this._ui.currentPlayer._navmesh.import();
        });
    }

    // debug panel refresh
    public update() {}
}
