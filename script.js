import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 1. SCENE SETUP ---
const scene = new THREE.Scene();
// Arid, dusty atmosphere (Fog to simulate Rajasthan haze)
scene.background = new THREE.Color(0xd2b48c); 
scene.fog = new THREE.FogExp2(0xd2b48c, 0.005);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Harsh sun shadows
document.body.appendChild(renderer.domElement);

// --- 2. LIGHTING (Harsh Jodhpur Sun) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Bright ambient
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5); // Intense white/yellow sun
sunLight.position.set(50, 100, 50); // Midday angle
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -60;
sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60;
sunLight.shadow.camera.bottom = -60;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// --- 3. PROCEDURAL TERRAIN & BOUNDARIES ---

// 3.1 Ground (Dry Dirt)
const groundGeo = new THREE.PlaneGeometry(300, 300);
const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0xA08A6C, 
    roughness: 1.0,
    bumpScale: 0.05
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 3.2 Boundary Wall (Red Line) - We create a rectangular wall with gaps for gates
const wallHeight = 2.5;
const wallThickness = 0.5;
const wallMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9, bumpScale: 0.1 });

// Dimensions: Approx 60m x 40m based on the map scale
const boundaryWidth = 60;
const boundaryDepth = 40;

// Build walls with gates (using separate boxes to leave gaps)
function createWallSegment(width, depth, x, z) {
    const geo = new THREE.BoxGeometry(width, wallHeight, depth);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, wallHeight / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Front Wall (South) - Leaving gap for Gate 1 (Front Gate)
createWallSegment(20, wallThickness, -20, -boundaryDepth/2); // Left of gate
createWallSegment(20, wallThickness, 20, -boundaryDepth/2);  // Right of gate
// Note: The gap is between x=-10 and x=10 for the gate

// Back Wall (North) - Leaving gap for Gate 2 (Back Gate)
createWallSegment(20, wallThickness, -20, boundaryDepth/2); 
createWallSegment(20, wallThickness, 20, boundaryDepth/2);  

// Left Wall (West)
createWallSegment(wallThickness, boundaryDepth, -boundaryWidth/2, 0);

// Right Wall (East) - Adjacent to Black Residential Houses
createWallSegment(wallThickness, boundaryDepth, boundaryWidth/2, 0);

// 3.3 Gates (Yellow Circles) - Rusty Iron Gates
const gateMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, metalness: 0.8, roughness: 0.7 });
// Front Gate (Gate 1) - South
const gate1Geo = new THREE.BoxGeometry(8, wallHeight, 0.2);
const gate1 = new THREE.Mesh(gate1Geo, gateMat);
gate1.position.set(0, wallHeight/2, -boundaryDepth/2);
gate1.castShadow = true;
scene.add(gate1);

// Back Gate (Gate 2) - North
const gate2Geo = new THREE.BoxGeometry(8, wallHeight, 0.2);
const gate2 = new THREE.Mesh(gate2Geo, gateMat);
gate2.position.set(0, wallHeight/2, boundaryDepth/2);
gate2.castShadow = true;
scene.add(gate2);

// 3.4 The Open-Roofed Funeral Hut (Black Brick) - Just inside Gate 1
const hutMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });
// Pillars
const pillarGeo = new THREE.BoxGeometry(0.5, 3, 0.5);
const pillar1 = new THREE.Mesh(pillarGeo, hutMat);
pillar1.position.set(-3, 1.5, -boundaryDepth/2 + 3);
pillar1.castShadow = true;
scene.add(pillar1);

const pillar2 = new THREE.Mesh(pillarGeo, hutMat);
pillar2.position.set(3, 1.5, -boundaryDepth/2 + 3);
pillar2.castShadow = true;
scene.add(pillar2);

// Roof (Concrete slab)
const roofGeo = new THREE.BoxGeometry(8, 0.3, 6);
const roofMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
const roof = new THREE.Mesh(roofGeo, roofMat);
roof.position.set(0, 3, -boundaryDepth/2 + 3);
roof.castShadow = true;
roof.receiveShadow = true;
scene.add(roof);

// 3.5 Trees (Green Line) - Neem Trees along the central path
function createTree(x, z) {
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;
    scene.add(trunk);

    // Canopy
    const canopyGeo = new THREE.SphereGeometry(2.5, 8, 8);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(x, 3.5, z);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    scene.add(canopy);
}

// Place trees along the central path (Green line from Map 1)
for (let i = -20; i <= 20; i += 5) {
    if (i !== 0) { // Avoid the exact center
        createTree(i, 5);   // Left side of path
        createTree(i, -5);  // Right side of path
    }
}

// 3.6 Graves (White Marks) - Scattered white mounds
const graveMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
function createGrave(x, z) {
    const graveGeo = new THREE.BoxGeometry(1.5, 0.5, 3);
    const grave = new THREE.Mesh(graveGeo, graveMat);
    grave.position.set(x, 0.25, z);
    grave.rotation.y = Math.random() * Math.PI; // Random orientation
    grave.castShadow = true;
    grave.receiveShadow = true;
    scene.add(grave);
}

// Generate clusters of graves in the western/central zones (White marks)
for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 40; 
    const z = (Math.random() - 0.5) * 25;
    // Keep them inside the boundary and away from the exact center path
    if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        createGrave(x, z);
    }
}

// 3.7 Residential Houses (Black Marks) - Outside East Wall
const houseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
for (let i = 0; i < 5; i++) {
    const houseGeo = new THREE.BoxGeometry(8, 6, 10);
    const house = new THREE.Mesh(houseGeo, houseMat);
    // Positioned outside the right boundary wall (East side)
    house.position.set(boundaryWidth/2 + 6, 3, -20 + i * 10);
    house.castShadow = true;
    house.receiveShadow = true;
    scene.add(house);
}

// 3.8 White SUV (Gate 2 / Back Gate) - Inside the gate
const suvBodyGeo = new THREE.BoxGeometry(2, 1.5, 4.5);
const suvMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.4 });
const suv = new THREE.Mesh(suvBodyGeo, suvMat);
suv.position.set(4, 0.75, boundaryDepth/2 - 5); // Parked inside the back gate
suv.castShadow = true;
scene.add(suv);
// SUV Roof/Cabin
const suvRoofGeo = new THREE.BoxGeometry(1.8, 0.8, 2.5);
const suvRoof = new THREE.Mesh(suvRoofGeo, suvMat);
suvRoof.position.set(4, 1.8, boundaryDepth/2 - 5);
suvRoof.castShadow = true;
scene.add(suvRoof);

// --- 4. FIRST-PERSON CONTROLS & COLLISION ---
const controls = new PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');
const crosshair = document.getElementById('crosshair');

blocker.addEventListener('click', () => controls.lock());

controls.addEventListener('lock', () => {
    blocker.style.display = 'none';
    crosshair.style.display = 'block';
});

controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
    crosshair.style.display = 'none';
});

scene.add(controls.getObject());

// Player Movement
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = { w: false, a: false, s: false, d: false };

document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyD': keys.d = true; break;
        case 'ShiftLeft': velocity.multiplyScalar(1.5); break; 
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyD': keys.d = false; break;
        case 'ShiftLeft': velocity.multiplyScalar(0.66); break;
    }
});

// Collision Boundaries (Approximated from the map)
const collidables = [
    // Outer Walls
    { minX: -30, maxX: 30, minZ: -20.5, maxZ: -19.5 }, // Front Wall
    { minX: -30, maxX: 30, minZ: 19.5, maxZ: 20.5 },   // Back Wall
    { minX: -30.5, maxX: -29.5, minZ: -20, maxZ: 20 }, // Left Wall
    { minX: 29.5, maxX: 30.5, minZ: -20, maxZ: 20 },   // Right Wall
    // Hut Pillars
    { minX: -3.3, maxX: -2.7, minZ: -17.3, maxZ: -16.7 },
    { minX: 2.7, maxX: 3.3, minZ: -17.3, maxZ: -16.7 },
    // Parked SUV
    { minX: 3, maxX: 5, minZ: 14, maxZ: 16 }
];

function checkCollision(newPos) {
    for (let box of collidables) {
        if (newPos.x > box.minX && newPos.x < box.maxX &&
            newPos.z > box.minZ && newPos.z < box.maxZ) {
            return true; 
        }
    }
    return false;
}

// --- 5. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    if (controls.isLocked === true) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys.w) - Number(keys.s);
        direction.x = Number(keys.d) - Number(keys.a);
        direction.normalize();

        if (keys.w || keys.s) velocity.z -= direction.z * 400.0 * delta;
        if (keys.a || keys.d) velocity.x -= direction.x * 400.0 * delta;

        const newPosX = controls.getObject().position.x - (velocity.x * delta);
        const newPosZ = controls.getObject().position.z - (velocity.z * delta);

        // Collision checking for X axis
        if (!checkCollision({ x: newPosX, z: controls.getObject().position.z })) {
            controls.getObject().position.x = newPosX;
        }
        // Collision checking for Z axis
        if (!checkCollision({ x: controls.getObject().position.x, z: newPosZ })) {
            controls.getObject().position.z = newPosZ;
        }

        // Keep eye level at 1.7 meters
        controls.getObject().position.y = 1.7; 
    }

    renderer.render(scene, camera);
}

animate();

// --- 6. RESIZE HANDLING ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
