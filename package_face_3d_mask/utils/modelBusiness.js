// the scale of the 3d model
const initScale = 0.22;
// index of the track points of the face
const trackPointA = 168;
const trackPointB = 122;
const trackPointC = 351;
var camera, scene, renderer;
var mainModel;
var canvasWidth, canvasHeight;

function initThree(canvasId, 
    modelUrl,
    _canvasWidth,
    _canvasHeight) {
    canvasWidth = _canvasWidth;
    canvasHeight = _canvasHeight;

    var canvas_webgl = document.getElementById(canvasId);
    initScene(canvas_webgl);
    loadModel(modelUrl);
}

function initScene(canvas_webgl) {
    camera = new THREE.OrthographicCamera(1, 1, 1, 1, -1000, 1000);
    setSize();
    scene = new THREE.Scene();
    // ambient light
    scene.add(new THREE.AmbientLight(0xffffff));
    // direction light
    var directionallight = new THREE.DirectionalLight(0xffffff, 1);
    directionallight.position.set(0, 0, 1000);
    scene.add(directionallight);
    // init render
    renderer = new THREE.WebGLRenderer({
        canvas: canvas_webgl,
        antialias: true,
        alpha: true,
    });
    const devicePixelRatio = window.devicePixelRatio;
    console.log('device pixel ratio', devicePixelRatio);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);

    animate();
}

function loadModel(modelUrl) {
    var loader = new THREE.GLTFLoader();
    loader.load(modelUrl,
        function (gltf) {
            console.log('loadModel', 'success');
            var model = gltf.scene;
            model.scale.setScalar(initScale);
            // save model
            mainModel = model;
            scene.add(model);
        },
        null,
        function (error) {
            console.log('loadModel', error);
        });
}

function updateModel(modelUrl) {
    var loader = new THREE.GLTFLoader();
    loader.load(modelUrl,
        function (gltf) {
            console.log('updateModel', 'success');
            var model = gltf.scene;
            model.scale.setScalar(initScale);
            // remove old model
            scene.remove(mainModel);
            // save new model
            mainModel = model;
            // add new model
            scene.add(model);
        },
        null,
        function (error) {
            console.log('updateModel', error);
        });

}

function setSize() {
    const w = canvasWidth;
    const h = canvasHeight;
    camera.left = -0.5 * w;
    camera.right = 0.5 * w;
    camera.top = 0.5 * h;
    camera.bottom = -0.5 * h;
    camera.updateProjectionMatrix();
}

function setModel(prediction,
    _canvasWidth,
    _canvasHeight) {

    if (_canvasWidth !== canvasWidth) {
        canvasWidth = _canvasWidth;
        canvasHeight = _canvasHeight;
        setSize();
    }

    const result = calcTriangle(prediction,
        trackPointA,
        trackPointB,
        trackPointC);
    // console.log('calcTriangle', result);

    if (!mainModel) {
        console.log('setModel', '3d model is not loaded.');
        return;
    }
    mainModel.rotation.setFromRotationMatrix(
        result.rotation);
    mainModel.position.copy(result.position);
    mainModel.scale.setScalar(initScale * result.scale);

}

function getPosition(prediction, id) {
    var p = prediction.scaledMesh[id];
    var x = p[0] - 0.5 * canvasWidth;
    var y = 0.5 * canvasHeight - p[1];
    var z = p[2];
    return new THREE.Vector3(x, y, z);
}

function getScale(prediction, id1, id2) {
    var p1 = prediction.mesh[id1];
    var p1_scaled = prediction.scaledMesh[id1];
    var p2 = prediction.mesh[id2];
    var p2_scaled = prediction.scaledMesh[id2];

    var a = p2[0] - p1[0];
    var b = p2_scaled[0] - p1_scaled[0];
    return b / a;
}

function calcTriangle(prediction, id0, id1, id2) {
    var p0 = getPosition(prediction, id0);
    var p1 = getPosition(prediction, id1);
    var p2 = getPosition(prediction, id2);

    // position
    var triangle = new THREE.Triangle();
    triangle.set(p0, p1, p2);
    const center = new THREE.Vector3();
    triangle.getMidpoint(center);

    // rotation
    const rotation = new THREE.Matrix4();
    const x = p1.clone().sub(p2).normalize();
    const y = p1.clone().sub(p0).normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    const y2 = new THREE.Vector3().crossVectors(x, z).normalize();
    const z2 = new THREE.Vector3().crossVectors(x, y2).normalize();
    rotation.makeBasis(x, y2, z2);

    // scale
    var scale = getScale(prediction, id1, id2);

    return {
        position: center,
        rotation: rotation,
        scale: scale,
    };
}

function animate() {
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export {
    initThree,
    updateModel,
    setModel,
}