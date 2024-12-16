let capture = null;
let tracker = null;
let positions = null;
let randomNumbers = [];
let nums = true;
let lastDetectedEye1 = null;
let lastDetectedEye2 = null;
let irisColor = [0, 0, 0];
let headBoundary = { centerX: 0, centerY: 0, radius: 0 };
let fadeInTime = 6;
let fadeStartTime = null;
let audio;
let musicAudio;
let audioStarted = false;
let musicAudioStarted = false;
let audioEnded = false;
let text1 = "the inter-you";
let text2 = "click anywhere to log on";
let text3 = "rest ur animal fingers\nhelp ur inter-self squash these bugs...\nw/ ur weary eyes";
let currentIndex1 = 0;
let currentIndex2 = 0;
let currentIndex3 = 0;
let typingSpeed1 = 100;
let typingSpeed2 = 50;
let typingSpeed3 = 100;
let startTime1 = null;
let startTime2 = null;
let startTime3 = null;
let delayAfterFirstText = 1000;
let gameStarted = false;
let textDisplayed = false;
let timerStarted = false;
let startTimerTime = 0;
let audioStarted3 = false;
let gameStartTime = null;
let boxWidth = null;

function preload() {
  audio = loadSound('keys.mp3');
  musicAudio = loadSound('music.mp3');
  popAudio = loadSound('pop.mp3');
}

function setup() {
  w = displayWidth;
  h = displayHeight;
  capture = createCapture(VIDEO); // camera feed
  createCanvas(w, h);  
  capture.size(w, h); // camera feed = canavs size
  capture.hide(); // hides camera feed
  frameRate(30);
  colorMode(HSB);
  background(0);
  tracker = new clm.tracker(); // face tracker
  tracker.init(); // defult tracker
  tracker.start(capture.elt); // video capture
  noStroke();
  fadeStartTime = millis(); // track time
  if (!audioStarted) { // check if the audio has already started
    audio.loop();
    audio.setVolume(0.3);
    audioStarted = true;
  }
}

function draw() {
  if (!gameStarted) { // check if the game hasn't started
    showTitleScreen(); // title screen if so
  } else {
    if (gameStartTime === null) { // check if the game start time is not set
      gameStartTime = millis(); // set the start time to current time
    }
    background(0);
    translate(w, 0);
    scale(-1.0, 1.0); // mirrors canvas horizontally
    positions = tracker.getCurrentPosition(); // finds face position
    let elapsedGameTime = (millis() - gameStartTime) / 1000; // finds elapsed time in milisec
    if (elapsedGameTime < 5) nums = false; // keep nums falling for the first 5 sec
    if (!nums) { // if the nums hasn't stopped
      for (let i = 0; i < random(5); i++) { // randomly gen nums
        randomNumbers.push(new RandomNumber());  // add new random number of nums
      }
    }
    let eye1 = null;
    let eye2 = null;
    if (positions.length > 0) { // if detected facial features detected
      eye1 = {
        outline: [23, 63, 24, 64, 25, 65, 26, 66].map(getPoint),  // eye data
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
      lastDetectedEye1 = eye1; // last eye1 position
      lastDetectedEye2 = eye2; // last eye2 position
    } else if (lastDetectedEye1 && lastDetectedEye2) { // if no new eye data, use their last places
      eye1 = lastDetectedEye1;
      eye2 = lastDetectedEye2;
    }
    if (eye1 && eye2) { // if both eyes are seen
      const eye2OffsetX = w * 0.2; // offset eye2s X position
      eye2.outline = eye2.outline.map(p => createVector(p.x + eye2OffsetX, p.y)); // apply offset to eye2's outline
      eye2.center = createVector(eye2.center.x + eye2OffsetX, eye2.center.y); // apply offset to eye2's center
      eye2.top = createVector(eye2.top.x + eye2OffsetX, eye2.top.y); // apply offset to eye2's top 
      eye2.bottom = createVector(eye2.bottom.x + eye2OffsetX, eye2.bottom.y); // apply offset to eye 2's bottom
      for (let num of randomNumbers) { // for each nums
        num.update(elapsedGameTime); // update nums
        num.display();
      }
      drawHeadWithoutEyes(eye1, eye2); // draws head w/out eyes
      drawHeadWithEyes(eye1, eye2, color(0, 0, 0)); // draws head w eyes
    }
    if (timerStarted && millis() - startTimerTime >= 3000 && !textDisplayed) { // if 3 secs passed
      displayNewText();
    }
  }
}

function showTitleScreen() {
  background(0);
  if (startTime1 === null) startTime1 = millis(); // if startTime1 is not set, it = current time
  let elapsedTime1 = millis() - startTime1;  // Calculate the elapsed time since startTime1
  if (elapsedTime1 >= currentIndex1 * typingSpeed1 && currentIndex1 < text1.length && !audioStarted) { // varrify audio start
    audio.play();
    audio.setVolume(0.3);
    audioStarted = true;
  }
  if (elapsedTime1 >= currentIndex1 * typingSpeed1 && currentIndex1 < text1.length) currentIndex1++; // typing effect for text1
  if (elapsedTime1 >= text1.length * typingSpeed1 + delayAfterFirstText && startTime2 === null) startTime2 = millis(); // if text1 is finished, start timing text2
  let elapsedTime2 = millis() - startTime2; // passed time of startTime2
  if (startTime2 !== null && elapsedTime2 >= currentIndex2 * typingSpeed2 && currentIndex2 < text2.length) currentIndex2++; // typing effect for text2
  textSize(50);
  textAlign(CENTER, CENTER);
  fill(120, 255, 120); // green
  textFont("monospace");
  text(text1.substring(0, currentIndex1), w / 2, h / 2);
  textSize(30);
  text(text2.substring(0, currentIndex2), w / 2, h / 2 + h / 4);
  if (currentIndex2 === text2.length && !audioEnded) { // text2 finished and audio hasn't ended
    audio.stop();
    audioEnded = true;
    timerStarted = true;
    startTimerTime = millis();
    startTime3 = millis();
  }
}

function mousePressed() {
  if (!gameStarted) { // check if the game hasn't started
    if (currentIndex2 === text2.length) { // check if the text2 is done
      gameStarted = true;
      if (!audioStarted) { // start typing audio
        audio.loop();
        audio.setVolume(0.3);
        audioStarted = true;
      }
      if (!musicAudioStarted) {  // starts music
        musicAudio.loop();
        musicAudio.play();
        musicAudio.setVolume(0.5);
        musicAudioStarted = true;
      }
    }
  }
  if (!startText3 && currentIndex2 === text2.length) { // If text2 is done and text3 hasn't started
    startText3 = true; // start text3
    if (startTime3 === null) {
      startTime3 = millis(); // make startTime3 = current time
    }
  }
}

function displayNewText() {
  if (startTime3 === null) {
    startTime3 = millis(); // startTime3= current time
  }
  let elapsedTime3 = millis() - startTime3; // time since start of startTime3
  if (elapsedTime3 >= currentIndex3 * typingSpeed3 && currentIndex3 < text3.length) { // determines if it's time to show text3
    currentIndex3++;
  }
  if (elapsedTime3 >= currentIndex3 * typingSpeed3 && !audioStarted3 && currentIndex3 < text3.length) { // play typing sound
    audio.play();
    audio.setVolume(0.3);
    audioStarted3 = true;
  }
  let currentText = text3.substring(0, currentIndex3);
  let topPadding = 80;
  let bottomPadding = 30;
  let textHeightVal = 50;
  let widthPadding = 80;
  if (boxWidth === null) {
    boxWidth = (textWidth(text3) + widthPadding * 2) * 0.5; // set box width based on text
  }
  fill(0);
  stroke(120, 255, 120); // green
  strokeWeight(2);
  rect(w / 2 - boxWidth / 2, h / 2 + h / 4 - textHeightVal / 2 - topPadding, boxWidth, textHeightVal + topPadding + bottomPadding);
  textSize(20);
  noStroke();
  textAlign(CENTER, BOTTOM);
  fill(120, 255, 120); // green
  textFont("monospace");
  push();
  scale(-1, 1); // flip horizontally
  text(currentText, -w / 2, h / 2 + h / 4); // current portion of text3
  pop();
}

function getPoint(index) {
  return createVector(positions[index][0], positions[index][1]); // returns vector
}

function drawHeadWithoutEyes(eye1, eye2) {
  const centerX = (eye1.center.x + eye2.center.x) / 2; // x head center
  const centerY = (eye1.center.y + eye2.center.y) / 2; // y head center
  const distance = dist(eye1.center.x, eye1.center.y, eye2.center.x, eye2.center.y); // disttance of center to eyes
  const headRadius = distance * 1.5; // head radius = 1.5 times the distance between eyes
  headBoundary = { centerX, centerY, radius: headRadius / 2 }; // head boundary
  noStroke();
  fill(0, 0);
  ellipse(centerX, centerY, headRadius, headRadius);
}

function drawHeadWithEyes(eye1, eye2, irisColor) {
  drawEye(eye1, irisColor); // eye1
  drawEye(eye2, irisColor); // eye2
}


function drawEye(eye, irisColor) {
  const irisRadius = min(eye.center.dist(eye.top), eye.center.dist(eye.bottom)); // radius of the iris based on diamiter of eye
  const irisSize = irisRadius * 10; // iris = 10 times iris radius
  const auraPadding = 60;
  const auraSize = irisSize + auraPadding; // aura size = padding + iris size
  noStroke();
  let fadeProgress = (millis() - fadeStartTime) / (fadeInTime * 2000); // fade
  fadeProgress = constrain(fadeProgress, 0, 1); // opacity between 0% and 100%
  for (let i = 10; i > 0; i--) { // stacked aura layers
    const distance = i * 30; // increase layer distance
    const alpha = map(i, 50, 1, 3, 1); // alpha of layer
    fill(120, 255, 120, alpha * fadeProgress / 150);
    ellipse(eye.center.x, eye.center.y, auraSize + distance, auraSize + distance);
  }
  fill(irisColor.levels[0], irisColor.levels[1], irisColor.levels[2], fadeProgress * 255); // set iris color and fade
  ellipse(eye.center.x, eye.center.y, irisSize, irisSize);  // iris
  const pupilSize = irisSize / 8; // pupils = 1/8 of iris size
  const pupilX1 = eye.center.x + irisSize / 8; // x of pupil1
  const pupilY1 = eye.center.y - irisSize / 16; // y of pupil1
  const pupilX2 = eye.center.x + irisSize / 4;  // x of pupil2
  const pupilY2 = eye.center.y + irisSize / 8;  // y of pupil2
  fill(255);
  ellipse(pupilX1, pupilY1, pupilSize, pupilSize); // pupil1
  ellipse(pupilX2, pupilY2, pupilSize, pupilSize); // pupil2
}

class RandomNumber {
  constructor() {
    this.posX = random(width); // random x position
    this.posY = random(-50, 0); // random y position
    this.size = random(20, 30); // random number size
    this.number = random() > 0.5 ? "1" : "0"; // random 1 or 0
    this.velocityX = this.number === "1" ? random(-0.5, -1) : random(0.5, 1); // random horizontal velocity
    this.velocityY = this.size / 2 * 0.5; // vertical velocity
    this.isArt = random() < 0.05 && abs(this.posX - width / 2) < 100;  // 5% chance to be bug. near the center of screen
    this.transparent = false;
  }

  update(time) {
    this.posX += this.velocityX; // update x on horizontal velocity
    this.posY += this.velocityY; // update y on vertical velocity
    if (lastDetectedEye1 && lastDetectedEye2) { // both eyes seen
      if (this.checkCollisionWithEye(lastDetectedEye1) || this.checkCollisionWithEye(lastDetectedEye2)) { // check bug collisions
        if (this.isArt && !this.transparent) { // if bug's and not transparent
          popAudio.play(); // play when collision
          this.transparent = true; // make bug transparent
        }
      }
    }
    let dx = this.posX - headBoundary.centerX; // horizontal distance from head center
    let dy = this.posY - headBoundary.centerY; // vertical distance from head center
    let distance = sqrt(dx * dx + dy * dy); // distance from head center
    if (distance < headBoundary.radius) { // if  number is in head area
      let angle = atan2(dy, dx); // angle from  head center
      this.posX += cos(angle) * 3.5; // deflect x
      this.posY += sin(angle) * 3.5;  // deflect y
      this.velocityY += 0.05; // incease vertical velocity
    }
    if (this.posY > height) { // removes num if it falls past the display
      let index = randomNumbers.indexOf(this);
      randomNumbers.splice(index, 1);
    }
  }

  checkCollisionWithEye(eye) {
    let dx = this.posX - eye.center.x; // horizontal distance from eye center
    let dy = this.posY - eye.center.y; // vertical distance from eye center
    let distance = sqrt(dx * dx + dy * dy); // distance from eye center
    return distance < eye.center.dist(eye.top); // check if the number is in  eye's radius
  }

  display() {
    textSize(this.size);
    textAlign(CENTER, CENTER);
    textFont("monospace");
    push();
    translate(this.posX, this.posY);
    scale(-1, 1);
    if (this.transparent) { // if num is transparent
      fill(0, 0, 0, 0); // transparent
      text(this.isArt ? "ƸÏƷ" : this.number, 0, 0); // ascii bug
    } else if (this.isArt) {
      fill(0, 255, 255, 255);
      text("ƸÏƷ", 0, 0);
    } else { // if a num
      fill(120, 255, 120); // green
      text(this.number, 0, 0);
    }
    pop();
  }
}