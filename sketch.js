
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

  frameRate(30);
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
    };
    
    const eye2OffsetX = 200; 
    eye2.outline = eye2.outline.map(p => createVector(p.x + eye2OffsetX, p.y));
    eye2.center = createVector(eye2.center.x + eye2OffsetX, eye2.center.y);
    eye2.top = createVector(eye2.top.x + eye2OffsetX, eye2.top.y);
    eye2.bottom = createVector(eye2.bottom.x + eye2OffsetX, eye2.bottom.y);
    
    const irisColor = color(0, 0, 0);
    drawEye(eye1, irisColor);
    drawEye(eye2, irisColor);
  }
}


function getPoint(index) {
  return createVector(positions[index][0], positions[index][1]);
}

function drawEye(eye, irisColor) {
  // Calculate iris size
  const irisRadius = min(eye.center.dist(eye.top), eye.center.dist(eye.bottom));
  const irisSize = irisRadius * 5;

  // Draw the glowing aura
  noStroke();
  for (let i = 10; i > 0; i--) { // Fewer layers for spaced-out aura
    const distance = i * 30; // Increased distance for a larger aura radius
    const alpha = map(i, 50, 1, 3, 1); // Weaker opacity for a subtle effect
    fill(0, 0, 255, alpha / 200); // aura needs to chsnge based on text
    ellipse(eye.center.x, eye.center.y, irisSize + distance, irisSize + distance);
  }

  // noStroke();

  // // Define base color and set a color range for smoother transitions
  // let baseColor = color(0, 30, 100); // Starting color of the aura
  // let targetColor = color(0, 100, 255); // End color of the aura (bluer or lighter)

  // for (let i = 10; i > 0; i--) {
  //   const distance = i * 20; // Increase distance for larger aura radius
  //   const alpha = map(i, 10, 1, 30, 5); // Smooth opacity transition, higher initial alpha

  //   // Interpolate between base and target color based on the loop index (i)
  //   let lerpedColor = lerpColor(baseColor, targetColor, map(i, 10, 1, 0, 1));

  //   // Use the interpolated color with smooth alpha blending
  //   fill(red(lerpedColor), green(lerpedColor), blue(lerpedColor), alpha); 

  //   // Draw the ellipse to create the aura effect
  //   ellipse(eye.center.x, eye.center.y, irisSize + distance, irisSize + distance);
  // }


  // Draw the iris
  fill(irisColor);
  ellipse(eye.center.x, eye.center.y, irisSize, irisSize);

  // Draw the pupil
  const pupilSize = irisSize / 8;
  fill(255);
  ellipse(eye.center.x, eye.center.y, pupilSize, pupilSize);
}








function timestampString() {
  return year() + nf(month(), 2) + nf(day(), 2) + "-" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
}

function windowResized() {
  w = windowWidth;
  h = windowHeight;
  resizeCanvas(w, h);
  background(0);
}