let capture = null;
let tracker = null;
let positions = null;
let randomNumbers = [];
let snowStopped = true;
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
let clickedForText3 = false;
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
    fadeStartTime = millis();
    if (!audioStarted) {
        audio.loop();
        audio.setVolume(0.3);
        audioStarted = true;
    }
}

function draw() {
    if (!gameStarted) {
        showTitleScreen();
    } else {
        if (gameStartTime === null) {
            gameStartTime = millis();
        }
        background(0);
        translate(w, 0);
        scale(-1.0, 1.0);
        positions = tracker.getCurrentPosition();
        let elapsedGameTime = (millis() - gameStartTime) / 1000;
        if (elapsedGameTime < 5) snowStopped = false;
        if (!snowStopped) {
            for (let i = 0; i < random(5); i++) {
                randomNumbers.push(new RandomNumber());
            }
        }
        let eye1 = null;
        let eye2 = null;
        if (positions.length > 0) {
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
            eye1 = lastDetectedEye1;
            eye2 = lastDetectedEye2;
        }
        if (eye1 && eye2) {
            const eye2OffsetX = w * 0.2;
            eye2.outline = eye2.outline.map(p => createVector(p.x + eye2OffsetX, p.y));
            eye2.center = createVector(eye2.center.x + eye2OffsetX, eye2.center.y);
            eye2.top = createVector(eye2.top.x + eye2OffsetX, eye2.top.y);
            eye2.bottom = createVector(eye2.bottom.x + eye2OffsetX, eye2.bottom.y);
            for (let num of randomNumbers) {
                num.update(elapsedGameTime);
                num.display();
            }
            drawHeadWithoutEyes(eye1, eye2);
            drawHeadWithEyes(eye1, eye2, color(0, 0, 0));
        }
        if (timerStarted && millis() - startTimerTime >= 3000 && !textDisplayed) {
            displayNewText();
        }
    }
}

function showTitleScreen() {
    background(0);
    if (startTime1 === null) startTime1 = millis();
    let elapsedTime1 = millis() - startTime1;
    if (elapsedTime1 >= currentIndex1 * typingSpeed1 && currentIndex1 < text1.length && !audioStarted) {
        audio.play();
        audio.setVolume(0.3);
        audioStarted = true;
    }
    if (elapsedTime1 >= currentIndex1 * typingSpeed1 && currentIndex1 < text1.length) currentIndex1++;
    if (elapsedTime1 >= text1.length * typingSpeed1 + delayAfterFirstText && startTime2 === null) startTime2 = millis();
    let elapsedTime2 = millis() - startTime2;
    if (startTime2 !== null && elapsedTime2 >= currentIndex2 * typingSpeed2 && currentIndex2 < text2.length) currentIndex2++;
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(120, 255, 120);
    textFont("monospace");
    text(text1.substring(0, currentIndex1), w / 2, h / 2);
    textSize(30);
    fill(120, 255, 120);
    text(text2.substring(0, currentIndex2), w / 2, h / 2 + h / 4);
    if (currentIndex2 === text2.length && !audioEnded) {
        audio.stop();
        audioEnded = true;
        timerStarted = true;
        startTimerTime = millis();
        startTime3 = millis();
    }
}

function mousePressed() {
    if (!gameStarted) {
        if (currentIndex2 === text2.length) {
            gameStarted = true;
            if (!audioStarted) {
                audio.loop();
                audio.setVolume(0.3);
                audioStarted = true;
            }
            if (!musicAudioStarted) {
                musicAudio.loop();
                musicAudio.play();
                musicAudio.setVolume(0.5);
                musicAudioStarted = true;
            }
        }
    }
    if (!startText3 && currentIndex2 === text2.length) {
        startText3 = true;
        if (startTime3 === null) {
            startTime3 = millis();
        }
    }
}

function displayNewText() {
    if (startTime3 === null) {
        startTime3 = millis();
    }
    let elapsedTime3 = millis() - startTime3;
    if (elapsedTime3 >= currentIndex3 * typingSpeed3 && currentIndex3 < text3.length) {
        currentIndex3++;
    }
    if (elapsedTime3 >= currentIndex3 * typingSpeed3 && !audioStarted3 && currentIndex3 < text3.length) {
        audio.play();
        audio.setVolume(0.3);
        audioStarted3 = true;
    }
    if (currentIndex3 === text3.length && !audioEnded) {
        audio.stop();
        audioEnded = true;
    }
    let currentText = text3.substring(0, currentIndex3);
    let textWidthVal = textWidth(currentText);
    let topPadding = 80;
    let bottomPadding = 30;
    let textHeightVal = 50;
    let widthPadding = 80;
    if (boxWidth === null) {
        boxWidth = (textWidth(text3) + widthPadding * 2) * 0.5;
    }
    fill(0, 10);
    stroke(120, 255, 120);
    strokeWeight(2);
    rect(
    w / 2 - boxWidth / 2,
    h / 2 + h / 4 - textHeightVal / 2 - topPadding,
    boxWidth,
    textHeightVal + topPadding + bottomPadding
    );
    textSize(20);
    noStroke();
    textAlign(CENTER, BOTTOM);
    fill(120, 255, 120);
    textFont("monospace");
    push();
    scale(-1, 1);
    text(currentText, -w / 2, h / 2 + h / 4);
    pop();
}

function getPoint(index) {
    return createVector(positions[index][0], positions[index][1]);
}

function drawHeadWithoutEyes(eye1, eye2) {
    const centerX = (eye1.center.x + eye2.center.x) / 2;
    const centerY = (eye1.center.y + eye2.center.y) / 2;
    const distance = dist(eye1.center.x, eye1.center.y, eye2.center.x, eye2.center.y);
    const headRadius = distance * 1.5;
    headBoundary = { centerX, centerY, radius: headRadius / 2 };
    noStroke();
    fill(0, 0);
    ellipse(centerX, centerY, headRadius, headRadius);
}

function drawHeadWithEyes(eye1, eye2, irisColor) {
    const centerX = (eye1.center.x + eye2.center.x) / 2;
    const centerY = (eye1.center.y + eye2.center.y) / 2;
    const distance = dist(eye1.center.x, eye1.center.y, eye2.center.x, eye2.center.y);
    const headRadius = distance * 1.5;
    drawEye(eye1, irisColor);
    drawEye(eye2, irisColor);
}

function drawEye(eye, irisColor) {
    const irisRadius = min(eye.center.dist(eye.top), eye.center.dist(eye.bottom));
    const irisSize = irisRadius * 10;
    const auraPadding = 60;
    const auraSize = irisSize + auraPadding;
    noStroke();
    let fadeProgress = (millis() - fadeStartTime) / (fadeInTime * 2000);
    fadeProgress = constrain(fadeProgress, 0, 1);
    for (let i = 10; i > 0; i--) {
        const distance = i * 30;
        const alpha = map(i, 50, 1, 3, 1);
        fill(120, 255, 120, alpha * fadeProgress / 150);
        ellipse(eye.center.x, eye.center.y, auraSize + distance, auraSize + distance);
    }
    fill(irisColor.levels[0], irisColor.levels[1], irisColor.levels[2], fadeProgress * 255);
    ellipse(eye.center.x, eye.center.y, irisSize, irisSize);
    const pupilSize = irisSize / 8;
    const pupilX1 = eye.center.x + irisSize / 8;
    const pupilY1 = eye.center.y - irisSize / 16;
    const pupilX2 = eye.center.x + irisSize / 4;
    const pupilY2 = eye.center.y + irisSize / 8;
    fill(255);
    ellipse(pupilX1, pupilY1, pupilSize, pupilSize);
    ellipse(pupilX2, pupilY2, pupilSize, pupilSize);
}

class RandomNumber {
    constructor() {
        this.posX = random(width);
        this.posY = random(-50, 0);
        this.size = random(20, 30);
        this.number = random() > 0.5 ? "1" : "0";
        this.velocityX = this.number === "1" ? random(-0.5, -1) : random(0.5, 1);
        this.velocityY = this.size / 2 * 0.5;
        this.isArt = random() < 0.05 && abs(this.posX - width / 2) < 100;
        this.transparent = false;
    }
    update(time) {
        this.posX += this.velocityX;
        this.posY += this.velocityY;
        if (lastDetectedEye1 && lastDetectedEye2) {
            if (this.checkCollisionWithEye(lastDetectedEye1) || this.checkCollisionWithEye(lastDetectedEye2)) {
                if (this.isArt && !this.transparent) {
                    popAudio.play();
                    this.transparent = true;
                }
            }
        }
        let dx = this.posX - headBoundary.centerX;
        let dy = this.posY - headBoundary.centerY;
        let distance = sqrt(dx * dx + dy * dy);
        if (distance < headBoundary.radius) {
            let angle = atan2(dy, dx);
            let deflection = 3.5;
            this.posX += cos(angle) * deflection;
            this.posY += sin(angle) * deflection;
            this.velocityY += 0.05;
        }
        if (this.posY > height) {
            let index = randomNumbers.indexOf(this);
            randomNumbers.splice(index, 1);
        }
    }
    checkCollisionWithEye(eye) {
        let dx = this.posX - eye.center.x;
        let dy = this.posY - eye.center.y;
        let distance = sqrt(dx * dx + dy * dy);
        return distance < eye.center.dist(eye.top);
    }
    display() {
        textSize(this.size);
        textAlign(CENTER, CENTER);
        textFont("monospace");
        push();
        translate(this.posX, this.posY);
        scale(-1, 1);
        if (this.transparent) {
            fill(0, 0, 0, 0);
            text(this.isArt ? "ƸÏƷ" : this.number, 0, 0);
        } else if (this.isArt) {
            fill(0, 255, 255, 255);
            text("ƸÏƷ", 0, 0);
        } else {
            fill(120, 255, 120);
            text(this.number, 0, 0);
        }
        pop();
    }
}