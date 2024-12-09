let video, classifier, faceapi;
let boxes = [];
let trained = false;
const imgSize = 64;
let opacity = 0;
const fadeSpeed = 2;
const centerX = width / 2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initVideo();
  initFaceDetector();
  initFaceClassifier();
  frameRate(30);
}

function draw() {
  background(0);
  light();
  scale(-1, 1);
}

function light() {
  if (boxes.length > 0) {
    opacity = min(opacity + fadeSpeed, 255);
  } else {
    opacity = max(opacity - fadeSpeed, 0);
  }

  if (boxes.length > 0) {
    let face = boxes[0];

    for (let x = 0; x < width; x += 5) {
      for (let y = 0; y < height; y += 5) {
        let distance = dist(x, y, face.x + face.width, face.y + face.height);
        let maxDistance = width / 4;
        let intensity = map(distance, 0, maxDistance, 255, 0);

        let r = map(intensity, 0, 255, 0, 255);
        let g = map(intensity, 0, 255, 5, 255);
        let b = map(intensity, 0, 255, 5, 255);

        fill(r, g, b, opacity);
        noStroke();
        rect(x, y, 10, 10);
      }
    }
  }
}

function initVideo() {
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
}

function initFaceClassifier() {
  let options = {
    inputs: [imgSize, imgSize, 4],
    task: 'imageClassification',
    debug: true,
  };
  classifier = ml5.neuralNetwork(options);
}

function initFaceDetector() {
  const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false,
  };

  faceapi = ml5.faceApi(video, detectionOptions, () => {
    detectFace();
  });
}

function detectFace() {
  faceapi.detect((err, results) => {
    if (err) return console.error(err);

    boxes = [];
    if (results && results.length > 0) {
      boxes = getBoxes(results);
      if (trained) {
        for (let i = 0; i < boxes.length; i++) {
          const box = boxes[i];
          classifyFace(box);
        }
      }
    }
    detectFace();
  });
}

function getBoxes(detections) {
  const boxes = [];
  for (let i = 0; i < detections.length; i++) {
    const alignedRect = detections[i].alignedRect;

    const box = {
      x: alignedRect._box._x,
      y: alignedRect._box._y,
      width: alignedRect._box._width,
      height: alignedRect._box._height,
      label: "",
    };
    boxes.push(box);
  }

  return boxes;
}

function classifyFace(box) {
  const img = get(box.x, box.y, box.width, box.height);
  img.resize(imgSize, imgSize);
  let inputImage = { image: img };
  classifier.classify(inputImage, (error, results) => {
    if (error) return console.error(error);

    box.label = results[0].label;
  });
}