import * as THREE from 'three';
import {BufferGeometry, Math, ShaderMaterial, Vector3} from 'three';
// @ts-ignore
// @ts-ignore
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {CloudColor} from './CloudColor';
import Timeout = NodeJS.Timeout;

let Stats = require('three/examples/jsm/libs/stats.module.js');

export class ThreeViewController {
    public readonly canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    private readonly renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000);
    private readonly controls = new OrbitControls(this.camera, this.renderer.domElement);
    private readonly stats = Stats.default();
    private readonly loader = new DRACOLoader();
    private readonly raycaster = new THREE.Raycaster();

    public color = new CloudColor();

    public scale = new Vector3(-100.0, 100.0, 100.0);

    public rotateX = -90.0;
    public rotateY = 0.0;
    public rotateZ = -90.0;

    public rotationTimeoutTime = 1000 * 15;
    private rotationTimer: Timeout;

    // has to be down here
    private readonly material = this.createPointMaterial();

    private model: THREE.Points;

    constructor() {
        DRACOLoader.setDecoderPath('libs/draco/');
        this.loader.setVerbosity(1);
    }

    public setup(isDebug: boolean) {
        this.resetCamera();
        this.setupControls();
        this.scene.add(this.camera);

        this.setupCamera();

        // hack to save the state
        (this.controls as any).saveState();

        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setClearColor(new THREE.Color("rgb(22,22,22)"));

        // setup stats
        if (isDebug) {
            this.stats.showPanel(0);
            document.body.appendChild(this.stats.dom);
        }

        this.render();
    }

    public onInput() {
        this.controls.autoRotate = false;
        clearTimeout(this.rotationTimer);

        this.rotationTimer = setTimeout(() => {
            this.controls.autoRotate = true;
        }, this.rotationTimeoutTime)
    }

    public raycast(x: number, y: number): THREE.Intersection[] {
        this.raycaster.setFromCamera({x, y}, this.camera);
        return this.raycaster.intersectObject(this.model);
    }

    private setupControls() {
        this.controls.autoRotate = true;
        this.controls.enablePan = true;
        this.controls.enableDamping = true;
    }

    public setupCamera() {
        this.camera.position.set(350, 0, 0);
        this.camera.lookAt(0, 200, 0);
    }

    public resetCamera() {
        this.controls.reset();
    }

    public async loadDracoModel(url: string) {
        await this.loadDraco(url).then((geometry: BufferGeometry) => {
            console.log(geometry.attributes);
            this.scene.remove(this.model);

            this.model = new THREE.Points(geometry, this.material);
            this.calibrateModel(this.model);

            this.scene.add(this.model);
            this.resetCamera();

            console.log("model loaded!");
        });
    }

    private calibrateModel(model: THREE.Points) {
        model.scale.set(this.scale.x, this.scale.y, this.scale.z);
        model.rotateX(Math.degToRad(this.rotateX));
        model.rotateY(Math.degToRad(this.rotateY));
        model.rotateZ(Math.degToRad(this.rotateZ));
    }

    private adjustCanvasSize() {
        this.renderer.setSize(innerWidth, innerHeight);
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
        this.adjustCanvasSize();
    }

    private createPointMaterial(): ShaderMaterial {
        return new ShaderMaterial({
            uniforms: {
                pointSize: {value: 1.0},
                hueMin: {value: this.color.hueMin},
                hueMax: {value: this.color.hueMax},
                saturation: {value: this.color.saturation},
                brightness: {value: this.color.brightness},
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            transparent: true
        });
    }

    private animate() {
        this.stats.begin();

        // set uniforms
        this.material.uniforms.hueMin.value = this.color.hueMin;
        this.material.uniforms.hueMax.value = this.color.hueMax;
        this.material.uniforms.saturation.value = this.color.saturation;
        this.material.uniforms.brightness.value = this.color.brightness;

        this.controls.update();
        this.render();
        this.stats.end();
    }

    private loadDraco(url: string): Promise<BufferGeometry> {
        return new Promise(resolve => {
            this.loader.load(url, resolve);
        });
    }
}
