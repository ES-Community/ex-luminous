// Require Node.js Dependencies
const events = require("events");

// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const Input = require("./Input.js");
const Audio = require("./Audio.js");

class DefaultGameRenderer extends events {
  constructor() {
    super();

    this.isInitialized = false;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    document.body.appendChild(this.renderer.domElement);
    this.audio = new Audio();
    this.input = new Input(this.renderer.domElement);
  }

  init(currentScene = new THREE.Scene(), camera) {
    if (!(camera instanceof THREE.Camera)) {
      throw new TypeError("camera must be an Object that extend from THREE.Camera");
    }
    if (this.isInitialized) {
      return;
    }
    this.currentScene = currentScene;
    this.isInitialized = true;
    this.camera = camera;

    const animate = () => {
      requestAnimationFrame(animate);

      this.input.update();
      this.emit("update");
      this.renderer.render(this.currentScene, this.camera);
    }

    animate();
    this.resizeRenderer();
    window.onresize = () => this.resizeRenderer();
  }

  switchScene(newScene) {
    this.cleanCurrentScene();
    this.currentScene = newScene;
  }

  cleanCurrentScene() {
    if (!this.isInitialized) {
      return;
    }

    while (this.currentScene.children.length > 0) {
      this.currentScene.remove(this.currentScene.children[0]);
    }
  }

  resizeRenderer() {
    if (!this.isInitialized) {
      return;
    }

    this.emit("resize");
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

module.exports = DefaultGameRenderer;
