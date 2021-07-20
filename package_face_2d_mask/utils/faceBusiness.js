const detectionConfidence = 0.8;
const maxFaces = 1;
var model;

async function loadModel() {
  model = await facemesh.load(
    {
      shouldLoadIrisModel: false,
      detectionConfidence: detectionConfidence,
      maxFaces: maxFaces,
    });
  console.log('facemesh model is loaded.');
}

async function detect(frame,flipCamera) {
  if (!model) {
    console.log('facemesh model has not been loaded.');
    return;
  }
  var start = new Date();
  const predictions = await model.estimateFaces(frame,
    false
  );
  var end = new Date() - start;
  console.log('detect', end, 'ms');

  return { prediction: predictions[0],end };
}

export { loadModel, detect };