import {ThreeJsContext} from "./ThreeJsContext";
import * as THREE from "three";

export class ProfileViewer {
    private readonly context = new ThreeJsContext();

    private defaultMaxDepth = 4.0;
    private pointSize = 2.0;
    private pointSpace = 0.01;

    private startTime = Date.now();
    private time = 0.0;

    public run() {
        // show cloud id
        console.log("cloud viewer initialisation...");

        // setup scenes per profile
        this.setupProfileScenes();
    }

    private setupProfileScenes() {
        const sceneElements = document.getElementsByClassName("scene");
        for (let i = 0; i < sceneElements.length; i++) {
            const sceneElement = <HTMLElement>sceneElements.item(i);
            const scene = this.context.addScene(sceneElement, this.update.bind(this));

            // read attributes
            const colorImageUrl = sceneElement.getAttribute("data-color");
            const depthImageUrl = sceneElement.getAttribute("data-depth");

            const depth = sceneElement.hasAttribute("max-depth") ?
                parseFloat(sceneElement.getAttribute("max-depth")) : this.defaultMaxDepth;

            const geometry = this.createDepthFromImage(colorImageUrl, depthImageUrl, depth);
            scene.add(geometry);
        }
    }

    private createDepthFromImage(colorImageUrl: string, depthImageUrl: string, maxDepth: number): THREE.Points {
        const planeWidth = 240;
        const planeHeight = 320;

        const geometry = new THREE.BufferGeometry();
        geometry.name = "cloud";
        const positions = [];
        const textureCoordinates = [];

        for (let x = 0; x < planeWidth; x++) {
            for (let y = 0; y < planeHeight; y++) {
                // coordinates
                const vx = (x * this.pointSpace) - (planeWidth / 2 * this.pointSpace);
                const vy = (y * this.pointSpace) - (planeHeight / 2 * this.pointSpace);
                const vz = 0;
                positions.push(vx, vy, vz);

                // texture coordinates
                const tx = x / planeWidth;
                const ty = y / planeHeight;
                textureCoordinates.push(tx, ty);
            }
        }

        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.addAttribute('texcoord', new THREE.Float32BufferAttribute(textureCoordinates, 2));
        geometry.computeBoundingSphere();

        // add material to map
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: {type: "f", value: this.time},

                pointSize: {value: this.pointSize},
                maxDepth: {value: maxDepth},

                depthMap: {value: new THREE.TextureLoader().load(depthImageUrl)},
                colorMap: {value: new THREE.TextureLoader().load(colorImageUrl)},
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            alphaTest: 0.9
        });

        return new THREE.Points(geometry, material);
    }

    private update(scene: THREE.Scene) {
        const elapsedMilliseconds = Date.now() - this.startTime;
        this.time = elapsedMilliseconds / 1000.0;

        // update first element
        let obj = scene.children[0];

        if (obj == undefined) {
            console.log("obj is undefined");
            return;
        }

        let points = obj as THREE.Points;
        let material = points.material as THREE.ShaderMaterial;
        material.uniforms.time.value = this.time;
    }
}
