interface ILoadingScreen {
    //What happens when loading starts
    displayLoadingUI: () => void;
    //What happens when loading stops
    hideLoadingUI: () => void;
    //default loader support. Optional!
    loadingUIBackgroundColor: string;
    loadingUIText: string;
}

class LoadingController implements ILoadingScreen {
    //optional, but needed due to interface definitions
    public loadingUIBackgroundColor: string;
    public loadingScreenDiv;
    public loadingScreenTxt;
    public loadingTextDetailsTxt;

    constructor(public loadingUIText: string) {
        this.loadingScreenDiv = window.document.getElementById("loadingScreen");
        this.loadingScreenTxt = window.document.getElementById("loadingText");
        this.loadingTextDetailsTxt = window.document.getElementById("loadingTextDetails");
    }

    public displayLoadingUI() {
        this.loadingScreenDiv.style.display = "block";
        this.loadingScreenTxt.innerHTML = "Loading Assets...";
    }

    public hideLoadingUI() {
        this.loadingScreenDiv.style.display = "none";
    }

    public updateLoadingMessage(msg) {
        this.loadingScreenTxt.innerHTML = msg;
    }
}

export { LoadingController, ILoadingScreen };
