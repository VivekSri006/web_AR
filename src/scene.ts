import { createPlaneMarker } from "./objects/PlaneMarker";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { handleXRHitTest } from "./utils/hitTest";

import {
  AmbientLight,
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  XRFrame,
} from "three";

export function createScene(renderer: WebGLRenderer) {
  const scene = new Scene();

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20
  );

  const geometry = new BoxBufferGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometry, material);
  cube.position.z = -4;

  scene.add(cube);

  const ambientLight = new AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const gltfLoader = new GLTFLoader();
  let carModel: Object3D;
  gltfLoader.load("../assets/models/sports_car.glb", (gltf: GLTF) => {
    carModel = gltf.scene.children[0];
  });
  const planeMarker = createPlaneMarker();
  scene.add(planeMarker);
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  controller.addEventListener("select", onSelect);

  function onSelect() {
    if (planeMarker.visible) {
      const model = carModel.clone();

      model.position.setFromMatrixPosition(planeMarker.matrix);

      // Rotate the model randomly to give a bit of variation to the scene.
      model.rotation.y = Math.random() * (Math.PI * 2);
      model.visible = true;

      scene.add(model);
    }
  }
  const renderLoop = (timestamp: number, frame?: XRFrame) => {
    if (renderer.xr.isPresenting) {
      if (frame) {
        handleXRHitTest(
          renderer,
          frame,
          (hitPoseTransformed: Float32Array) => {
            if (hitPoseTransformed) {
              planeMarker.visible = true;
              planeMarker.matrix.fromArray(hitPoseTransformed);
            }
          },
          () => {
            planeMarker.visible = false;
          }
        );
      }
      renderer.render(scene, camera);
    }
  };

  renderer.setAnimationLoop(renderLoop);
}
