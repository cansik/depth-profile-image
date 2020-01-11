import {ThreeJsContext} from "./ThreeJsContext";
import * as THREE from "three";

export class ProfileViewer {
    private readonly context = new ThreeJsContext();

    private maxDepth = 5.0;
    private pointSize = 5.0;
    private pointSpace = 0.01;

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
            const scene = this.context.addScene(sceneElement);

            // read attributes
            let colorImageUrl = sceneElement.getAttribute("data-color");
            let depthImageUrl = sceneElement.getAttribute("data-depth");

            // add test element
            /*
            let geometry = new THREE.BoxGeometry(1, 1, 1);
            let material = new THREE.MeshBasicMaterial({color: 0xFF1f3f});
            let cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
             */

            scene.add(this.createDepthFromImage(colorImageUrl, depthImageUrl));
        }
    }

    private createDepthFromImage(colorImageUrl: string, depthImageUrl: string): THREE.Points {
        const planeWidth = 480;
        const planeHeight = 640;

        const geometry = new THREE.BufferGeometry();
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
                pointSize: {value: this.pointSize},
                maxDepth: {value: this.maxDepth},

                depthMap: {value: new THREE.TextureLoader().load(depthImageUrl)},
                colorMap: {value: new THREE.TextureLoader().load(colorImageUrl)},
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            alphaTest: 0.9
        });

        return new THREE.Points(geometry, material);
    }
}
