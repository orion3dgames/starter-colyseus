import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import {
    AssetsManager,
    BinaryFileAssetTask,
    ContainerAssetTask,
    CubeTextureAssetTask,
    HDRCubeTextureAssetTask,
    ImageAssetTask,
    MeshAssetTask,
    TextFileAssetTask,
    TextureAssetTask,
} from "@babylonjs/core/Misc/assetsManager";
import { GameController } from "./GameController";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

type AssetEntry = {
    key: string;
    filename: string;
    extension: string;
    type: string;
    instantiate?: boolean;
};

export class AssetsController {
    private _game: GameController;
    private _assetsManager: AssetsManager;
    private _loadingTxt;

    private assetDatabase: AssetEntry[] = [];
    private assetToPreload: AssetEntry[] = [];

    public allMeshes;

    constructor(game, shadow) {
        this._game = game;

        //
        this._loadingTxt = window.document.getElementById("loadingTextDetails");

        // Assets manager
        this._assetsManager = new AssetsManager(this._game.scene);

        // set list of assets
        this.assetDatabase = [
            // music
            { key: "PLAYER_01", filename: "skeleton_01.glb", extension: "glb", type: "mesh", instantiate: true },
        ];
    }

    public async preloadAssets() {
        let assetLoaded: any[] = [];
        this.assetToPreload.forEach((obj) => {
            let assetTask;
            switch (obj.extension) {
                case "png":
                case "jpg":
                case "jpeg":
                case "gif":
                    if (obj.type === "texture") {
                        assetTask = this._assetsManager.addTextureTask(obj.key, "./textures/" + obj.filename);
                    } else if (obj.type === "image") {
                        assetTask = this._assetsManager.addImageTask(obj.key, "./images/" + obj.filename);
                    }
                    break;

                case "dds":
                    assetTask = this._assetsManager.addCubeTextureTask(obj.key, "./images/" + obj.filename);
                    break;

                case "hdr":
                    assetTask = this._assetsManager.addHDRCubeTextureTask(obj.key, "./images/" + obj.filename, 512);
                    break;

                case "mp3":
                case "wav":
                    assetTask = this._assetsManager.addBinaryFileTask(obj.key, "./sounds/" + obj.filename);
                    break;

                case "babylon":
                case "gltf":
                case "glb":
                case "obj":
                    if (obj.instantiate) {
                        assetTask = this._assetsManager.addContainerTask(obj.key, "", "", "./models/" + obj.filename);
                    } else {
                        assetTask = this._assetsManager.addMeshTask(obj.key, "", "", "./models/" + obj.filename);
                    }
                    break;

                case "json":
                case "txt":
                    assetTask = this._assetsManager.addTextFileTask(obj.key, "./data/" + obj.filename);
                    break;

                default:
                    console.error('Error loading asset "' + obj.key + '". Unrecognized file extension "' + obj.extension + '"');
                    break;
            }

            assetTask.onSuccess = (task) => {
                switch (task.constructor) {
                    case TextureAssetTask:
                    case CubeTextureAssetTask:
                    case HDRCubeTextureAssetTask:
                        assetLoaded[task.name] = task.texture;
                        break;
                    case ImageAssetTask:
                        assetLoaded[task.name] = task.url;
                        break;
                    case BinaryFileAssetTask:
                        assetLoaded[task.name] = task.data;
                        break;
                    case ContainerAssetTask:
                        assetLoaded[task.name] = task.loadedContainer;
                        break;
                    case MeshAssetTask:
                        assetLoaded[task.name] = task;
                        break;
                    case TextFileAssetTask:
                        assetLoaded[task.name] = task.text;
                        break;
                    default:
                        console.error('Error loading asset "' + task.name + '". Unrecognized AssetManager task type.');
                        break;
                }
            };

            assetTask.onError = (task, message, exception) => {
                console.log(message, exception);
            };
        });

        this._assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
            let loadingMsg = (((totalCount - remainingCount) / totalCount) * 100).toFixed(0) + "%";
            this.showLoadingMessage(loadingMsg);
        };

        this._assetsManager.onFinish = () => {
            console.log("[ASSETS] loading complete", assetLoaded);
            for (let i in assetLoaded) {
                this._game._loadedAssets[i] = assetLoaded[i];
            }
            this.showLoadingMessage("100%");
        };

        await this._assetsManager.loadAsync();
    }

    public async loadLevel() {
        this.assetToPreload = this.assetDatabase;
        console.log(this.assetToPreload);
        await this.preloadAssets();
    }

    private showLoadingMessage(msg) {
        if (this._loadingTxt) {
            this._loadingTxt.innerHTML = msg;
        }
    }
}
