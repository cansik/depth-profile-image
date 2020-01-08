import {ThreeViewController} from "./ThreeViewController";

export class ProfileViewer {
    private readonly threeView = new ThreeViewController();
    private isDebug = ProfileViewer.getIsDebug();

    public run() {
        // show cloud id
        console.log("cloud viewer initialisation...");

        // setup
        this.threeView.setup(this.isDebug);
        this.setupEventHandler();
    }

    private setupEventHandler() {

    }

    private static getIsDebug(): boolean {
        let debugString = ProfileViewer.getUrlParameter("debug");
        return debugString !== ''
    }

    private static getUrlParameter(name: string): string {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        let results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
}
