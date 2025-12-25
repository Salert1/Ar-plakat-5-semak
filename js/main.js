import * as THREE from 'three';
import {GLTFLoader} from 'GLTFLoader';

const video = document.getElementById('video');

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    video.srcObject = stream;
    console.log("Камера запущена (задняя)");
  } catch (err) {
    console.error("Не удалось запустить камеру:", err);
    alert("Ошибка камеры: " + err.message);
  }
}

startCamera();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);


let mixer = null;
const clock = new THREE.Clock();

const loader = new GLTFLoader();
loader.load(
  './js/model_reklama.glb',
  (gltf) => {
	console.log('МОДЕЛЬ ЗАГРУЖЕНА!');
    console.log('Объект:', gltf.scene);
    console.log('Анимации:', gltf.animations);
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); 
    scene.add(model);

    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error('Ошибка загрузки 3D-модели:', error);
    alert('Не удалось загрузить 3D-модель. Проверьте файл model.glb.');
  }
);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

window.addEventListener('click', () => {
  window.open('https://porscherussia.ru/', '_blank');
});


function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  if (!mixer && scene.children.length > 0) {
    scene.children[0].rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
