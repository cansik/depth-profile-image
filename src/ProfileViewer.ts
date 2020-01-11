import {ThreeJsContext} from "./ThreeJsContext";

export class ProfileViewer {
    private readonly threeView = new ThreeJsContext();

    public run() {
        // show cloud id
        console.log("cloud viewer initialisation...");

        // setup scenes per profile
        this.setupProfileScenes();
    }

    private setupProfileScenes() {
        const sceneElements = document.getElementsByClassName("scene");
        for (let i = 0; i < sceneElements.length; i++) {
            const e = <HTMLElement>sceneElements.item(i);
            this.threeView.add(e);
        }
    }
}
