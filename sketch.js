let capture = null;
let tracker = null;
let positions = null;
let w = 0, h = 0;
let snowflakes = [];
let snowStopped = true;
let lastDetectedEye1 = null;
let lastDetectedEye2 = null;
let irisColor = (0, 0, 0);

let headBoundary = { centerX: 0, centerY: 0, radius: 0 };

// Fade-in variables
let fadeInTime = 6; // Time in seconds for the fade-in
let fadeStartTime = null; // Store when the fade-in starts

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
  noStroke();

  fadeStartTime = millis(); // Start the fade effect from the beginning
}

function draw() {
  background(0);
  translate(w, 0);
  scale(-1.0, 1.0);
  positions = tracker.getCurrentPosition();

  let t = frameCount / 60; // 60 frames per sec
  if (t < 5) { // Stop snow after 5 seconds
    snowStopped = false;
  }

  if (!snowStopped) { // If snow is still falling
    for (let i = 0; i < random(5); i++) { // Add a new snowflake randomly
      snowflakes.push(new snowflake());
    }
  }

  let eye1 = null;
  let eye2 = null;

  if (positions.length > 0) {
    // Update last detected positions
    eye1 = {
      outline: [23, 63, 24, 64, 25, 65, 26, 66].map(getPoint),
      center: getPoint(27),
      top: getPoint(24),
      bottom: getPoint(26),
    };

    eye2 = {
      outline: [28, 67, 29, 68, 30, 69, 31, 70].map(getPoint),
      center: getPoint(32),
      top: getPoint(29),
      bottom: getPoint(31),
    };

    lastDetectedEye1 = eye1;
    lastDetectedEye2 = eye2;
  } else if (lastDetectedEye1 && lastDetectedEye2) {
    // Use last detected positions
    eye1 = lastDetectedEye1;
    eye2 = lastDetectedEye2;
  }

  if (eye1 && eye2) {
    const eye2OffsetX = 200; 
    eye2.outline = eye2.outline.map(p => createVector(p.x + eye2OffsetX, p.y));
    eye2.center = createVector(eye2.center.x + eye2OffsetX, eye2.center.y);
    eye2.top = createVector(eye2.top.x + eye2OffsetX, eye2.top.y);
    eye2.bottom = createVector(eye2.bottom.x + eye2OffsetX, eye2.bottom.y);

    // Draw snowflakes first, so they are behind the eyes
    for (let flake of snowflakes) {
      flake.update(t);
      flake.display();
    }

    // Draw the head (without eyes) so snowflakes are visible on top of the head
    drawHeadWithoutEyes(eye1, eye2);

    // Now draw the eyes and the iris on top of the head (which will cover any snowflakes in the eye area)
    drawHeadWithEyes(eye1, eye2, color(0, 0, 0));
  }
}

function getPoint(index) {
  return createVector(positions[index][0], positions[index][1]);
}

function drawHeadWithoutEyes(eye1, eye2) {
  const centerX = (eye1.center.x + eye2.center.x) / 2;
  const centerY = (eye1.center.y + eye2.center.y) / 2;
  const distance = dist(eye1.center.x, eye1.center.y, eye2.center.x, eye2.center.y);
  const headRadius = distance * 1.5;

  // Update global boundary for the head
  headBoundary = { centerX, centerY, radius: headRadius / 2 };

  // Draw the head with transparency (no fill for color, full transparency)
  noStroke();
  fill(0, 0); // Transparent fill (the second parameter is alpha)
  ellipse(centerX, centerY, headRadius, headRadius);
}

function drawHeadWithEyes(eye1, eye2, irisColor) {
  const centerX = (eye1.center.x + eye2.center.x) / 2;
  const centerY = (eye1.center.y + eye2.center.y) / 2;
  const distance = dist(eye1.center.x, eye1.center.y, eye2.center.x, eye2.center.y);
  const headRadius = distance * 1.5;

  // Draw the eyes and the iris on top of the head
  drawEye(eye1, irisColor);
  drawEye(eye2, irisColor);
}

function drawEye(eye, irisColor) {
  const irisRadius = min(eye.center.dist(eye.top), eye.center.dist(eye.bottom));
  const irisSize = irisRadius * 10;

  const auraPadding = 60;
  const auraSize = irisSize + auraPadding;

  noStroke();

  // Calculate how much time has passed since the start of the fade-in
  let fadeProgress = (millis() - fadeStartTime) / (fadeInTime * 1000);

  // Cap fadeProgress to 1 (max transparency)
  fadeProgress = constrain(fadeProgress, 0, 1);

  // Set the alpha based on the fade progress
  for (let i = 10; i > 0; i--) {
    const distance = i * 30;
    const alpha = map(i, 50, 1, 3, 1);
    fill(0, 0, 255, alpha * fadeProgress / 150); // Apply fade-in effect here
    ellipse(eye.center.x, eye.center.y, auraSize + distance, auraSize + distance);
  }

  // Draw the iris with the calculated fade progress
  fill(irisColor.levels[0], irisColor.levels[1], irisColor.levels[2], fadeProgress * 255);
  ellipse(eye.center.x, eye.center.y, irisSize, irisSize);

  // Draw a small white pupil at the center of the iris with full opacity
  const pupilSize = irisSize / 8;
  fill(255); // White color for the pupil
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

class snowflake {
  constructor() {
    this.posX = random(width);
    this.posY = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(5, 10);
    this.radius = sqrt(random(pow(width / 2, 2)));
    this.velocityX = random(-0.5, 0.5); // Horizontal velocity
    this.velocityY = pow(this.size, 0.5); // Vertical velocity (gravity)
  }

  update(time) {
    let angle = this.initialangle + time * 0.6;
    this.posX += this.velocityX;
    this.posY += this.velocityY;

    // Check for collision with the head
    let dx = this.posX - headBoundary.centerX;
    let dy = this.posY - headBoundary.centerY;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance < headBoundary.radius) {
      // Deflect the snowflake slightly while keeping gravity
      let angle = atan2(dy, dx);
      let deflection = 1.5; // Deflection multiplier

      this.posX += cos(angle) * deflection;
      this.posY += sin(angle) * deflection;

      // Keep gravity pulling down
      this.velocityY += 0.05; // Gravity effect

      // If snowflake moves too far, deflect back to avoid stuck in place
      if (this.posX < 0) this.posX = 0;
      if (this.posX > width) this.posX = width;
    }

    // Remove snowflakes that fall off the screen
    if (this.posY > height) {
      let index = snowflakes.indexOf(this);
      snowflakes.splice(index, 1);
    }
  }

  display() {
    fill(50, 50);
    ellipse(this.posX, this.posY, this.size);
  }
}
