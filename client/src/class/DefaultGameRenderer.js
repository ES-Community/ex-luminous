// Require Node.js Dependencies
const events = require("events");

// Require Third-party Dependencies
const THREE = require("three");

// Require Internal Dependencies
const Input = require("./Input.js");

class DefaultGameRenderer extends events {
  constructor() {
    super();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.currentScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

    document.body.appendChild(this.renderer.domElement);
    this.input = new Input(this.renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);

      this.input.update();
      this.emit("update");
      this.renderer.render(this.currentScene, this.camera);
    }

    this.resizeRenderer();
    animate();
    window.onresize = () => this.resizeRenderer();
  }

  cleanScene() {
    while (this.currentScene.children.length > 0) {
      this.currentScene.remove(this.currentScene.children[0]);
    }
  }

  resizeRenderer() {
    this.emit("resize");
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

module.exports = DefaultGameRenderer;
