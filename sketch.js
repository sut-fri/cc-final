// let video, classifier, faceapi;
// let boxes = [];
// let trained = false;
// const imgSize = 64;
// let opacity = 0;
// const fadeSpeed = 2;
// const centerX = width / 2;

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   initVideo();
//   initFaceDetector();
//   initFaceClassifier();
//   frameRate(30);
// }

// function draw() {
//   background(0);
//   light();
//   scale(-1, 1);
// }

// function light() {
//   if (boxes.length > 0) {
//     opacity = min(opacity + fadeSpeed, 255);
//   } else {
//     opacity = max(opacity - fadeSpeed, 0);
//   }

//   if (boxes.length > 0) {
//     let face = boxes[0];

//     for (let x = 0; x < width; x += 5) {
//       for (let y = 0; y < height; y += 5) {
//         let distance = dist(x, y, face.x + face.width, face.y + face.height);
//         let maxDistance = width / 4;
//         let intensity = map(distance, 0, maxDistance, 255, 0);

//         let r = map(intensity, 0, 255, 0, 255);
//         let g = map(intensity, 0, 255, 5, 255);
//         let b = map(intensity, 0, 255, 5, 255);

//         fill(r, g, b, opacity);
//         noStroke();
//         rect(x, y, 10, 10);
//       }
//     }
//   }
// }

// function initVideo() {
//   video = createCapture(VIDEO);
//   video.size(width, height);
//   video.hide();
// }

// function initFaceClassifier() {
//   let options = {
//     inputs: [imgSize, imgSize, 4],
//     task: 'imageClassification',
//     debug: true,
//   };
//   classifier = ml5.neuralNetwork(options);
// }

// function initFaceDetector() {
//   const detectionOptions = {
//     withLandmarks: true,
//     withDescriptors: false,
//   };

//   faceapi = ml5.faceApi(video, detectionOptions, () => {
//     detectFace();
//   });
// }

// function detectFace() {
//   faceapi.detect((err, results) => {
//     if (err) return console.error(err);

//     boxes = [];
//     if (results && results.length > 0) {
//       boxes = getBoxes(results);
//       if (trained) {
//         for (let i = 0; i < boxes.length; i++) {
//           const box = boxes[i];
//           classifyFace(box);
//         }
//       }
//     }
//     detectFace();
//   });
// }

// function getBoxes(detections) {
//   const boxes = [];
//   for (let i = 0; i < detections.length; i++) {
//     const alignedRect = detections[i].alignedRect;

//     const box = {
//       x: alignedRect._box._x,
//       y: alignedRect._box._y,
//       width: alignedRect._box._width,
//       height: alignedRect._box._height,
//       label: "",
//     };
//     boxes.push(box);
//   }

//   return boxes;
// }

// function classifyFace(box) {
//   const img = get(box.x, box.y, box.width, box.height);
//   img.resize(imgSize, imgSize);
//   let inputImage = { image: img };
//   classifier.classify(inputImage, (error, results) => {
//     if (error) return console.error(error);

//     box.label = results[0].label;
//   });
// }


let capture = null;
let tracker = null;
let positions = null;
let w = 0, h = 0;

function setup() {
  w = windowWidth;
  h = windowHeight;
  capture = createCapture(VIDEO);
  createCanvas(w, h);
  capture.size(w, h);
  capture.hide();

  frameRate(5);
  colorMode(HSB);
  background(0);

  tracker = new clm.tracker();
  tracker.init();
  tracker.start(capture.elt);
}

function draw() {
  background(0);
  translate(w, 0);
  scale(-1.0, 1.0);
  positions = tracker.getCurrentPosition();

  if (positions.length > 0) {
    const eye1 = {
      outline: [23, 63, 24, 64, 25, 65, 26, 66].map(getPoint),
      center: getPoint(27),
      top: getPoint(24),
      bottom: getPoint(26)
    };
    const eye2 = {
      outline: [28, 67, 29, 68, 30, 69, 31, 70].map(getPoint),
      center: getPoint(32),
      top: getPoint(29),
      bottom: getPoint(31)
    }
    
    const irisColor = color(random(360), 80, 80, 0.4);
    drawEye(eye1, irisColor);
    drawEye(eye2, irisColor);
  }
}

function getPoint(index) {
  return createVector(positions[index][0], positions[index][1]);
}

// function drawEye(eye, irisColor) {
//   noFill();
//   stroke(255, 0.4);
  
//   const irisRadius = min(eye.center.dist(eye.top), eye.center.dist(eye.bottom));
//   const irisSize = irisRadius * 2;
//   noStroke();
//   fill(irisColor);
//   ellipse(eye.center.x, eye.center.y, irisSize, irisSize);
  
//   const pupilSize = irisSize / 3;
//   fill(0, 0.6);
//   ellipse(eye.center.x, eye.center.y, pupilSize, pupilSize);
// }


function timestampString() {
  return year() + nf(month(), 2) + nf(day(), 2) + "-" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
}

function windowResized() {
  w = windowWidth;
  h = windowHeight;
  resizeCanvas(w, h);
  background(0);
}