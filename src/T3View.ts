import * as THREE from "three";
// @ts-ignore
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export class T3View {
    public readonly canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    private readonly renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
    private readonly scenes = Array<THREE.Scene>();

    constructor() {
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.animate();
    }

    public add(sceneElement: HTMLElement) {
        // read infos
        let colorImage = sceneElement.getAttribute("data-color");
        let depthImage = sceneElement.getAttribute("data-depth");

        // create scene
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
        let controls = new OrbitControls(camera, sceneElement);
        controls.minDistance = 2;
        controls.maxDistance = 5;
        controls.enablePan = false;
        controls.enableZoom = false;

        // setup user data
        scene.userData.element = sceneElement;
        scene.userData.camera = camera;
        scene.userData.controls = controls;

        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        let cube = new THREE.Mesh(geometry, material);

        scene.add(cube);

        this.scenes.push(scene);
    }

    updateSize() {
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.renderer.setSize(width, height, false);
        }
    }

    animate() {
        this.render();
        requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        this.updateSize();

        this.canvas.style.transform = `translateY(${window.scrollY}px)`;

        this.renderer.setClearColor(0xffffff);
        this.renderer.setScissorTest(false);
        this.renderer.clear();

        this.renderer.setClearColor(0xe0e0e0);
        this.renderer.setScissorTest(true);

        this.scenes.forEach(scene => {
            let element = scene.userData.element;

            // get its position relative to the page's viewport
            let rect = element.getBoundingClientRect();

            // check if it's offscreen. If so skip it
            if (rect.bottom < 0 || rect.top > this.renderer.domElement.clientHeight ||
                rect.right < 0 || rect.left > this.renderer.domElement.clientWidth) {
                return; // it's off screen
            }

            // set the viewport
            let width = rect.right - rect.left;
            let height = rect.bottom - rect.top;
            let left = rect.left;
            let bottom = this.renderer.domElement.clientHeight - rect.bottom;

            this.renderer.setViewport(left, bottom, width, height);
            this.renderer.setScissor(left, bottom, width, height);

            let camera = scene.userData.camera;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            scene.userData.controls.update();

            this.renderer.render(scene, camera);
        });

    }
}